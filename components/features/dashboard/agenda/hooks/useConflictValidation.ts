"use client";

import { createClient } from "@/lib/supabase/client";

export interface ConflictResult {
  hasConflict: boolean;
  type: "unavailability" | "appointment" | "overlap" | null;
  message: string | null;
}

export async function checkAppointmentConflicts(
  establishmentId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<ConflictResult> {
  const supabase = createClient();

  // Vérifier si l'heure de fin est après l'heure de début
  if (endTime <= startTime) {
    return {
      hasConflict: true,
      type: "overlap",
      message: "L'heure de fin doit être après l'heure de début.",
    };
  }

  // Vérifier les indisponibilités (strict: < et > pour permettre les événements consécutifs)
  const { data: unavailabilities } = await supabase
    .from("unavailabilities")
    .select("*, unavailability_type")
    .eq("establishment_id", establishmentId)
    .lt("start_time", endTime.toISOString())
    .gt("end_time", startTime.toISOString());

  if (unavailabilities && unavailabilities.length > 0) {
    const unavailability = unavailabilities[0];
    const typeLabels: Record<string, string> = {
      vacation: "Vacances",
      training: "Formation",
      illness: "Maladie",
      event: "Événement",
      other: "Indisponibilité",
    };
    const typeLabel = typeLabels[unavailability.unavailability_type] || "Indisponibilité";
    
    return {
      hasConflict: true,
      type: "unavailability",
      message: `Ce créneau chevauche une indisponibilité (${typeLabel}${unavailability.reason ? ` : ${unavailability.reason}` : ""}).`,
    };
  }

  // Vérifier les chevauchements avec d'autres RDV
  let query = supabase
    .from("appointments")
    .select("id, client_name, start_time, end_time")
    .eq("establishment_id", establishmentId)
    .neq("status", "cancelled")
    .lt("start_time", endTime.toISOString())
    .gt("end_time", startTime.toISOString());

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data: appointments } = await query;

  if (appointments && appointments.length > 0) {
    const apt = appointments[0];
    const aptStart = new Date(apt.start_time);
    const aptEnd = new Date(apt.end_time);
    
    return {
      hasConflict: true,
      type: "appointment",
      message: `Ce créneau chevauche un autre rendez-vous (${apt.client_name} de ${aptStart.getHours().toString().padStart(2, "0")}:${aptStart.getMinutes().toString().padStart(2, "0")} à ${aptEnd.getHours().toString().padStart(2, "0")}:${aptEnd.getMinutes().toString().padStart(2, "0")}).`,
    };
  }

  return { hasConflict: false, type: null, message: null };
}

export async function checkUnavailabilityConflicts(
  establishmentId: string,
  startTime: Date,
  endTime: Date,
  excludeUnavailabilityId?: string
): Promise<ConflictResult> {
  const supabase = createClient();

  // Vérifier si la date/heure de fin est après la date/heure de début
  if (endTime <= startTime) {
    return {
      hasConflict: true,
      type: "overlap",
      message: "La date/heure de fin doit être après la date/heure de début.",
    };
  }

  // Vérifier les indisponibilités existantes (strict: < et > pour permettre les événements consécutifs)
  let unavailabilityQuery = supabase
    .from("unavailabilities")
    .select("id, start_time, end_time, unavailability_type, reason")
    .eq("establishment_id", establishmentId)
    .lt("start_time", endTime.toISOString())
    .gt("end_time", startTime.toISOString());

  if (excludeUnavailabilityId) {
    unavailabilityQuery = unavailabilityQuery.neq("id", excludeUnavailabilityId);
  }

  const { data: unavailabilities } = await unavailabilityQuery;

  if (unavailabilities && unavailabilities.length > 0) {
    const typeLabels: Record<string, string> = {
      vacation: "Vacances",
      training: "Formation",
      illness: "Maladie",
      event: "Événement",
      other: "Indisponibilité",
    };
    const unavailability = unavailabilities[0];
    const typeLabel = typeLabels[unavailability.unavailability_type] || "Indisponibilité";
    
    return {
      hasConflict: true,
      type: "unavailability",
      message: `Cette période chevauche déjà une indisponibilité existante (${typeLabel}${unavailability.reason ? ` : ${unavailability.reason}` : ""}).`,
    };
  }

  // Vérifier les RDV existants sur cette plage (strict: < et > pour permettre les événements consécutifs)
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, client_name, start_time, end_time")
    .eq("establishment_id", establishmentId)
    .neq("status", "cancelled")
    .lt("start_time", endTime.toISOString())
    .gt("end_time", startTime.toISOString());

  if (appointments && appointments.length > 0) {
    const count = appointments.length;
    return {
      hasConflict: true,
      type: "appointment",
      message: `Attention : ${count} rendez-vous existant${count > 1 ? "s" : ""} sur cette période. Voulez-vous quand même créer cette indisponibilité ?`,
    };
  }

  return { hasConflict: false, type: null, message: null };
}
