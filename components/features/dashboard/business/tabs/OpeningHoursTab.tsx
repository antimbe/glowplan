"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2, Coffee } from "lucide-react";
import { Button, Switch } from "@/components/ui";
import { OpeningHoursData, DAYS_OF_WEEK } from "../types";
import { createClient } from "@/lib/supabase/client";
import SectionCard from "../SectionCard";

interface OpeningHoursTabProps {
  establishmentId: string;
  onSaved?: () => void;
}

const TIME_OPTIONS = Array.from({ length: 27 }, (_, i) => {
  const hours = 7 + Math.floor(i / 2);
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

export default function OpeningHoursTab({ establishmentId, onSaved }: OpeningHoursTabProps) {
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
        // Normaliser les heures (enlever les secondes si présentes).
        // Si un jour est ouvert mais que les heures sont null (données corrompues d'une
        // sauvegarde précédente), on les remplace par les valeurs par défaut ET on force
        // hasChanges = true pour que le bouton Enregistrer s'affiche automatiquement.
        let needsCorrection = false;
        const normalizedData = data.map(h => {
          const open_time   = h.open_time   ? h.open_time.substring(0, 5)   : (h.is_open ? "09:00" : null);
          const close_time  = h.close_time  ? h.close_time.substring(0, 5)  : (h.is_open ? "18:00" : null);
          const break_start = h.break_start ? h.break_start.substring(0, 5) : null;
          const break_end   = h.break_end   ? h.break_end.substring(0, 5)   : null;
          if (h.is_open && (!h.open_time || !h.close_time)) needsCorrection = true;
          return { ...h, open_time, close_time, break_start, break_end };
        });
        setHours(normalizedData);
        if (needsCorrection) setHasChanges(true);
      } else {
        // Initialiser avec les horaires par défaut et marquer comme modifié
        // pour que le bouton Enregistrer soit visible dès le premier accès
        setHours(DEFAULT_HOURS.map(h => ({ ...h, establishment_id: establishmentId })));
        setHasChanges(true);
      }
    } catch (error) {
      console.error("Erreur chargement horaires:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers pour filtrer les options valides ──────────────────────────────
  const optionsAfter  = (min: string)                   => TIME_OPTIONS.filter(t => t > min);
  const optionsBefore = (max: string)                   => TIME_OPTIONS.filter(t => t < max);
  const optionsBetween = (min: string, max: string)     => TIME_OPTIONS.filter(t => t > min && t < max);
  const optionsUpTo   = (max: string)                   => TIME_OPTIONS.filter(t => t <= max);

  const updateDay = (dayIndex: number, field: keyof OpeningHoursData, value: any) => {
    setHours(prev => prev.map((h, i) => {
      if (i !== dayIndex) return h;
      const u = { ...h, [field]: value };

      // ── Activation du jour : garantir des heures par défaut ──────────────
      if (field === "is_open" && value === true) {
        if (!u.open_time)  u.open_time  = "09:00";
        if (!u.close_time) u.close_time = "18:00";
      }

      // ── Changement de l'heure d'ouverture ────────────────────────────────
      if (field === "open_time") {
        // close_time doit rester strictement après open_time
        if (u.close_time && u.close_time <= value) {
          u.close_time = TIME_OPTIONS.find(t => t > value) ?? value;
        }
        // La pause doit rester dans [open_time, close_time]
        if (u.break_start && u.break_start <= value) {
          const nextBs = TIME_OPTIONS.find(t => t > value && t < (u.close_time ?? "18:00"));
          if (nextBs) {
            u.break_start = nextBs;
            if (u.break_end && u.break_end <= nextBs) {
              u.break_end = TIME_OPTIONS.find(t => t > nextBs && t <= (u.close_time ?? "18:00")) ?? null;
            }
          } else {
            u.break_start = null;
            u.break_end   = null;
          }
        }
      }

      // ── Changement de l'heure de fermeture ───────────────────────────────
      if (field === "close_time") {
        // open_time doit rester strictement avant close_time
        if (u.open_time && u.open_time >= value) {
          u.open_time = TIME_OPTIONS.slice().reverse().find(t => t < value) ?? value;
        }
        // La fin de pause doit rester ≤ close_time
        if (u.break_end && u.break_end > value) {
          u.break_end = value;
          if (u.break_start && u.break_start >= u.break_end) {
            u.break_start = TIME_OPTIONS.slice().reverse().find(t => t < u.break_end! && t > (u.open_time ?? "07:00")) ?? null;
            if (!u.break_start) u.break_end = null;
          }
        }
        // Le début de pause doit rester < close_time
        if (u.break_start && u.break_start >= value) {
          u.break_start = null;
          u.break_end   = null;
        }
      }

      // ── Changement du début de pause ─────────────────────────────────────
      if (field === "break_start") {
        if (u.break_end && u.break_end <= value) {
          u.break_end = TIME_OPTIONS.find(t => t > value && t <= (u.close_time ?? "18:00")) ?? null;
        }
      }

      // ── Changement de la fin de pause ────────────────────────────────────
      if (field === "break_end") {
        if (u.break_start && u.break_start >= value) {
          u.break_start = TIME_OPTIONS.slice().reverse().find(t => t < value && t > (u.open_time ?? "07:00")) ?? null;
        }
      }

      return u;
    }));
    setHasChanges(true);
  };

  const toggleBreak = (dayIndex: number) => {
    const day = hours[dayIndex];
    if (day.break_start) {
      setHours(prev => prev.map((h, i) =>
        i === dayIndex ? { ...h, break_start: null, break_end: null } : h
      ));
      setHasChanges(true);
    } else {
      // Choisir des valeurs de pause par défaut valides par rapport aux horaires du jour
      const open  = day.open_time  || "09:00";
      const close = day.close_time || "18:00";
      const bs = TIME_OPTIONS.find(t => t > open  && t < close) ?? null;
      const be = bs ? (TIME_OPTIONS.find(t => t > bs && t <= close) ?? null) : null;
      setHours(prev => prev.map((h, i) =>
        i === dayIndex ? { ...h, break_start: bs, break_end: be } : h
      ));
      setHasChanges(true);
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
          // Filet de sécurité absolu : jamais de null pour open_time/close_time quand is_open=true
          open_time:   h.is_open ? (h.open_time   || "09:00") : null,
          close_time:  h.is_open ? (h.close_time  || "18:00") : null,
          break_start: h.is_open ? h.break_start : null,
          break_end:   h.is_open ? h.break_end   : null,
        })));

      if (error) throw error;
      setHasChanges(false);
      onSaved?.();
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
                <div className="flex items-center justify-between w-full lg:w-40">
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
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Ouverture : toutes les options sauf la dernière (doit rester < close) */}
                        <select
                          value={day.open_time || "09:00"}
                          onChange={(e) => updateDay(index, "open_time", e.target.value)}
                          className="h-10 px-2 sm:px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm font-medium bg-white cursor-pointer"
                        >
                          {optionsBefore(day.close_time || "18:00").map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <span className="text-gray-400 text-xs">à</span>
                        {/* Fermeture : seulement les heures strictement après l'ouverture */}
                        <select
                          value={day.close_time || "18:00"}
                          onChange={(e) => updateDay(index, "close_time", e.target.value)}
                          className="h-10 px-2 sm:px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm font-medium bg-white cursor-pointer"
                        >
                          {optionsAfter(day.open_time || "09:00").map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Pause */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <button
                        onClick={() => toggleBreak(index)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          day.break_start
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <Coffee size={16} />
                        <span>Pause</span>
                      </button>

                      {day.break_start && (
                        <div className="flex items-center gap-2">
                          {/* Début pause : entre open_time et close_time (exclu) */}
                          <select
                            value={day.break_start}
                            onChange={(e) => updateDay(index, "break_start", e.target.value)}
                            className="h-10 px-2 sm:px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm font-medium bg-white cursor-pointer"
                          >
                            {optionsBetween(day.open_time || "09:00", day.close_time || "18:00").map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-gray-400">-</span>
                          {/* Fin pause : strictement après break_start et ≤ close_time */}
                          <select
                            value={day.break_end || "14:00"}
                            onChange={(e) => updateDay(index, "break_end", e.target.value)}
                            className="h-10 px-2 sm:px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs sm:text-sm font-medium bg-white cursor-pointer"
                          >
                            {optionsAfter(day.break_start).filter(t => t <= (day.close_time || "18:00")).map((time) => (
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
