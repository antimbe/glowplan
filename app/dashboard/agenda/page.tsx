"use client";

import { 
  CalendarView, 
  AgendaHeader,
  AgendaLoading,
  AgendaEmpty,
  AgendaModals,
  useAgenda,
  useAgendaModals,
} from "@/components/features/dashboard/agenda";

export default function AgendaPage() {
  const {
    loading,
    establishmentId,
    events,
    currentDate,
    view,
    setCurrentDate,
    setView,
    loadEvents,
    deleteEvent,
  } = useAgenda();

  const modals = useAgendaModals(loadEvents);

  const handleConfirmDelete = async () => {
    if (modals.deleteModal.event) {
      await deleteEvent(modals.deleteModal.event);
      modals.closeDeleteModal();
    }
  };

  const handleDeleteAppointment = () => {
    if (modals.editingAppointment) {
      modals.openDeleteModal({
        id: modals.editingAppointment.id!,
        type: "appointment",
        title: modals.editingAppointment.client_name,
        start: new Date(modals.editingAppointment.start_time),
        end: new Date(modals.editingAppointment.end_time),
        data: modals.editingAppointment,
      });
      modals.closeAppointmentForm();
    }
  };

  const handleDeleteUnavailability = () => {
    if (modals.editingUnavailability) {
      modals.openDeleteModal({
        id: modals.editingUnavailability.id!,
        type: "unavailability",
        title: modals.editingUnavailability.reason || "Indisponibilité",
        start: new Date(modals.editingUnavailability.start_time),
        end: new Date(modals.editingUnavailability.end_time),
        data: modals.editingUnavailability,
      });
      modals.closeUnavailabilityForm();
    }
  };

  if (loading) {
    return <AgendaLoading />;
  }

  if (!establishmentId) {
    return <AgendaEmpty />;
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-2 lg:gap-4">
      <AgendaHeader
        onNewAppointment={modals.openNewAppointment}
        onNewUnavailability={modals.openNewUnavailability}
      />

      <div className="flex-1 min-h-0">
        <CalendarView
          events={events}
          currentDate={currentDate}
          view={view}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          onEventClick={modals.handleEventClick}
          onSlotClick={modals.handleSlotClick}
        />
      </div>

      <AgendaModals
        establishmentId={establishmentId}
        showAppointmentForm={modals.showAppointmentForm}
        showUnavailabilityForm={modals.showUnavailabilityForm}
        selectedDate={modals.selectedDate}
        editingAppointment={modals.editingAppointment}
        editingUnavailability={modals.editingUnavailability}
        deleteModal={modals.deleteModal}
        onAppointmentSave={modals.handleAppointmentSave}
        onUnavailabilitySave={modals.handleUnavailabilitySave}
        onCloseAppointmentForm={modals.closeAppointmentForm}
        onCloseUnavailabilityForm={modals.closeUnavailabilityForm}
        onCloseDeleteModal={modals.closeDeleteModal}
        onConfirmDelete={handleConfirmDelete}
        onDeleteAppointment={handleDeleteAppointment}
        onDeleteUnavailability={handleDeleteUnavailability}
      />
    </div>
  );
}
