"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Clock, Phone, Mail, ChevronLeft, Star, Calendar, Check, ArrowRight, Instagram, User, FileText, Heart, UserPlus, LogIn, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface Establishment {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  activity_sectors: string[];
  main_photo_url: string | null;
  general_conditions: string | null;
  show_conditions_online: boolean;
  auto_confirm_appointments: boolean;
  hide_exact_address: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface OpeningHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

interface AvailableSlot {
  date: Date;
  time: string;
  endTime: string;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagram: string;
  notes: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  client_name: string | null;
  created_at: string;
  client_profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

const DAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

type Step = "info" | "datetime" | "recap" | "confirmation";

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
  const [step, setStep] = useState<Step>("info");

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
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

  const loadAvailableSlots = useCallback(async (date: Date, service: Service) => {
    setLoadingSlots(true);
    try {
      const dayOfWeek = date.getDay();
      const hours = openingHours.find(h => h.day_of_week === dayOfWeek);

      if (!hours || !hours.is_open || !hours.open_time || !hours.close_time) {
        setAvailableSlots([]);
        return;
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: appointments } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString())
        .neq("status", "cancelled");

      const { data: unavailabilities } = await supabase
        .from("unavailabilities")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .lte("start_time", endOfDay.toISOString())
        .gte("end_time", startOfDay.toISOString());

      const slots: AvailableSlot[] = [];
      const [openHour, openMin] = hours.open_time.split(":").map(Number);
      const [closeHour, closeMin] = hours.close_time.split(":").map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(openHour, openMin, 0, 0);

      const closeTime = new Date(date);
      closeTime.setHours(closeHour, closeMin, 0, 0);

      const now = new Date();

      while (currentTime < closeTime) {
        const slotEnd = new Date(currentTime.getTime() + service.duration * 60000);

        if (slotEnd > closeTime) break;

        if (currentTime < now) {
          currentTime = new Date(currentTime.getTime() + 30 * 60000);
          continue;
        }

        if (hours.break_start && hours.break_end) {
          const [breakStartH, breakStartM] = hours.break_start.split(":").map(Number);
          const [breakEndH, breakEndM] = hours.break_end.split(":").map(Number);
          const breakStart = new Date(date);
          breakStart.setHours(breakStartH, breakStartM, 0, 0);
          const breakEnd = new Date(date);
          breakEnd.setHours(breakEndH, breakEndM, 0, 0);

          if (currentTime < breakEnd && slotEnd > breakStart) {
            currentTime = new Date(breakEnd);
            continue;
          }
        }

        const hasConflict = appointments?.some(apt => {
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return currentTime < aptEnd && slotEnd > aptStart;
        });

        const isUnavailable = unavailabilities?.some(u => {
          const uStart = new Date(u.start_time);
          const uEnd = new Date(u.end_time);
          return currentTime < uEnd && slotEnd > uStart;
        });

        if (!hasConflict && !isUnavailable) {
          slots.push({
            date: new Date(currentTime),
            time: `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`,
            endTime: `${slotEnd.getHours().toString().padStart(2, "0")}:${slotEnd.getMinutes().toString().padStart(2, "0")}`,
          });
        }

        currentTime = new Date(currentTime.getTime() + 30 * 60000);
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [establishmentId, openingHours, supabase]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailableSlots(selectedDate, selectedService);
    }
  }, [selectedDate, selectedService, loadAvailableSlots]);

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

