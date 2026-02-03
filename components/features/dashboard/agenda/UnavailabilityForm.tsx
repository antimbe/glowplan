"use client";

import { useState } from "react";
import { X, Clock, FileText, Loader2, RefreshCw } from "lucide-react";
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
    <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 p-4 lg:p-6 shadow-lg max-w-lg w-full mx-2 lg:mx-0">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-primary text-base lg:text-lg font-bold">
          {unavailability ? "Modifier l'indispo." : "Nouvelle indispo."}
        </h3>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:gap-4">
        {/* Date et heure */}
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 lg:gap-2">
            <Clock size={12} className="lg:w-3.5 lg:h-3.5" />
            Date et horaires *
          </label>
          <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 lg:h-12 px-2 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base"
            />
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-10 lg:h-12 px-2 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base bg-white cursor-pointer"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="h-10 lg:h-12 px-2 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base bg-white cursor-pointer"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Motif */}
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 lg:gap-2">
            <FileText size={12} className="lg:w-3.5 lg:h-3.5" />
            Motif (optionnel)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Congés, Formation..."
            className="h-10 lg:h-12 px-3 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base"
          />
        </div>

        {/* Récurrence */}
        <div className="bg-gray-50 rounded-lg lg:rounded-xl p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div className="flex items-center gap-1.5 lg:gap-2">
              <RefreshCw size={14} className="text-gray-500" />
              <span className="text-xs lg:text-sm font-semibold text-gray-700">Récurrence</span>
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
              className="w-full h-9 lg:h-10 px-3 lg:px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-xs lg:text-sm bg-white cursor-pointer"
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 lg:gap-3 pt-3 lg:pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onCancel} size="sm" className="px-4 lg:px-6">
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="px-4 lg:px-6 bg-primary hover:bg-primary-dark"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Enregistrement...</span>
              </div>
            ) : (
              <span>{unavailability ? "Modifier" : "Créer"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
