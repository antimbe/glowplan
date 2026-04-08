"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AccountTab, Appointment, Favorite, Review, ClientProfile } from "../types";

export interface UseAccountDataReturn {
  loading: boolean;
  user: User | null;
  profile: ClientProfile | null;
  appointments: Appointment[];
  favorites: Favorite[];
  reviews: Review[];
  activeTab: AccountTab;
  setActiveTab: (tab: AccountTab) => void;
  loadData: () => Promise<void>;
  cancelAppointment: (appointmentId: string, reason?: string | null) => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  addReview: (data: { appointment_id: string; establishment_id: string; rating: number; comment: string | null }) => Promise<void>;
  updateProfile: (data: Partial<ClientProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  cancelling: string | null;
  saving: boolean;
  submittingReview: boolean;
  deletingReview: string | null;
}

export function useAccountData(): UseAccountDataReturn {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<AccountTab>("reservations");

  const [cancelling, setCancelling] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const lastLoadId = useRef(0);

  const loadData = useCallback(async () => {
    const requestId = ++lastLoadId.current;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      if (requestId === lastLoadId.current) {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    if (requestId === lastLoadId.current) {
      setUser(authUser);
    }

    const profileRes = await supabase.from("client_profiles").select("*").eq("user_id", authUser.id).single();

    if (requestId !== lastLoadId.current) return;

    if (profileRes.data) {
      if (profileRes.data.user_type === "professional") {
        router.push("/dashboard");
        return;
      }

      setProfile(profileRes.data);

      const [appointmentsRes, favoritesRes, reviewsRes] = await Promise.all([
        supabase.from("appointments")
          .select(`
            *,
            establishments(name, city),
            services(name, price, duration)
          `)
          .eq("client_profile_id", profileRes.data.id)
          .order("start_time", { ascending: false }),
        supabase.from("favorites")
          .select("*, establishments(name, city, main_photo_url)")
          .eq("client_id", profileRes.data.id),
        supabase.from("reviews")
          .select("*, establishments(name, city)")
          .eq("client_profile_id", profileRes.data.id)
          .order("created_at", { ascending: false })
      ]);

      if (requestId === lastLoadId.current) {
        const reviewsData = reviewsRes.data || [];
        const appointmentsData = (appointmentsRes.data || []).map(apt => ({
          ...apt,
          has_review: reviewsData.some(r => r.appointment_id === apt.id)
        }));

        setAppointments(appointmentsData);
        setFavorites(favoritesRes.data || []);
        setReviews(reviewsData);
        setLoading(false);
      }
    } else {
      if (requestId === lastLoadId.current) {
        setLoading(false);
      }
    }
  }, [supabase]);

  const cancelAppointment = async (appointmentId: string, reason?: string | null) => {
    setCancelling(appointmentId);
    try {
      const response = await fetch("/api/booking/cancel-by-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, reason: reason || null }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to cancel appointment");
      }

      await loadData();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setCancelling(null);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setDeletingReview(reviewId);
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setDeletingReview(null);
    }
  };

  const addReview = async (data: { appointment_id: string; establishment_id: string; rating: number; comment: string | null }) => {
    if (!profile) return;
    setSubmittingReview(true);
    try {
      const { data: insertedReview, error } = await supabase
        .from("reviews")
        .insert({
          client_profile_id: profile.id,
          establishment_id: data.establishment_id,
          appointment_id: data.appointment_id,
          rating: data.rating,
          comment: data.comment,
        }).select("id").single();

      if (error) throw error;
      
      if (insertedReview) {
        // Trigger email notification to pro without blocking UI
        fetch("/api/reviews/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "new_review", reviewId: insertedReview.id })
        }).catch(err => console.error("Could not send new review notification", err));
      }

      await loadData();
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const updateProfile = async (data: Partial<ClientProfile>) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("client_profiles")
        .update(data)
        .eq("user_id", user.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    user,
    profile,
    appointments,
    favorites,
    reviews,
    activeTab,
    setActiveTab,
    loadData,
    cancelAppointment,
    removeFavorite,
    deleteReview,
    addReview,
    updateProfile,
    signOut,
    cancelling,
    saving,
    submittingReview,
    deletingReview,
  };
}
