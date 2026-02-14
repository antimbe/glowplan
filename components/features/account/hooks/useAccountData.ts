"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ClientProfile, Appointment, Favorite, Review, AccountTab } from "../types";

interface UseAccountDataReturn {
  loading: boolean;
  user: User | null;
  profile: ClientProfile | null;
  appointments: Appointment[];
  favorites: Favorite[];
  reviews: Review[];
  activeTab: AccountTab;
  setActiveTab: (tab: AccountTab) => void;
  loadData: () => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  addReview: (data: { appointment_id: string; establishment_id: string; rating: number; comment: string | null }) => Promise<void>;
  updateProfile: (data: Partial<ClientProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  cancelling: string | null;
  saving: boolean;
}

export function useAccountData(): UseAccountDataReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>("reservations");
  const [user, setUser] = useState<User | null>(null);
  const lastRequestId = useRef(0);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    const requestId = ++lastRequestId.current;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/client/login");
        return;
      }
      setUser(user);

      // Load profile first to get IDs for other queries
      const { data: profileData } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (requestId !== lastRequestId.current) return;

      if (profileData) {
        setProfile(profileData);

        // Load appointments, favorites and reviews in parallel
        const [
          { data: appointmentsData },
          { data: favoritesData },
          { data: reviewsData }
        ] = await Promise.all([
          supabase.from("appointments").select(`
            id, start_time, end_time, status, notes, establishment_id,
            establishments(id, name, city),
            services(name, price, duration)
          `).eq("client_profile_id", profileData.id).order("start_time", { ascending: false }),
          supabase.from("favorites").select(`
            id, establishment_id,
            establishments(id, name, city, main_photo_url, activity_sectors)
          `).eq("user_id", user.id),
          supabase.from("reviews").select(`
            id, rating, comment, created_at, establishment_id,
            establishments(id, name, city)
          `).eq("client_profile_id", profileData.id).order("created_at", { ascending: false })
        ]);

        // Check which appointments have reviews (already loaded appointmentsData)
        if (appointmentsData) {
          // This one is still a bit of a waterfall because of nested review checks
          // but at least the main query is parallelized.
          const appointmentsWithReviewStatus = await Promise.all(
            appointmentsData.map(async (apt: any) => {
              const { data: reviewData } = await supabase
                .from("reviews")
                .select("id")
                .eq("appointment_id", apt.id)
                .single();
              return { ...apt, has_review: !!reviewData };
            })
          );
          setAppointments(appointmentsWithReviewStatus as unknown as Appointment[]);
        }

        setFavorites((favoritesData || []) as unknown as Favorite[]);
        setReviews((reviewsData || []) as unknown as Review[]);
      }
    } catch (error) {
      console.error("Error loading account data:", error);
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  const cancelAppointment = async (appointmentId: string) => {
    setCancelling(appointmentId);
    try {
      await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });
      await loadData();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setCancelling(null);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      await supabase.from("favorites").delete().eq("id", favoriteId);
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const addReview = async (data: { appointment_id: string; establishment_id: string; rating: number; comment: string | null }) => {
    if (!profile) return;
    try {
      const { error } = await supabase.from("reviews").insert({
        ...data,
        client_profile_id: profile.id,
        client_name: `${profile.first_name} ${profile.last_name}`,
        is_verified: true,
        is_visible: true,
      });

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await supabase.from("reviews").delete().eq("id", reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const updateProfile = async (data: Partial<ClientProfile>) => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("client_profiles")
        .update(data)
        .eq("id", profile.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...data } : null);
      }
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
  };
}
