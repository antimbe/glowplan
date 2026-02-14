"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/features/Header";
import { Calendar, Heart, User, MapPin, Clock, Check, X, Loader2, Mail, Phone, Instagram, LogOut, Star, MessageSquare, Trash2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { DAYS_JS, MONTHS_LOWER, formatTime as formatTimeUtil } from "@/lib/utils/formatters";
import Link from "next/link";

import { useAccountData } from "@/components/features/account/hooks/useAccountData";
import { ClientProfile, Appointment, Favorite, Review, AccountTab } from "@/components/features/account/types";

export default function AccountPage() {
  const {
    loading,
    user,
    profile,
    appointments,
    favorites,
    reviews,
    activeTab,
    setActiveTab,
    cancelAppointment,
    removeFavorite,
    deleteReview,
    addReview,
    updateProfile,
    signOut,
    cancelling,
    saving,
  } = useAccountData();

  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelModal, setCancelModal] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone || "");
      setInstagram(profile.instagram || "");
    }
  }, [profile]);

  const handleCancelAppointment = async () => {
    if (!cancelModal) return;
    await cancelAppointment(cancelModal.id);
    setCancelModal(null);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await removeFavorite(favoriteId);
  };

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReview(reviewId);
    await deleteReview(reviewId);
    setDeletingReview(null);
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
      await addReview({
        appointment_id: reviewModal.id,
        establishment_id: reviewModal.establishment_id,
        rating: reviewRating,
        comment: reviewComment || null,
      });
      setReviewModal(null);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateProfile = async () => {
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      instagram: instagram || null,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS_LOWER[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatTimeUtil(date);
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
                  onClick={() => setActiveTab(tab.key as AccountTab)}
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
                                  onClick={() => setCancelModal(apt)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  Annuler
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
                          const canReview = apt.status !== "cancelled" && !apt.has_review;
                          const hasReviewed = apt.has_review;
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
                                    {apt.has_review && (
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
                        onClick={signOut}
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

      {/* Modal d'annulation */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Annuler la réservation</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir annuler votre rendez-vous chez <strong>{cancelModal.establishments?.name}</strong> ?
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar size={14} />
                <span>{formatDate(cancelModal.start_time)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} />
                <span>{formatTime(cancelModal.start_time)}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2">{cancelModal.services?.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de l&apos;annulation <span className="text-gray-400">(optionnel)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Indiquez la raison de votre annulation..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason("");
                }}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelAppointment}
                disabled={cancelling === cancelModal.id}
                className="flex-1"
              >
                {cancelling === cancelModal.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Annulation...
                  </span>
                ) : (
                  "Confirmer l'annulation"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
