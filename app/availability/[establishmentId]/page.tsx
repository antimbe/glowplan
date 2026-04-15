"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MONTHS, DAYS_JS_SHORT, jsDayToDbDay } from "@/lib/utils/formatters";
import { Calendar, MapPin, ArrowRight, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  description: string | null;
  main_photo_url: string | null;
}

const PERIOD_LABELS: Record<string, string> = {
  "7": "7 prochains jours",
  "this_month": "Ce mois-ci",
  "next_month": "Mois prochain",
};

function calculateAvailabilities(
  hours: OpeningHour[],
  unavailabilities: { start_time: string; end_time: string }[],
  appointments: { start_time: string; end_time: string }[],
  startDate: Date,
  endDate: Date
): AvailabilitySlot[] {
  const result: AvailabilitySlot[] = [];
  const date = new Date(startDate);

  while (date <= endDate) {
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    const dbDay = jsDayToDbDay(date.getDay());
    const dayHours = hours.find(h => h.day_of_week === dbDay);

    if (!dayHours?.is_open || !dayHours.open_time || !dayHours.close_time) {
      date.setDate(date.getDate() + 1);
      continue;
    }

    const openH = parseInt(dayHours.open_time.split(":")[0]);
    const closeH = parseInt(dayHours.close_time.split(":")[0]);
    const breakS = dayHours.break_start ? parseInt(dayHours.break_start.split(":")[0]) : null;
    const breakE = dayHours.break_end ? parseInt(dayHours.break_end.split(":")[0]) : null;

    const dayStart = new Date(date); dayStart.setHours(openH, 0, 0, 0);
    const dayEnd   = new Date(date); dayEnd.setHours(closeH, 0, 0, 0);

    const fullDayBlocked = unavailabilities.some(u =>
      new Date(u.start_time) <= dayStart && new Date(u.end_time) >= dayEnd
    );
    if (fullDayBlocked) { date.setDate(date.getDate() + 1); continue; }

    const slots: string[] = [];
    let segStart: number | null = null;

    for (let h = openH; h < closeH; h++) {
      const sStart = new Date(date); sStart.setHours(h, 0, 0, 0);
      const sEnd   = new Date(date); sEnd.setHours(h + 1, 0, 0, 0);

      const duringBreak = breakS !== null && breakE !== null && h >= breakS && h < breakE;
      const blocked = unavailabilities.some(u => sStart < new Date(u.end_time) && sEnd > new Date(u.start_time));
      const booked  = appointments.some(a => sStart < new Date(a.end_time) && sEnd > new Date(a.start_time));

      if (!duringBreak && !blocked && !booked) {
        if (segStart === null) segStart = h;
      } else {
        if (segStart !== null) { slots.push(`${segStart}h – ${h}h`); segStart = null; }
      }
    }
    if (segStart !== null) slots.push(`${segStart}h – ${closeH}h`);

    if (slots.length > 0) result.push({ date: currentDate, slots });
    date.setDate(date.getDate() + 1);
  }

  return result;
}

function AvailabilityContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const establishmentId = params.establishmentId as string;
  const period = searchParams.get("period") || "7";

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: est } = await supabase
      .from("establishments")
      .select("name, city, description, main_photo_url")
      .eq("id", establishmentId)
      .single();

    if (est) setEstablishment(est);

    const { data: hours } = await supabase
      .from("opening_hours")
      .select("day_of_week, is_open, open_time, close_time, break_start, break_end")
      .eq("establishment_id", establishmentId);

    const normalizedHours: OpeningHour[] = (hours || []).map(h => ({
      ...h,
      open_time:   h.open_time   ? h.open_time.substring(0, 5)   : null,
      close_time:  h.close_time  ? h.close_time.substring(0, 5)  : null,
      break_start: h.break_start ? h.break_start.substring(0, 5) : null,
      break_end:   h.break_end   ? h.break_end.substring(0, 5)   : null,
    }));

    const today = new Date();
    let startDate = new Date(today); startDate.setHours(0, 0, 0, 0);
    let endDate   = new Date(startDate);

    if (period === "7") {
      endDate.setDate(endDate.getDate() + 6);
    } else if (period === "this_month") {
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (period === "next_month") {
      startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      endDate   = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    }
    endDate.setHours(23, 59, 59, 999);

    const [{ data: unavs }, { data: apts }] = await Promise.all([
      supabase.from("unavailabilities")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .lte("start_time", endDate.toISOString())
        .gte("end_time", startDate.toISOString()),
      supabase.from("appointments")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .neq("status", "cancelled")
        .neq("status", "refused")
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString()),
    ]);

    if (normalizedHours.length > 0) {
      setAvailabilities(calculateAvailabilities(normalizedHours, unavs || [], apts || [], startDate, endDate));
    }

    setLoading(false);
  }, [establishmentId, period]);

  useEffect(() => { load(); }, [load]);

  const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const periodLabel = PERIOD_LABELS[period] || "Prochains créneaux";

  return (
    <div className="min-h-screen bg-primary relative overflow-x-hidden">
      {/* Background */}
      {establishment?.main_photo_url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={establishment.main_photo_url}
            alt=""
            fill
            className="object-cover opacity-10 grayscale"
            priority
          />
        </div>
      )}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/95 via-primary/90 to-[#1a2618]" />

      {/* Blur décoratif */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[50%] h-[40%] bg-accent/10 rounded-full blur-[100px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10 pb-24">

        {/* Header GlowPlan */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2">
            <span className="text-white text-xs font-black tracking-[0.3em] uppercase">GlowPlan</span>
          </div>
        </div>

        {/* Infos établissement */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-3">
            {establishment?.name || "Chargement…"}
          </h1>
          {establishment?.city && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
              <MapPin size={14} className="text-accent" />
              <span className="text-white/80 text-sm font-semibold">{establishment.city}</span>
            </div>
          )}
        </div>

        {/* Période */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Calendar size={16} className="text-accent" />
          <span className="text-accent text-sm font-bold uppercase tracking-widest">{periodLabel}</span>
        </div>

        {/* Disponibilités */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-white/50 animate-spin" />
            <p className="text-white/50 text-sm font-medium">Calcul des disponibilités…</p>
          </div>
        ) : availabilities.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 text-center">
            <Clock size={32} className="text-white/30 mx-auto mb-3" />
            <p className="text-white/60 font-semibold">Aucun créneau disponible pour cette période.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilities.map((slot, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/15 transition-colors"
              >
                {/* Date badge */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex flex-col items-center justify-center">
                  <span className="text-accent text-[10px] font-bold uppercase">
                    {DAY_NAMES[slot.date.getDay()]}
                  </span>
                  <span className="text-white text-lg font-black leading-none">
                    {slot.date.getDate()}
                  </span>
                </div>

                {/* Créneaux */}
                <div className="flex-1 pt-0.5">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                    {MONTHS[slot.date.getMonth()]}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {slot.slots.map((s, j) => (
                      <span
                        key={j}
                        className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-lg"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compteur */}
        {availabilities.length > 0 && (
          <p className="text-center text-white/30 text-xs font-medium mt-4">
            {availabilities.length} jour{availabilities.length > 1 ? "s" : ""} avec des créneaux disponibles
          </p>
        )}

        {/* CTA */}
        <div className="mt-10">
          <Link href={`/book/${establishmentId}`}>
            <button className="w-full bg-white text-primary font-black text-base py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              <span>Réserver maintenant</span>
              <ArrowRight size={20} />
            </button>
          </Link>
          <p className="text-center text-white/30 text-xs mt-3">
            Réservation instantanée via <span className="text-white/50 font-bold">GlowPlan.fr</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 size={36} className="text-white/50 animate-spin" />
      </div>
    }>
      <AvailabilityContent />
    </Suspense>
  );
}
