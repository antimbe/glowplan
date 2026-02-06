"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Calendar, MapPin, Clock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { MONTHS, DAYS_JS_SHORT, jsDayToDbDay } from "@/lib/utils/formatters";

interface OpeningHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

interface AvailabilitySlot {
  date: Date;
  slots: string[];
}

interface Establishment {
  name: string;
  city: string;
  description: string;
  main_photo_url: string;
}


export default function BookPage() {
  const params = useParams();
  const establishmentId = params.establishmentId as string;
  
  const [loading, setLoading] = useState(true);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [notFound, setNotFound] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (establishmentId) {
      loadData();
    }
  }, [establishmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les infos de l'établissement
      const { data: estab, error } = await supabase
        .from("establishments")
        .select("name, city, description, main_photo_url")
        .eq("id", establishmentId)
        .single();

      if (error || !estab) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setEstablishment(estab);

      // Charger les horaires d'ouverture
      const { data: hours } = await supabase
        .from("opening_hours")
        .select("day_of_week, is_open, open_time, close_time, break_start, break_end")
        .eq("establishment_id", establishmentId);

      const normalizedHours = hours ? hours.map(h => ({
        ...h,
        open_time: h.open_time ? h.open_time.substring(0, 5) : null,
        close_time: h.close_time ? h.close_time.substring(0, 5) : null,
        break_start: h.break_start ? h.break_start.substring(0, 5) : null,
        break_end: h.break_end ? h.break_end.substring(0, 5) : null,
      })) as OpeningHour[] : [];

      // Charger les indisponibilités (30 prochains jours)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const { data: unavailabilities } = await supabase
        .from("unavailabilities")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .lte("start_time", endDate.toISOString())
        .gte("end_time", startDate.toISOString());

      // Charger les RDV existants
      const { data: appointments } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .neq("status", "cancelled")
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      // Calculer les disponibilités
      if (normalizedHours.length > 0) {
        const slots = calculateAvailabilities(
          normalizedHours,
          unavailabilities || [],
          appointments || [],
          30
        );
        setAvailabilities(slots);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvailabilities = (
    hours: OpeningHour[],
    unavailabilities: { start_time: string; end_time: string }[],
    appointments: { start_time: string; end_time: string }[],
    days: number
  ): AvailabilitySlot[] => {
    const result: AvailabilitySlot[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dbDayOfWeek = jsDayToDbDay(date.getDay());
      const dayHours = hours.find(h => h.day_of_week === dbDayOfWeek);

      if (!dayHours || !dayHours.is_open || !dayHours.open_time || !dayHours.close_time) continue;

      const openTime = parseInt(dayHours.open_time.split(":")[0]);
      const closeTime = parseInt(dayHours.close_time.split(":")[0]);

      const dayStart = new Date(date);
      dayStart.setHours(openTime, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(closeTime, 0, 0, 0);

      const isFullDayUnavailable = unavailabilities.some(u => {
        const uStart = new Date(u.start_time);
        const uEnd = new Date(u.end_time);
        return uStart <= dayStart && uEnd >= dayEnd;
      });

      if (isFullDayUnavailable) continue;

      const breakStart = dayHours.break_start ? parseInt(dayHours.break_start.split(":")[0]) : null;
      const breakEnd = dayHours.break_end ? parseInt(dayHours.break_end.split(":")[0]) : null;

      const slots: string[] = [];
      let currentSlotStart: number | null = null;

      for (let hour = openTime; hour < closeTime; hour++) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(date);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const isDuringBreak = breakStart !== null && breakEnd !== null && hour >= breakStart && hour < breakEnd;

        const isUnavailable = unavailabilities.some(u => {
          const uStart = new Date(u.start_time);
          const uEnd = new Date(u.end_time);
          return slotStart < uEnd && slotEnd > uStart;
        });

        const isBooked = appointments.some(a => {
          const aStart = new Date(a.start_time);
          const aEnd = new Date(a.end_time);
          return slotStart < aEnd && slotEnd > aStart;
        });

        if (!isUnavailable && !isBooked && !isDuringBreak) {
          if (currentSlotStart === null) {
            currentSlotStart = hour;
          }
        } else {
          if (currentSlotStart !== null) {
            slots.push(`${currentSlotStart}h - ${hour}h`);
            currentSlotStart = null;
          }
        }
      }

      if (currentSlotStart !== null) {
        slots.push(`${currentSlotStart}h - ${closeTime}h`);
      }

      if (slots.length > 0) {
        result.push({ date, slots });
      }
    }

    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Établissement non trouvé</h1>
          <p className="text-gray-500">Ce lien de réservation n'est pas valide.</p>
        </div>
      </div>
    );
  }

  const currentMonth = availabilities.length > 0 
    ? MONTHS[availabilities[0].date.getMonth()]
    : MONTHS[new Date().getMonth()];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {establishment?.main_photo_url && (
              <img 
                src={establishment.main_photo_url} 
                alt={establishment.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{establishment?.name}</h1>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={14} className="text-red-400" />
                {establishment?.city}
              </div>
            </div>
          </div>
          {establishment?.description && (
            <p className="text-gray-600 mt-4 text-sm">{establishment.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={24} className="text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Disponibilités - {currentMonth}</h2>
        </div>

        {availabilities.length > 0 ? (
          <div className="grid gap-3">
            {availabilities.map((slot, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary text-white flex flex-col items-center justify-center">
                      <span className="text-xs font-medium">{DAYS_JS_SHORT[slot.date.getDay()]}</span>
                      <span className="text-xl font-bold">{slot.date.getDate()}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {slot.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock size={14} />
                        {slot.slots.join(" / ")}
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" className="hidden sm:flex">
                    Réserver
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
                <Button variant="primary" size="sm" className="w-full mt-3 sm:hidden">
                  Réserver
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune disponibilité</h3>
            <p className="text-gray-500">Aucun créneau disponible pour le moment.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-400">
          Propulsé par <span className="font-semibold text-primary">GlowPlan</span>
        </div>
      </div>
    </div>
  );
}
