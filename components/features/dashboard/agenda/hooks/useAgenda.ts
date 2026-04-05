"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchOccupationData } from "@/lib/utils/booking-fetcher";
import type { CalendarEvent, AppointmentData, UnavailabilityData, CalendarViewType } from "../types";
import { AGENDA_CONFIG } from "../constants";

export function useAgenda() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState({
    showAppointments: true,
    showUnavailabilities: true,
    showCancelled: false,
  });
  
  // Initialisation à partir des paramètres d'URL (ex: notifications)
  const initialDate = useMemo(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const d = new Date(dateParam);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [searchParams]);

  const initialView = useMemo(() => {
    const viewParam = searchParams.get('view') as CalendarViewType;
    if (viewParam && ["day", "week", "month"].includes(viewParam)) return viewParam;
    return "week";
  }, [searchParams]);

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<CalendarViewType>(initialView);
  
  // Mettre à jour si les paramètres d'URL changent (clic sur une nouvelle notif)
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const d = new Date(dateParam);
      if (!isNaN(d.getTime())) setCurrentDate(d);
    }
    
    const viewParam = searchParams.get('view') as CalendarViewType;
    if (viewParam && ["day", "week", "month"].includes(viewParam)) setView(viewParam);
  }, [searchParams]);

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

      const { appointments, unavailabilities } = await fetchOccupationData(
        establishmentId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      const calendarEvents: CalendarEvent[] = [];

      appointments.forEach((apt) => {
        calendarEvents.push({
          id: apt.id,
          title: (apt as any).service?.name || apt.client_name,
          start: new Date(apt.start_time),
          end: new Date(apt.end_time),
          type: "appointment",
          data: apt as any,
        });
      });

      unavailabilities.forEach((unav) => {
        calendarEvents.push({
          id: unav.id,
          title: unav.reason || "Indisponible",
          start: new Date(unav.start_time),
          end: new Date(unav.end_time),
          type: "unavailability",
          data: unav as any,
        });
      });

      if (requestId !== lastRequestId.current) return;

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }, [establishmentId, currentDate, view, supabase]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (e.type === "appointment") {
        const apt = e.data as AppointmentData;
        if (apt.status === "cancelled") return filters.showCancelled;
        return filters.showAppointments;
      }
      return filters.showUnavailabilities;
    });
  }, [events, filters]);

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

      // Activation de Supabase Realtime pour l'establishment
      const channel = supabase
        .channel(`establishment-${establishmentId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `establishment_id=eq.${establishmentId}`
          },
          () => loadEvents()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'unavailabilities',
            filter: `establishment_id=eq.${establishmentId}`
          },
          () => loadEvents()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [establishmentId, loadEvents, supabase]);

  return {
    loading,
    establishmentId,
    events: filteredEvents,
    allEvents: events,
    filters,
    setFilters,
    currentDate,
    view,
    setCurrentDate,
    setView,
    loadEvents,
    deleteEvent,
  };
}
