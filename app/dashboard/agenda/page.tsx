"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Ban, Loader2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { 
  CalendarView, 
  AppointmentForm, 
  UnavailabilityForm,
} from "@/components/features/dashboard/agenda";
import type { 
  CalendarEvent,
  AppointmentData,
  UnavailabilityData,
  CalendarViewType 
} from "@/components/features/dashboard/agenda";
import { createClient } from "@/lib/supabase/client";

export default function AgendaPage() {
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("week");
  
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<AppointmentData | null>(null);
  const [editingUnavailability, setEditingUnavailability] = useState<UnavailabilityData | null>(null);
  
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; event: CalendarEvent | null }>({
    open: false,
    event: null,
  });

  const supabase = createClient();

  useEffect(() => {
    loadEstablishment();
  }, []);

  useEffect(() => {
    if (establishmentId) {
      loadEvents();
    }
  }, [establishmentId, currentDate, view]);

  const loadEstablishment = async () => {
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
  };

  const loadEvents = async () => {
    if (!establishmentId) return;

    try {
      // Calculer la plage de dates à charger
      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);

      if (view === "day") {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (view === "week") {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // Charger les rendez-vous
      const { data: appointments } = await supabase
        .from("appointments")
        .select("*, service:services(name, duration, price)")
        .eq("establishment_id", establishmentId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time");

      // Charger les indisponibilités
      const { data: unavailabilities } = await supabase
        .from("unavailabilities")
        .select("*")
        .eq("establishment_id", establishmentId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time");

      const calendarEvents: CalendarEvent[] = [];

      // Convertir les rendez-vous en événements
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

      // Convertir les indisponibilités en événements
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

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleSlotClick = (date: Date) => {
    setSelectedDate(date);
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === "appointment") {
      setEditingAppointment(event.data as AppointmentData);
      setShowAppointmentForm(true);
    } else {
      setEditingUnavailability(event.data as UnavailabilityData);
      setShowUnavailabilityForm(true);
    }
  };

  const handleAppointmentSave = (appointment: AppointmentData) => {
    loadEvents();
    setShowAppointmentForm(false);
    setEditingAppointment(null);
    setSelectedDate(undefined);
  };

  const handleUnavailabilitySave = (unavailability: UnavailabilityData) => {
    loadEvents();
    setShowUnavailabilityForm(false);
    setEditingUnavailability(null);
    setSelectedDate(undefined);
  };

  const handleDelete = async () => {
    if (!deleteModal.event) return;

    try {
      const table = deleteModal.event.type === "appointment" ? "appointments" : "unavailabilities";
      await supabase.from(table).delete().eq("id", deleteModal.event.id);
      loadEvents();
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeleteModal({ open: false, event: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!establishmentId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <Calendar size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500">Veuillez d'abord configurer votre établissement.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-2 lg:gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl lg:text-2xl font-bold text-primary">Mon Agenda</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDate(new Date());
              setEditingUnavailability(null);
              setShowUnavailabilityForm(true);
            }}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs lg:text-sm"
          >
            <Ban size={16} className="mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Indisponibilité</span>
            <span className="sm:hidden">Indispo.</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedDate(new Date());
              setEditingAppointment(null);
              setShowAppointmentForm(true);
            }}
            className="bg-primary hover:bg-primary-dark text-xs lg:text-sm"
          >
            <Plus size={16} className="mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Nouveau RDV</span>
            <span className="sm:hidden">RDV</span>
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 min-h-0">
        <CalendarView
          events={events}
          currentDate={currentDate}
          view={view}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          onEventClick={handleEventClick}
          onSlotClick={handleSlotClick}
        />
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AppointmentForm
            appointment={editingAppointment}
            establishmentId={establishmentId}
            selectedDate={selectedDate}
            onSave={handleAppointmentSave}
            onCancel={() => {
              setShowAppointmentForm(false);
              setEditingAppointment(null);
              setSelectedDate(undefined);
            }}
          />
        </div>
      )}

      {/* Unavailability Form Modal */}
      {showUnavailabilityForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <UnavailabilityForm
            unavailability={editingUnavailability}
            establishmentId={establishmentId}
            selectedDate={selectedDate}
            onSave={handleUnavailabilitySave}
            onCancel={() => {
              setShowUnavailabilityForm(false);
              setEditingUnavailability(null);
              setSelectedDate(undefined);
            }}
          />
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, event: null })}
        title={deleteModal.event?.type === "appointment" ? "Supprimer le rendez-vous" : "Supprimer l'indisponibilité"}
        message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
        variant="error"
        confirmText="Supprimer"
        cancelText="Annuler"
        showCancel
        onConfirm={handleDelete}
      />
    </div>
  );
}
