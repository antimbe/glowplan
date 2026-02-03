"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2, Coffee } from "lucide-react";
import { Button, Switch } from "@/components/ui";
import { OpeningHoursData, DAYS_OF_WEEK } from "../types";
import { createClient } from "@/lib/supabase/client";
import SectionCard from "../SectionCard";

interface OpeningHoursTabProps {
  establishmentId: string;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

const DEFAULT_HOURS: Omit<OpeningHoursData, "id" | "establishment_id">[] = DAYS_OF_WEEK.map((day) => ({
  day_of_week: day.value,
  is_open: day.value < 5, // Ouvert du lundi au vendredi par défaut
  open_time: "09:00",
  close_time: "18:00",
  break_start: null,
  break_end: null,
}));

export default function OpeningHoursTab({ establishmentId }: OpeningHoursTabProps) {
  const [hours, setHours] = useState<OpeningHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadOpeningHours();
  }, [establishmentId]);

  const loadOpeningHours = async () => {
    try {
      const { data, error } = await supabase
        .from("opening_hours")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("day_of_week", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Normaliser les heures (enlever les secondes si présentes)
        const normalizedData = data.map(h => ({
          ...h,
          open_time: h.open_time ? h.open_time.substring(0, 5) : null,
          close_time: h.close_time ? h.close_time.substring(0, 5) : null,
          break_start: h.break_start ? h.break_start.substring(0, 5) : null,
          break_end: h.break_end ? h.break_end.substring(0, 5) : null,
        }));
        setHours(normalizedData);
      } else {
        // Initialiser avec les horaires par défaut
        setHours(DEFAULT_HOURS.map(h => ({ ...h, establishment_id: establishmentId })));
      }
    } catch (error) {
      console.error("Erreur chargement horaires:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (dayIndex: number, field: keyof OpeningHoursData, value: any) => {
    setHours(prev => prev.map((h, i) => 
      i === dayIndex ? { ...h, [field]: value } : h
    ));
    setHasChanges(true);
  };

  const toggleBreak = (dayIndex: number) => {
    const day = hours[dayIndex];
    if (day.break_start) {
      updateDay(dayIndex, "break_start", null);
      updateDay(dayIndex, "break_end", null);
    } else {
      updateDay(dayIndex, "break_start", "12:00");
      updateDay(dayIndex, "break_end", "14:00");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Supprimer les anciens horaires
      await supabase
        .from("opening_hours")
        .delete()
        .eq("establishment_id", establishmentId);

      // Insérer les nouveaux horaires
      const { error } = await supabase
        .from("opening_hours")
        .insert(hours.map(h => ({
          establishment_id: establishmentId,
          day_of_week: h.day_of_week,
          is_open: h.is_open,
          open_time: h.is_open ? h.open_time : null,
          close_time: h.is_open ? h.close_time : null,
          break_start: h.is_open ? h.break_start : null,
          break_end: h.is_open ? h.break_end : null,
        })));

      if (error) throw error;
      setHasChanges(false);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        icon={Clock}
        title="Horaires d'ouverture"
        subtitle="Définissez vos horaires pour chaque jour de la semaine"
      >
        <div className="flex flex-col gap-3">
          {hours.map((day, index) => (
            <div
              key={day.day_of_week}
              className={`rounded-xl border p-4 transition-all ${
                day.is_open 
                  ? "bg-white border-gray-200" 
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Jour et toggle */}
                <div className="flex items-center justify-between lg:w-40">
                  <span className={`font-semibold ${day.is_open ? "text-primary" : "text-gray-400"}`}>
                    {DAYS_OF_WEEK[day.day_of_week].label}
                  </span>
                  <Switch
                    checked={day.is_open}
                    onChange={() => updateDay(index, "is_open", !day.is_open)}
                    size="sm"
                  />
                </div>

                {day.is_open && (
                  <>
                    {/* Horaires principaux */}
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={day.open_time || "09:00"}
                        onChange={(e) => updateDay(index, "open_time", e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium bg-white cursor-pointer"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-400">à</span>
                      <select
                        value={day.close_time || "18:00"}
                        onChange={(e) => updateDay(index, "close_time", e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium bg-white cursor-pointer"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    {/* Pause */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBreak(index)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          day.break_start
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <Coffee size={16} />
                        <span className="hidden lg:inline">Pause</span>
                      </button>

                      {day.break_start && (
                        <div className="flex items-center gap-2">
                          <select
                            value={day.break_start}
                            onChange={(e) => updateDay(index, "break_start", e.target.value)}
                            className="h-10 px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium bg-white cursor-pointer"
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-gray-400">-</span>
                          <select
                            value={day.break_end || "14:00"}
                            onChange={(e) => updateDay(index, "break_end", e.target.value)}
                            className="h-10 px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium bg-white cursor-pointer"
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!day.is_open && (
                  <span className="text-gray-400 text-sm italic">Fermé</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bouton sauvegarder */}
        {hasChanges && (
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enregistrement...</span>
                </div>
              ) : (
                <span>Enregistrer les horaires</span>
              )}
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
