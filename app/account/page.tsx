"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Heart,
  User,
  Star,
  Loader2,
  Mail,
  Phone,
  Instagram,
  LogOut,
  Trash2,
  Clock,
  Check,
  X,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Header from "@/components/features/Header";
import { MONTHS_LOWER, formatTime as formatTimeUtil } from "@/lib/utils/formatters";
import { useAccountData } from "@/components/features/account/hooks/useAccountData";
import { AccountTab, Appointment } from "@/components/features/account/types";
import { AccountHeader } from "@/components/features/account/AccountHeader";
import { AppointmentsTab } from "@/components/features/account/AppointmentsTab";
import { FavoritesTab } from "@/components/features/account/FavoritesTab";
import { ReviewsTab } from "@/components/features/account/ReviewsTab";
import { ProfileTab } from "@/components/features/account/ProfileTab";
import { ReviewModal } from "@/components/features/account/ReviewModal";
import { CancelModal } from "@/components/features/account/CancelModal";

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
    submittingReview,
    deletingReview,
  } = useAccountData();

  // Local state for forms and modals
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  const [cancelModal, setCancelModal] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [reviewModal, setReviewModal] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setInstagram(profile.instagram || "");
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      instagram: instagram || null,
    });
  };

  const handleCancelAppointment = async () => {
    if (cancelModal) {
      await cancelAppointment(cancelModal.id);
      setCancelModal(null);
      setCancelReason("");
    }
  };

  const handleSubmitReview = async () => {
    if (reviewModal) {
      await addReview({
        appointment_id: reviewModal.id,
        establishment_id: reviewModal.establishment_id,
        rating: reviewRating,
        comment: reviewComment || null,
      });
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment("");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS_LOWER[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatTimeUtil(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <AccountHeader
            firstName={profile?.first_name || ""}
            lastName={profile?.last_name || ""}
            email={user?.email}
          />

          <div className="bg-white rounded-2xl border border-gray-100 mb-6 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50/30">
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
                    "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all cursor-pointer border-b-2",
                    activeTab === tab.key
                      ? "text-primary border-primary bg-white shadow-[0_-4px_0_inset_currentColor]"
                      : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
                  )}
                >
                  <tab.icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "reservations" && (
                <AppointmentsTab
                  appointments={appointments}
                  onCancelClick={setCancelModal}
                  onReviewClick={(apt) => {
                    setReviewModal(apt);
                    setReviewRating(5);
                    setReviewComment("");
                  }}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              )}

              {activeTab === "favorites" && (
                <FavoritesTab
                  favorites={favorites}
                  onRemove={removeFavorite}
                />
              )}

              {activeTab === "reviews" && (
                <ReviewsTab
                  reviews={reviews}
                  onDelete={deleteReview}
                  deletingId={deletingReview}
                  formatDate={formatDate}
                />
              )}

              {activeTab === "profile" && (
                <ProfileTab
                  email={user?.email}
                  firstName={firstName}
                  setFirstName={setFirstName}
                  lastName={lastName}
                  setLastName={setLastName}
                  phone={phone}
                  setPhone={setPhone}
                  instagram={instagram}
                  setInstagram={setInstagram}
                  onSave={handleUpdateProfile}
                  onSignOut={signOut}
                  saving={saving}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {reviewModal && (
        <ReviewModal
          appointment={reviewModal}
          rating={reviewRating}
          setRating={setReviewRating}
          comment={reviewComment}
          setComment={setReviewComment}
          onClose={() => setReviewModal(null)}
          onSubmit={handleSubmitReview}
          submitting={submittingReview}
        />
      )}

      {cancelModal && (
        <CancelModal
          appointment={cancelModal}
          reason={cancelReason}
          setReason={setCancelReason}
          onClose={() => {
            setCancelModal(null);
            setCancelReason("");
          }}
          onConfirm={handleCancelAppointment}
          cancelling={!!cancelling}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}
