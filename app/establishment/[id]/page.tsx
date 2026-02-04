"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Clock, Phone, Mail, ChevronLeft, Star, Calendar, Check, ArrowRight, Instagram, User, FileText, Heart } from "lucide-react";
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
      setClientInfo({
        firstName: clientProfile.first_name || "",
        lastName: clientProfile.last_name || "",
        email: user.email || "",
        phone: clientProfile.phone || "",
        instagram: clientProfile.instagram || "",
        notes: "",
      });
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

  const fullAddress = [establishment.address, establishment.postal_code, establishment.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
            <span>Retour à la recherche</span>
          </button>
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
            {reviews.length > 0 && step === "info" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Avis clients</h2>
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
                </div>
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
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
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
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-2">
                          {reviewDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
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
                <button
                  onClick={() => {
                    setStep("info");
                    setSelectedDate(null);
                    setSelectedSlot(null);
                  }}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                  <span>Modifier la prestation</span>
                </button>

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
                <button
                  onClick={() => setStep("datetime")}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                  <span>Modifier la date</span>
                </button>

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

                <Button
                  variant="primary"
                  onClick={handleSubmitBooking}
                  disabled={!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone || submitting}
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
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Heart size={20} className="text-gray-400" />
                </button>
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
    </div>
  );
}
