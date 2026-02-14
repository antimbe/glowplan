"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Clock, Phone, Mail, ChevronLeft, Star, Calendar, Check, ArrowRight, Instagram, User, FileText, Heart, UserPlus, LogIn, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { DAYS_JS, DAYS_JS_SHORT, DAYS_DB, MONTHS, jsDayToDbDay } from "@/lib/utils/formatters";

import { BookingTunnel } from "@/components/features/booking/BookingTunnel";
import { Service, OpeningHour, ClientInfo, BookingStep, AvailableSlot } from "@/components/features/booking/types";
import { EstablishmentReviews } from "@/components/features/establishment/EstablishmentReviews";
import { EstablishmentSidebar } from "@/components/features/establishment/EstablishmentSidebar";

import { Establishment, Review } from "@/components/features/establishment/types";


import { useBooking } from "@/components/features/booking/hooks/useBooking";

export default function EstablishmentPage() {
  const params = useParams();
  const router = useRouter();
  const establishmentId = params.id as string;

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<BookingStep>("info");

  const {
    selectedService,
    setSelectedService,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    loadingSlots,
  } = useBooking(establishmentId, openingHours);

  const [submitting, setSubmitting] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    instagram: "",
    notes: "",
  });

  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [blockedError, setBlockedError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (establishmentId) {
      loadEstablishment();
      loadClientProfile();
    }
  }, [establishmentId]);

  const loadClientProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (clientProfile) {
      setClientProfileId(clientProfile.id);
      // Ne pas pré-remplir si le prénom est "Client" (valeur par défaut des comptes migrés)
      const isDefaultName = clientProfile.first_name === "Client" && !clientProfile.last_name;
      setClientInfo({
        firstName: isDefaultName ? "" : (clientProfile.first_name || ""),
        lastName: clientProfile.last_name || "",
        email: user.email || "",
        phone: clientProfile.phone || "",
        instagram: clientProfile.instagram || "",
        notes: "",
      });

      // Vérifier si l'établissement est en favoris
      const { data: favoriteData } = await supabase
        .from("favorites")
        .select("id")
        .eq("client_id", clientProfile.id)
        .eq("establishment_id", establishmentId)
        .single();

      setIsFavorite(!!favoriteData);

      // Vérifier si le client a déjà laissé un avis
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("client_profile_id", clientProfile.id)
        .eq("establishment_id", establishmentId)
        .single();

      setHasAlreadyReviewed(!!existingReview);
    }
  };

  const handleOpenReviewModal = () => {
    if (!clientProfileId) {
      setShowLoginPrompt(true);
      return;
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!clientProfileId || reviewRating === 0) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        establishment_id: establishmentId,
        client_profile_id: clientProfileId,
        rating: reviewRating,
        comment: reviewComment || null,
        client_name: `${clientInfo.firstName} ${clientInfo.lastName}`,
        is_visible: true,
        is_verified: false,
      });

      if (error) throw error;

      // Recharger les avis
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, client_name, created_at,
          client_profiles(first_name, last_name)
        `)
        .eq("establishment_id", establishmentId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData as unknown as Review[]);
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment("");
      setHasAlreadyReviewed(true);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleFavorite = async () => {
    // Si pas connecté en tant que client, afficher le prompt de connexion
    if (!clientProfileId) {
      setShowLoginPrompt(true);
      return;
    }

    setTogglingFavorite(true);
    try {
      if (isFavorite) {
        // Retirer des favoris
        await supabase
          .from("favorites")
          .delete()
          .eq("client_id", clientProfileId)
          .eq("establishment_id", establishmentId);
        setIsFavorite(false);
      } else {
        // Ajouter aux favoris
        const { error } = await supabase.from("favorites").insert({
          client_id: clientProfileId,
          establishment_id: establishmentId,
        });
        if (error) {
          console.error("Error adding favorite:", error);
          return;
        }
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const loadEstablishment = async () => {
    setLoading(true);
    try {
      const { data: estData, error: estError } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", establishmentId)
        .eq("is_profile_complete", true)
        .single();

      if (estError || !estData) {
        router.push("/");
        return;
      }
      setEstablishment(estData);

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true)
        .order("position");

      setServices(servicesData || []);

      const { data: hoursData } = await supabase
        .from("opening_hours")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("day_of_week");

      if (hoursData) {
        const normalized = hoursData.map(h => ({
          ...h,
          open_time: h.open_time?.substring(0, 5) || null,
          close_time: h.close_time?.substring(0, 5) || null,
          break_start: h.break_start?.substring(0, 5) || null,
          break_end: h.break_end?.substring(0, 5) || null,
        }));
        setOpeningHours(normalized);
      }

      // Load reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, client_name, created_at,
          client_profiles(first_name, last_name)
        `)
        .eq("establishment_id", establishmentId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (reviewsData && reviewsData.length > 0) {
        setReviews(reviewsData as unknown as Review[]);
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setReviews([]);
        setAverageRating(null);
      }
    } catch (error) {
      console.error("Error loading establishment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep("datetime");
  };

  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep("recap");
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedSlot || !establishment) return;

    if (!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone) {
      return;
    }

    setSubmitting(true);
    try {
      // Vérifier si le client est bloqué par cet établissement
      if (clientProfileId) {
        const { data: blockedData } = await supabase
          .from("blocked_clients")
          .select("id")
          .eq("establishment_id", establishmentId)
          .eq("client_profile_id", clientProfileId)
          .single();

        if (blockedData) {
          setBlockedError(true);
          setSubmitting(false);
          return;
        }
      }

      const startTime = selectedSlot.date;
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);

      const { data: appointmentData, error } = await supabase.from("appointments").insert({
        establishment_id: establishmentId,
        service_id: selectedService.id,
        client_profile_id: clientProfileId || null,
        client_first_name: clientInfo.firstName,
        client_last_name: clientInfo.lastName,
        client_name: `${clientInfo.firstName} ${clientInfo.lastName}`,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        client_instagram: clientInfo.instagram || null,
        notes: clientInfo.notes || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: establishment.auto_confirm_appointments ? "confirmed" : "pending",
        is_manual: false,
      }).select().single();

      if (error) throw error;

      // Mettre à jour le profil client si les infos ont changé (pour les comptes migrés)
      if (clientProfileId) {
        await supabase
          .from("client_profiles")
          .update({
            first_name: clientInfo.firstName,
            last_name: clientInfo.lastName,
            phone: clientInfo.phone || null,
            instagram: clientInfo.instagram || null,
          })
          .eq("id", clientProfileId);
      }

      // Send notification emails via API route
      await fetch("/api/booking/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointmentData.id,
          establishmentId,
          autoConfirm: establishment.auto_confirm_appointments,
        }),
      });

      setStep("confirmation");
    } catch (error) {
      console.error("Error submitting booking:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Établissement non trouvé</p>
      </div>
    );
  }

  // Si hide_exact_address est activé, n'afficher que la ville
  const fullAddress = establishment.hide_exact_address
    ? establishment.city || ""
    : [establishment.address, establishment.postal_code, establishment.city]
      .filter(Boolean)
      .join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-primary"
          >
            <ChevronLeft size={20} />
            <span>Retour à la recherche</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Hero Image */}
            {establishment.main_photo_url && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <img
                  src={establishment.main_photo_url}
                  alt={establishment.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">À propos</h2>
              <p className="text-gray-600 leading-relaxed">
                {establishment.description || "Aucune description disponible."}
              </p>

              {establishment.activity_sectors?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Expertises</h3>
                  <div className="flex flex-wrap gap-2">
                    {establishment.activity_sectors.map((sector, idx) => (
                      <span key={idx} className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <EstablishmentReviews
              reviews={reviews}
              averageRating={averageRating}
              hasAlreadyReviewed={hasAlreadyReviewed}
              handleOpenReviewModal={handleOpenReviewModal}
            />

            <BookingTunnel
              step={step}
              setStep={setStep}
              services={services}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              availableSlots={availableSlots}
              loadingSlots={loadingSlots}
              clientInfo={clientInfo}
              setClientInfo={setClientInfo}
              clientProfileId={clientProfileId}
              submitting={submitting}
              handleSubmitBooking={handleSubmitBooking}
              blockedError={blockedError}
              establishment={establishment}
              openingHours={openingHours}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <EstablishmentSidebar
              establishment={establishment}
              averageRating={averageRating}
              reviewCount={reviews.length}
              fullAddress={fullAddress}
              openingHours={openingHours}
              isFavorite={isFavorite}
              togglingFavorite={togglingFavorite}
              handleToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </div>

      {/* Login Prompt Modal for Favorites */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Heart size={40} className="text-red-500 fill-red-500/20" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Sauvegardez vos pépites</h2>
              <p className="text-gray-500">Connectez-vous pour ajouter cet établissement à vos favoris.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/auth/client/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full">
                <Button variant="primary" className="w-full py-6 text-lg cursor-pointer">
                  <LogIn size={20} className="mr-2" />
                  Se connecter
                </Button>
              </Link>
              <Link href={`/auth/client/login?redirect=${encodeURIComponent(window.location.pathname)}&signup=true`} className="w-full">
                <Button variant="outline" className="w-full py-6 text-lg cursor-pointer">
                  <UserPlus size={20} className="mr-2" />
                  Créer un compte
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-gray-600 mt-2 cursor-pointer"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Votre avis</h2>
              <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Note globale</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="relative flex">
                    <button onClick={() => setReviewRating(star - 0.5)} className="w-5 h-10 overflow-hidden cursor-pointer">
                      <Star size={40} className={cn("transition-colors", star - 0.5 <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-gray-200")} />
                    </button>
                    <button onClick={() => setReviewRating(star)} className="w-5 h-10 overflow-hidden cursor-pointer">
                      <Star size={40} className={cn("transition-colors -ml-5", star <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-gray-200")} />
                    </button>
                  </div>
                ))}
                <span className="ml-4 text-3xl font-black text-gray-900">{reviewRating || "-"}</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-3">Commentaire</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Qu'avez-vous pensé de votre expérience ?"
                rows={4}
                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-gray-700"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || submittingReview}
              className="w-full py-6 text-lg cursor-pointer"
            >
              {submittingReview ? "Envoi..." : "Publier l'avis"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