  const getNext14Days = () => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    const hours = openingHours.find(h => h.day_of_week === dayOfWeek);
    return hours?.is_open ?? false;
  };

  const formatHours = (hour: OpeningHour) => {
    if (!hour.is_open) return "Fermé";
    let result = `${hour.open_time} - ${hour.close_time}`;
    if (hour.break_start && hour.break_end) {
      result = `${hour.open_time} - ${hour.break_start}, ${hour.break_end} - ${hour.close_time}`;
    }
    return result;
  };

  const getSortedHours = () => {
    return [...openingHours].sort((a, b) => {
      const aDay = a.day_of_week === 0 ? 7 : a.day_of_week;
      const bDay = b.day_of_week === 0 ? 7 : b.day_of_week;
      return aDay - bDay;
    });
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
              <p className="text-gray-600">{establishment.description || "Aucune description disponible."}</p>
              
              {establishment.activity_sectors?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Catégories</h3>
                  <div className="flex flex-wrap gap-2">
                    {establishment.activity_sectors.map((sector, idx) => (
                      <span key={idx} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {step === "info" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Avis clients</h2>
                  <div className="flex items-center gap-3">
                    {averageRating !== null && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={cn(
                                star <= Math.round(averageRating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900">{averageRating}</span>
                        <span className="text-gray-500 text-sm">({reviews.length} avis)</span>
                      </div>
                    )}
                    {!hasAlreadyReviewed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenReviewModal}
                        className="cursor-pointer"
                      >
                        <MessageSquare size={16} className="mr-1" />
                        Donner mon avis
                      </Button>
                    )}
                  </div>
                </div>
                {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => {
                    const reviewerName = review.client_profiles
                      ? `${review.client_profiles.first_name} ${review.client_profiles.last_name?.charAt(0)}.`
                      : review.client_name || "Client anonyme";
                    const reviewDate = new Date(review.created_at);
                    return (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {reviewerName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{reviewerName}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div key={star} className="relative w-3 h-3">
                                {/* Étoile de fond (grise) */}
                                <Star size={12} className="absolute text-gray-300" />
                                {/* Étoile remplie (jaune) - pleine, demi ou vide */}
                                {star <= review.rating ? (
                                  <Star size={12} className="absolute text-yellow-500 fill-yellow-500" />
                                ) : star - 0.5 <= review.rating ? (
                                  <div className="absolute overflow-hidden w-1.5">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                  </div>
                                ) : null}
                              </div>
                            ))}
                            <span className="ml-1 text-xs font-medium text-gray-600">{review.rating}</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-2">
                          {reviewDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">Aucun avis pour le moment</p>
                    <p className="text-gray-400 text-xs mt-1">Soyez le premier à donner votre avis !</p>
                  </div>
                )}
              </div>
            )}

            {/* Booking Flow */}
            {step === "info" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Prestations</h2>
                {services.length > 0 ? (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleSelectService(service)}
                        className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left group cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary">{service.price}€</span>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-primary transition-colors ml-auto mt-2" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune prestation disponible</p>
                )}
              </div>
            )}

            {step === "datetime" && selectedService && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("info");
                    setSelectedDate(null);
                    setSelectedSlot(null);
                  }}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4"
                >
                  <ChevronLeft size={18} />
                  <span>Modifier la prestation</span>
                </Button>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                      <span className="text-sm text-gray-500">{selectedService.duration} min</span>
                    </div>
                    <span className="font-bold text-primary">{selectedService.price}€</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-4">Choisissez une date</h2>
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2">
                  {getNext14Days().map((date) => {
                    const isAvailable = isDateAvailable(date);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => isAvailable && setSelectedDate(date)}
                        disabled={!isAvailable}
                        className={cn(
                          "flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all",
                          isSelected ? "bg-primary text-white" :
                          isAvailable ? "bg-gray-50 border border-gray-200 hover:border-primary/30 cursor-pointer" :
                          "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        <div className="text-xs uppercase">{DAYS_SHORT[date.getDay()]}</div>
                        <div className="text-lg font-bold">{date.getDate()}</div>
                        <div className="text-xs">{MONTHS[date.getMonth()].substring(0, 3)}</div>
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 mt-6">Choisissez un créneau</h2>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSlot(slot)}
                            className="bg-gray-50 border border-gray-200 hover:border-primary hover:bg-primary/5 rounded-xl py-3 text-center font-medium transition-all cursor-pointer"
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-6 text-center">
                        <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">Aucun créneau disponible ce jour</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === "recap" && selectedService && selectedSlot && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <Button
                  variant="ghost"
                  onClick={() => setStep("datetime")}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4"
                >
                  <ChevronLeft size={18} />
                  <span>Modifier la date</span>
                </Button>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prestation</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">
                        {DAYS_FULL[selectedSlot.date.getDay()]} {selectedSlot.date.getDate()} {MONTHS[selectedSlot.date.getMonth()]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Heure</span>
                      <span className="font-medium">{selectedSlot.time} - {selectedSlot.endTime}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Prix</span>
                      <span className="font-bold text-primary">{selectedService.price}€</span>
                    </div>
                  </div>
                </div>

                {/* Suggestion de connexion/inscription si non connecté */}
                {!clientProfileId && (
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserPlus size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Créez un compte pour profiter de plus d'avantages</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Suivez vos réservations, recevez des rappels et accumulez des points fidélité.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/auth/client/login?redirect=/establishment/${establishmentId}`}>
                            <Button variant="primary" size="sm" className="cursor-pointer">
                              <LogIn size={16} className="mr-1" />
                              Se connecter
                            </Button>
                          </Link>
                          <Link href={`/auth/client/login?redirect=/establishment/${establishmentId}&signup=true`}>
                            <Button variant="outline" size="sm" className="cursor-pointer">
                              <UserPlus size={16} className="mr-1" />
                              Créer un compte
                            </Button>
                          </Link>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Ou continuez en tant qu'invité ci-dessous
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Badge si connecté */}
                {clientProfileId && (
                  <div className="bg-green-50 rounded-xl p-3 mb-6 border border-green-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Connecté en tant que {clientInfo.firstName} {clientInfo.lastName}</p>
                      <p className="text-xs text-green-600">Vos informations sont pré-remplies</p>
                    </div>
                  </div>
                )}

                <h2 className="text-lg font-bold text-gray-900 mb-4">Vos informations</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={clientInfo.firstName}
                          onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="Jean"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={clientInfo.lastName}
                          onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="jean.dupont@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={clientInfo.instagram}
                        onChange={(e) => setClientInfo({ ...clientInfo, instagram: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="@votre_instagram"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={clientInfo.notes}
                        onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        placeholder="Informations supplémentaires..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {establishment.show_conditions_online && establishment.general_conditions && (
                  <div className="bg-gray-50 rounded-xl p-4 mt-4 text-sm text-gray-600">
                    <h4 className="font-semibold text-gray-900 mb-2">Conditions générales</h4>
                    <p>{establishment.general_conditions}</p>
                  </div>
                )}

                {/* Message d'erreur si client bloqué */}
                {blockedError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-1">Réservation impossible</h4>
                        <p className="text-sm text-red-600 mb-2">
                          Vous ne pouvez pas effectuer de réservation auprès de cet établissement.
                        </p>
                        <p className="text-sm text-red-600">
                          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter directement l'établissement 
                          {establishment.phone && (
                            <span> au <a href={`tel:${establishment.phone}`} className="font-semibold underline">{establishment.phone}</a></span>
                          )}
                          {establishment.email && (
                            <span> ou par email à <a href={`mailto:${establishment.email}`} className="font-semibold underline">{establishment.email}</a></span>
                          )}
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={handleSubmitBooking}
                  disabled={!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone || submitting || blockedError}
                  className="w-full mt-6 py-4 text-base"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    <span>Confirmer la réservation</span>
                  )}
                </Button>
              </div>
            )}

            {step === "confirmation" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
                <p className="text-gray-500 mb-6">
                  {establishment?.auto_confirm_appointments
                    ? "Votre réservation a été confirmée. Vous recevrez un email de confirmation."
                    : "Votre demande a été envoyée. L'établissement vous contactera pour confirmer."}
                </p>
                <Button variant="primary" onClick={() => router.push("/")}>
                  Retour à l'accueil
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-6">
              {/* Establishment Name & Location */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{establishment.name}</h1>
                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin size={14} />
                    <span className="text-sm">{establishment.city}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  disabled={togglingFavorite}
                  className={cn(
                    "p-2 rounded-full min-w-0 h-auto",
                    isFavorite ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-100"
                  )}
                >
                  <Heart 
                    size={20} 
                    className={cn(
                      "transition-colors",
                      isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
                    )} 
                  />
                </Button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                {averageRating !== null ? (
                  <>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-yellow-700">{averageRating}</span>
                    </div>
                    <span className="text-gray-500">({reviews.length} avis)</span>
                  </>
                ) : (
                  <span className="italic">Sois la première personne à donner ton avis</span>
                )}
              </div>

              {/* Address */}
              {fullAddress && (
                <div className="flex items-start gap-3 py-3 border-t border-gray-100">
                  <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{fullAddress}</span>
                </div>
              )}

              {/* Opening Hours */}
              {openingHours.length > 0 && (
                <div className="py-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock size={18} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">Horaires</span>
                  </div>
                  <div className="space-y-1.5 ml-7">
                    {getSortedHours().map((hour) => (
                      <div key={hour.day_of_week} className="flex justify-between text-sm">
                        <span className="text-gray-600">{DAYS_FULL[hour.day_of_week]}</span>
                        <span className={cn(
                          "font-medium",
                          hour.is_open ? "text-gray-900" : "text-red-500"
                        )}>
                          {formatHours(hour)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              
            </div>
          </div>
        </div>
      </div>

      {/* Modal de prompt de connexion pour les favoris */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Heart size={24} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ajouter aux favoris</h2>
                <p className="text-gray-500 text-sm">Connectez-vous pour sauvegarder vos établissements préférés</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Créez un compte ou connectez-vous pour ajouter cet établissement à vos favoris et retrouver facilement vos adresses préférées.
            </p>

            <div className="flex flex-col gap-2">
              <Link href={`/auth/client/login?redirect=/establishment/${establishmentId}`}>
                <Button variant="primary" className="w-full cursor-pointer">
                  <LogIn size={18} className="mr-2" />
                  Se connecter
                </Button>
              </Link>
              <Link href={`/auth/client/login?redirect=/establishment/${establishmentId}&signup=true`}>
                <Button variant="outline" className="w-full cursor-pointer">
                  <UserPlus size={18} className="mr-2" />
                  Créer un compte
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-500 hover:text-gray-700 mt-2"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour laisser un avis */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                  <Star size={24} className="text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Donner mon avis</h2>
                  <p className="text-gray-500 text-sm">{establishment?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Note avec demi-étoiles */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre note <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="relative flex">
                    {/* Demi-étoile gauche */}
                    <button
                      onClick={() => setReviewRating(star - 0.5)}
                      className="w-4 h-8 overflow-hidden cursor-pointer"
                    >
                      <Star
                        size={32}
                        className={cn(
                          "transition-colors",
                          star - 0.5 <= reviewRating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 hover:text-yellow-300"
                        )}
                      />
                    </button>
                    {/* Demi-étoile droite */}
                    <button
                      onClick={() => setReviewRating(star)}
                      className="w-4 h-8 overflow-hidden cursor-pointer"
                    >
                      <Star
                        size={32}
                        className={cn(
                          "transition-colors -ml-4",
                          star <= reviewRating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 hover:text-yellow-300"
                        )}
                      />
                    </button>
                  </div>
                ))}
                <span className="ml-2 text-lg font-bold text-gray-700">{reviewRating > 0 ? reviewRating : "-"}</span>
              </div>
              {reviewRating > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {reviewRating <= 1 && "Très insatisfait"}
                  {reviewRating > 1 && reviewRating <= 2 && "Insatisfait"}
                  {reviewRating > 2 && reviewRating <= 3 && "Correct"}
                  {reviewRating > 3 && reviewRating <= 4 && "Satisfait"}
                  {reviewRating > 4 && "Très satisfait"}
                </p>
              )}
            </div>

            {/* Commentaire */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre commentaire (optionnel)
              </label>
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
                onClick={() => setShowReviewModal(false)}
                className="flex-1 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || submittingReview}
                className="flex-1 cursor-pointer"
              >
                {submittingReview ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Envoi...</span>
                  </div>
                ) : (
                  "Publier mon avis"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
