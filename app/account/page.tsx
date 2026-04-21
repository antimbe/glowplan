"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Heart,
  User,
  Star,
  Loader2,
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
import { motion, AnimatePresence } from "framer-motion";

const TABS: { key: AccountTab; label: string; icon: React.ElementType }[] = [
  { key: "reservations", label: "Réservations", icon: Calendar },
  { key: "favorites",    label: "Favoris",       icon: Heart },
  { key: "reviews",      label: "Avis",           icon: Star },
  { key: "profile",      label: "Profil",         icon: User },
];

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
      await cancelAppointment(cancelModal.id, cancelReason || null);
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
      <div className="min-h-screen bg-gradient-to-br from-[#f4f3ef] to-[#edf0ea] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-primary/40 text-sm font-bold tracking-wider uppercase">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ef] via-[#f0eeea] to-[#edf0ea]">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#c0a062]/[0.03] blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <Header />

      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">

          {/* Account Header */}
          <AccountHeader
            firstName={profile?.first_name || ""}
            lastName={profile?.last_name || ""}
            email={user?.email}
            onSignOut={signOut}
            appointmentsCount={appointments.length}
            favoritesCount={favorites.length}
            reviewsCount={reviews.length}
          />

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100/80 mb-4 p-1.5 overflow-x-auto"
          >
            <div className="flex gap-1 min-w-max sm:min-w-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer flex-1 whitespace-nowrap",
                      isActive
                        ? "text-white shadow-md"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-gradient-to-br from-[#2a3820] to-[#32422c] rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <tab.icon size={15} className={isActive ? "text-[#c0a062]" : ""} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 md:p-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
              >
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
                    saving={saving}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

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
