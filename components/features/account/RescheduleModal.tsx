"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";

interface Slot {
  startTime: string;
  endTime: string;
  label: string;
}

interface RescheduleModalProps {
  appointment: any;
  onClose: () => void;
  onSuccess: (newStartTime: string, newEndTime: string) => void;
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toMondayFirst(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function RescheduleModal({ appointment, onClose, onSuccess }: RescheduleModalProps) {
  const [step, setStep] = useState<"date" | "slot">("date");
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const establishmentId = appointment.establishments?.id;
  const duration = appointment.services?.duration || 60;

  const fetchSlots = useCallback(
    async (date: Date) => {
      setLoadingSlots(true);
      setSlots([]);
      setError(null);
      try {
        const dateStr = date.toISOString().split("T")[0];
        const res = await fetch(
          `/api/booking/slots?establishmentId=${establishmentId}&date=${dateStr}&duration=${duration}&excludeAppointmentId=${appointment.id}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur serveur");
        setSlots(data.slots || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    },
    [establishmentId, duration, appointment.id]
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep("slot");
    fetchSlots(date);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          newStartTime: selectedSlot.startTime,
          newEndTime: selectedSlot.endTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la modification");
      onSuccess(selectedSlot.startTime, selectedSlot.endTime);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const paddingDays = toMondayFirst(firstDayOfMonth.getDay());
  const totalCells = paddingDays + lastDayOfMonth.getDate();
  const totalWeeks = Math.ceil(totalCells / 7);

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    if (d >= new Date(today.getFullYear(), today.getMonth(), 1)) setCalendarDate(d);
  };
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  const formatSelectedDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Top accent */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === "slot" && (
              <button
                onClick={() => setStep("date")}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c0a062] mb-0.5">
                {step === "date" ? "Étape 1 / 2" : "Étape 2 / 2"}
              </p>
              <h3 className="text-[16px] font-black text-gray-900 tracking-tight">
                {step === "date" ? "Choisir une date" : "Choisir un horaire"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Current appointment reminder */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-[#32422c]/5 border border-[#32422c]/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#32422c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={15} className="text-[#32422c]" />
            </div>
            <div>
              <p className="text-[10px] text-[#32422c]/50 font-black uppercase tracking-wider">Créneau actuel</p>
              <p className="text-sm font-black text-[#32422c]">
                {new Date(appointment.start_time).toLocaleDateString("fr-FR", {
                  weekday: "short", day: "numeric", month: "short",
                })}{" "}
                à{" "}
                {new Date(appointment.start_time).toLocaleTimeString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Step: Date picker */}
        {step === "date" && (
          <div className="px-6 pb-6 pt-3">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
              <p className="font-black text-gray-900 text-sm capitalize">
                {MONTHS[month]} {year}
              </p>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalWeeks * 7 }).map((_, i) => {
                const dayNum = i - paddingDays + 1;
                if (dayNum < 1 || dayNum > lastDayOfMonth.getDate()) {
                  return <div key={i} />;
                }
                const date = new Date(year, month, dayNum);
                const isPast = date < today;
                const isTooFar = date > maxDate;
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === today.toDateString();
                const disabled = isPast || isTooFar;

                return (
                  <button
                    key={i}
                    onClick={() => !disabled && handleDateSelect(date)}
                    disabled={disabled}
                    className={[
                      "aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isSelected ? "bg-[#32422c] text-white shadow-lg shadow-[#32422c]/25 scale-105" : "",
                      isToday && !isSelected ? "border-2 border-[#c0a062] text-[#32422c]" : "",
                      disabled ? "text-gray-200 cursor-not-allowed" : "",
                      !disabled && !isSelected ? "hover:bg-[#32422c]/8 hover:text-[#32422c] text-gray-700" : "",
                    ].join(" ")}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Slot picker */}
        {step === "slot" && selectedDate && (
          <div className="px-6 pb-6 pt-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 capitalize">
              {formatSelectedDate(selectedDate)}
            </p>

            {loadingSlots ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="animate-spin text-[#32422c]" size={26} />
                <p className="text-sm text-gray-400 font-medium">Chargement des créneaux...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Clock size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-700">Aucun créneau disponible</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Essayez une autre date</p>
                <Button
                  variant="outline"
                  className="rounded-xl text-sm font-bold"
                  onClick={() => setStep("date")}
                >
                  Changer de date
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={[
                        "py-3 rounded-xl text-sm font-black transition-all duration-150 border-2 cursor-pointer",
                        selectedSlot?.startTime === slot.startTime
                          ? "bg-[#32422c] text-white border-[#32422c] shadow-lg shadow-[#32422c]/25 scale-[1.03]"
                          : "border-gray-100 text-gray-600 hover:border-[#32422c]/30 hover:text-[#32422c] hover:bg-[#32422c]/5",
                      ].join(" ")}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="mt-4 bg-[#32422c]/5 border border-[#32422c]/15 rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <CheckCircle2 size={17} className="text-[#32422c] flex-shrink-0" />
                    <p className="text-sm font-bold text-[#32422c]">
                      {formatSelectedDate(selectedDate)} à {selectedSlot.label}
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-500 font-medium mt-3 text-center">{error}</p>
                )}

                <button
                  disabled={!selectedSlot || submitting}
                  onClick={handleConfirm}
                  className="w-full mt-4 h-12 rounded-xl bg-[#32422c] hover:bg-[#3d5438] text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-[#32422c]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Modification en cours...
                    </>
                  ) : (
                    "Confirmer le nouveau créneau"
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
