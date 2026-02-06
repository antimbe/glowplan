"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/features/Header";
import { Calendar, Heart, User, MapPin, Clock, Check, X, Loader2, Mail, Phone, Instagram, LogOut, Star, MessageSquare, Trash2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  instagram: string | null;
  cancellation_count: number;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  establishment_id: string;
  establishments: {
    id: string;
    name: string;
    city: string;
  } | null;
  services: {
    name: string;
    price: number;
    duration: number;
  } | null;
  has_review?: boolean;
}

interface Favorite {
  id: string;
  establishment_id: string;
  establishments: {
    id: string;
    name: string;
    city: string;
    main_photo_url: string | null;
    activity_sectors: string[];
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  establishment_id: string;
  establishments: {
    id: string;
    name: string;
    city: string;
  } | null;
}

type Tab = "reservations" | "favorites" | "reviews" | "profile";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("reservations");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedAppointments, setReviewedAppointments] = useState<Set<string>>(new Set());

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/client/login");
      return;
    }

    setUser(user);

    // Check if user is a client
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!clientProfile) {
      // Not a client, redirect to pro dashboard or login
      router.push("/auth/select-space");
      return;
    }

    setProfile(clientProfile);
    setFirstName(clientProfile.first_name);
    setLastName(clientProfile.last_name);
    setPhone(clientProfile.phone || "");
    setInstagram(clientProfile.instagram || "");

    await loadData(clientProfile.id);
    setLoading(false);
  };

  const loadData = async (clientId: string) => {
    // Load appointments
    const { data: appointmentsData } = await supabase
      .from("appointments")
      .select(`
        id, start_time, end_time, status, notes, establishment_id,
        establishments(id, name, city),
        services(name, price, duration)
      `)
      .eq("client_profile_id", clientId)
      .order("start_time", { ascending: false });

    // Load reviews to check which appointments have been reviewed
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("appointment_id")
      .eq("client_profile_id", clientId);

    const reviewedIds = new Set((reviewsData || []).map(r => r.appointment_id).filter(Boolean));
    setReviewedAppointments(reviewedIds as Set<string>);

    setAppointments((appointmentsData || []) as unknown as Appointment[]);

    // Load favorites
    const { data: favoritesData } = await supabase
      .from("favorites")
      .select(`
        id, establishment_id,
        establishments(id, name, city, main_photo_url, activity_sectors)
      `)
      .eq("client_id", clientId);

    setFavorites((favoritesData || []) as unknown as Favorite[]);

    // Load user reviews
    const { data: userReviewsData } = await supabase
      .from("reviews")
      .select(`
        id, rating, comment, created_at, establishment_id,
        establishments(id, name, city)
      `)
      .eq("client_profile_id", clientId)
      .order("created_at", { ascending: false });

    setReviews((userReviewsData || []) as unknown as Review[]);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!profile) return;
    
    setCancelling(appointmentId);
    try {
      // Update appointment status
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancelled_by_client: true,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);

      if (error) throw error;

      // Increment cancellation count
      await supabase
        .from("client_profiles")
        .update({ cancellation_count: (profile.cancellation_count || 0) + 1 })
        .eq("id", profile.id);

      // Send notification to establishment
      await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      // Refresh data
      await loadData(profile.id);
      setProfile({ ...profile, cancellation_count: (profile.cancellation_count || 0) + 1 });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setCancelling(null);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!profile) return;

    try {
      await supabase.from("favorites").delete().eq("id", favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!profile) return;

    setDeletingReview(reviewId);
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setDeletingReview(null);
    }
  };

  const handleOpenReviewModal = (apt: Appointment) => {
    setReviewModal(apt);
    setReviewRating(5);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!profile || !reviewModal) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        establishment_id: reviewModal.establishment_id,
        client_profile_id: profile.id,
        appointment_id: reviewModal.id,
        rating: reviewRating,
        comment: reviewComment || null,
        client_name: `${profile.first_name} ${profile.last_name}`,
        is_verified: true,
        is_visible: true,
      });

      if (error) throw error;

      setReviewedAppointments(prev => new Set([...prev, reviewModal.id]));
      setReviewModal(null);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("client_profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          instagram: instagram || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, first_name: firstName, last_name: lastName, phone, instagram });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const upcomingAppointments = appointments.filter(
    a => new Date(a.start_time) > new Date() && a.status !== "cancelled"
  );
  const pastAppointments = appointments.filter(
    a => new Date(a.start_time) <= new Date() || a.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {profile?.first_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 mb-6">
            <div className="flex border-b border-gray-100">
              {[
                { key: "reservations", label: "Mes réservations", icon: Calendar },
                { key: "favorites", label: "Mes favoris", icon: Heart },
                { key: "reviews", label: "Mes avis", icon: Star },
                { key: "profile", label: "Mon profil", icon: User },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as Tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors cursor-pointer",
                    activeTab === tab.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <tab.icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Reservations Tab */}
              {activeTab === "reservations" && (
                <div>
                  {upcomingAppointments.length > 0 && (
                    <>
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Réservations à venir</h2>
                      <div className="space-y-4 mb-8">
                        {upcomingAppointments.map((apt) => (
                          <div key={apt.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{apt.establishments?.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{apt.services?.name}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} className="flex-shrink-0" />
                                    <span className="truncate">{formatDate(apt.start_time)}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} className="flex-shrink-0" />
                                    {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                                  </span>
                                  <span className="hidden sm:inline">({apt.services?.duration} min)</span>
                                </div>
                                <div className="mt-2">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                                    apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                                    apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-700"
                                  )}>
                                    <Check size={12} />
                                    {apt.status === "confirmed" ? "RDV Confirmé" : 
                                     apt.status === "pending" ? "En attente" : apt.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                <p className="text-lg font-bold text-primary">{apt.services?.price}€</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  disabled={cancelling === apt.id}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  {cancelling === apt.id ? "Annulation..." : "Annuler"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {pastAppointments.length > 0 && (
                    <>
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Historique</h2>
                      <div className="space-y-4">
                        {pastAppointments.map((apt) => {
                          const canReview = apt.status !== "cancelled" && !reviewedAppointments.has(apt.id);
                          const hasReviewed = reviewedAppointments.has(apt.id);
                          return (
                            <div key={apt.id} className={cn(
                              "border rounded-xl p-4",
                              apt.status === "cancelled" ? "border-red-200 bg-red-50/50" : "border-gray-200"
                            )}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">{apt.establishments?.name}</h3>
                                  <p className="text-sm text-gray-500 truncate">{apt.services?.name}</p>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                                    <span>{formatDate(apt.start_time)}</span>
                                    <span>{formatTime(apt.start_time)}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {apt.status === "cancelled" && (
                                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                        <X size={12} />
                                        Annulé
                                      </span>
                                    )}
                                    {hasReviewed && (
                                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        <Check size={12} />
                                        Avis laissé
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                  <p className="text-lg font-bold text-gray-400">{apt.services?.price}€</p>
                                  {canReview && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenReviewModal(apt)}
                                      className="text-primary hover:text-primary-dark hover:bg-primary/5"
                                    >
                                      <Star size={14} className="mr-1" />
                                      Laisser un avis
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {appointments.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réservation</h3>
                      <p className="text-gray-500 mb-4">Vous n'avez pas encore de réservation</p>
                      <Link href="/search">
                        <Button variant="primary" className="cursor-pointer">
                          Trouver un établissement
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === "favorites" && (
                <div>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favorites.map((fav) => (
                        <div key={fav.id} className="border border-gray-200 rounded-xl overflow-hidden group">
                          <div className="relative h-32">
                            {fav.establishments?.main_photo_url ? (
                              <img
                                src={fav.establishments.main_photo_url}
                                alt={fav.establishments.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <Heart size={32} className="text-primary/30" />
                              </div>
                            )}
                            <button
                              onClick={() => handleRemoveFavorite(fav.id)}
                              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 cursor-pointer"
                            >
                              <Heart size={16} className="text-red-500 fill-red-500" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900">{fav.establishments?.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin size={14} />
                              <span>{fav.establishments?.city}</span>
                            </div>
                            <Link href={`/establishment/${fav.establishment_id}`}>
                              <Button variant="outline" size="sm" className="w-full mt-3 cursor-pointer">
                                Voir l'établissement
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
                      <p className="text-gray-500 mb-4">Ajoutez des établissements à vos favoris</p>
                      <Link href="/search">
                        <Button variant="primary" className="cursor-pointer">
                          Explorer les établissements
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Link href={`/establishment/${review.establishment_id}`}>
                                <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer">
                                  {review.establishments?.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <MapPin size={14} />
                                <span>{review.establishments?.city}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={cn(
                                    star <= review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-gray-400 text-xs">
                              Publié le {formatDate(review.created_at)}
                            </p>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deletingReview === review.id}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {deletingReview === review.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis</h3>
                      <p className="text-gray-500 mb-4">Vous n'avez pas encore laissé d'avis</p>
                      <Link href="/search">
                        <Button variant="primary" className="cursor-pointer">
                          Trouver un établissement
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="max-w-md">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          value={user?.email || ""}
                          disabled
                          className="w-full pl-10 bg-gray-50"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="06 12 34 56 78"
                          className="w-full pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <div className="relative">
                        <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="@votre_instagram"
                          className="w-full pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="w-full cursor-pointer"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          Enregistrement...
                        </span>
                      ) : (
                        "Enregistrer les modifications"
                      )}
                    </Button>

                    <div className="pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut size={18} />
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Laisser un avis</h2>
            <p className="text-gray-500 text-sm mb-6">
              {reviewModal.establishments?.name} - {reviewModal.services?.name}
            </p>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={cn(
                        star <= reviewRating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire (optionnel)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setReviewModal(null)}
                className="flex-1 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 cursor-pointer"
              >
                {submittingReview ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Envoi...
                  </span>
                ) : (
                  "Publier l'avis"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
