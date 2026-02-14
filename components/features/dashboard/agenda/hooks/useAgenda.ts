"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent, AppointmentData, UnavailabilityData, CalendarViewType } from "../types";
import { AGENDA_CONFIG } from "../constants";

export function useAgenda() {
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("week");
  const lastRequestId = useRef(0);

  const supabase = createClient();

  const loadEstablishment = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("establishments")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setEstablishmentId(data.id);
      }
    } catch (error) {
      console.error("Error loading establishment:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadEvents = useCallback(async () => {
    if (!establishmentId) return;

    const requestId = ++lastRequestId.current;

    try {
      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);

      if (view === "day") {
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (view === "week") {
        // Find Monday of current week
        const day = startDate.getDay();
        const diff = startDate.getDate() - (day === 0 ? 6 : day - 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      const [appointmentsResponse, unavailabilitiesResponse] = await Promise.all([
        supabase
          .from("appointments")
          .select("*, service:services(name, duration, price)")
          .eq("establishment_id", establishmentId)
          .neq("status", "cancelled")
          .gte("start_time", startDate.toISOString())
          .lte("start_time", endDate.toISOString())
          .order("start_time"),
        supabase
          .from("unavailabilities")
          .select("*")
          .eq("establishment_id", establishmentId)
          .lte("start_time", endDate.toISOString())
          .gte("end_time", startDate.toISOString())
          .order("start_time")
      ]);

      const { data: appointments } = appointmentsResponse;
      const { data: unavailabilities } = unavailabilitiesResponse;

      const calendarEvents: CalendarEvent[] = [];

      if (appointments) {
        appointments.forEach((apt) => {
          calendarEvents.push({
            id: apt.id,
            title: apt.service?.name || apt.client_name,
            start: new Date(apt.start_time),
            end: new Date(apt.end_time),
            type: "appointment",
            data: apt,
          });
        });
      }

      if (unavailabilities) {
        unavailabilities.forEach((unav) => {
          calendarEvents.push({
            id: unav.id,
            title: unav.reason || "Indisponible",
            start: new Date(unav.start_time),
            end: new Date(unav.end_time),
            type: "unavailability",
            data: unav,
          });
        });
      }

      if (requestId !== lastRequestId.current) return;

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }, [establishmentId, currentDate, view, supabase]);

  const deleteEvent = useCallback(async (event: CalendarEvent) => {
    try {
      const table = event.type === "appointment" ? "appointments" : "unavailabilities";
      await supabase.from(table).delete().eq("id", event.id);
      await loadEvents();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  }, [supabase, loadEvents]);

  useEffect(() => {
    loadEstablishment();
  }, [loadEstablishment]);

  useEffect(() => {
    if (establishmentId) {
      loadEvents();
    }
  }, [establishmentId, loadEvents]);

  return {
    loading,
    establishmentId,
    events,
    currentDate,
    view,
    setCurrentDate,
    setView,
    loadEvents,
    deleteEvent,
  };
}
