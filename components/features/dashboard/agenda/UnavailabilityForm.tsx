"use client";

import { useState } from "react";
import { X, Clock, FileText, Loader2, RefreshCw, Ban } from "lucide-react";
import { Button, Switch } from "@/components/ui";
import { UnavailabilityData } from "./types";
import { createClient } from "@/lib/supabase/client";

interface UnavailabilityFormProps {
  unavailability?: UnavailabilityData | null;
  establishmentId: string;
  selectedDate?: Date;
  onSave: (unavailability: UnavailabilityData) => void;
  onCancel: () => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Tous les jours" },
  { value: "weekly", label: "Toutes les semaines" },
  { value: "monthly", label: "Tous les mois" },
];

export default function UnavailabilityForm({ 
  unavailability, 
  establishmentId, 
  selectedDate,
  onSave, 
  onCancel 
}: UnavailabilityFormProps) {
  const [date, setDate] = useState(
    selectedDate ? selectedDate.toISOString().split("T")[0] : 
    unavailability?.start_time ? new Date(unavailability.start_time).toISOString().split("T")[0] :
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(() => {
    if (unavailability?.start_time) {
      const d = new Date(unavailability.start_time);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return "09:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (unavailability?.end_time) {
      const d = new Date(unavailability.end_time);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return "18:00";
  });
  const [reason, setReason] = useState(unavailability?.reason || "");
  const [isRecurring, setIsRecurring] = useState(unavailability?.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState<string>(
    unavailability?.recurrence_pattern || "weekly"
  );
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) return;

    setSaving(true);
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      const unavailabilityData = {
        establishment_id: establishmentId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        reason: reason || null,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
      };

      if (unavailability?.id) {
        const { data, error } = await supabase
          .from("unavailabilities")
          .update(unavailabilityData)
          .eq("id", unavailability.id)
          .select()
          .single();

        if (error) throw error;
        onSave(data);
      } else {
        const { data, error } = await supabase
          .from("unavailabilities")
          .insert(unavailabilityData)
          .select()
          .single();

        if (error) throw error;
        onSave(data);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const isValid = date && startTime && endTime;

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden mx-2 lg:mx-0">
      {/* Header avec gradient rouge */}
      <div className="bg-gradient-to-r from-red-500 to-red-400 p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white text-base lg:text-lg font-bold">
                {unavailability ? "Modifier l'indisponibilité" : "Nouvelle indisponibilité"}
              </h3>
              <p className="text-white/70 text-xs lg:text-sm">Bloquez un créneau dans votre agenda</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div className="flex flex-col gap-4 lg:gap-5">
          {/* Date et heure */}
          <div className="bg-red-50/50 rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-2 mb-3">
              <Clock size={14} className="text-red-500" />
              Date et horaires <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 px-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm bg-white"
              />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Début</span>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm bg-white cursor-pointer"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Fin</span>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm bg-white cursor-pointer"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Motif */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
              <FileText size={14} className="text-red-500" />
              Motif (optionnel)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Congés, Formation, Rendez-vous personnel..."
              className="h-11 lg:h-12 px-4 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm lg:text-base placeholder:text-gray-400"
            />
          </div>

          {/* Récurrence */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="text-red-500" />
                <span className="text-sm font-semibold text-gray-700">Répéter cette indisponibilité</span>
              </div>
              <Switch
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
                size="sm"
              />
            </div>
            
            {isRecurring && (
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-sm bg-white cursor-pointer"
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Footer avec actions */}
      <div className="border-t border-gray-100 p-4 lg:p-5 bg-gray-50/50">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="px-5">
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="px-6 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Enregistrement...</span>
              </div>
            ) : (
              <span>{unavailability ? "Modifier" : "Bloquer ce créneau"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
