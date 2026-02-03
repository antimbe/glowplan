"use client";

import { Modal } from "@/components/ui";
import AppointmentForm from "./AppointmentForm";
import UnavailabilityForm from "./UnavailabilityForm";
import type { AppointmentData, UnavailabilityData, CalendarEvent } from "./types";

interface AgendaModalsProps {
  establishmentId: string;
  showAppointmentForm: boolean;
  showUnavailabilityForm: boolean;
  selectedDate?: Date;
  editingAppointment: AppointmentData | null;
  editingUnavailability: UnavailabilityData | null;
  deleteModal: { open: boolean; event: CalendarEvent | null };
  onAppointmentSave: () => void;
  onUnavailabilitySave: () => void;
  onCloseAppointmentForm: () => void;
  onCloseUnavailabilityForm: () => void;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
  onDeleteAppointment?: () => void;
  onDeleteUnavailability?: () => void;
}

export default function AgendaModals({
  establishmentId,
  showAppointmentForm,
  showUnavailabilityForm,
  selectedDate,
  editingAppointment,
  editingUnavailability,
  deleteModal,
  onAppointmentSave,
  onUnavailabilitySave,
  onCloseAppointmentForm,
  onCloseUnavailabilityForm,
  onCloseDeleteModal,
  onConfirmDelete,
  onDeleteAppointment,
  onDeleteUnavailability,
}: AgendaModalsProps) {
  return (
    <>
      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          establishmentId={establishmentId}
          selectedDate={selectedDate}
          onSave={onAppointmentSave}
          onCancel={onCloseAppointmentForm}
          onDelete={editingAppointment ? onDeleteAppointment : undefined}
        />
      )}

      {showUnavailabilityForm && (
        <UnavailabilityForm
          unavailability={editingUnavailability}
          establishmentId={establishmentId}
          selectedDate={selectedDate}
          onSave={onUnavailabilitySave}
          onCancel={onCloseUnavailabilityForm}
          onDelete={editingUnavailability ? onDeleteUnavailability : undefined}
        />
      )}

      <Modal
        isOpen={deleteModal.open}
        onClose={onCloseDeleteModal}
        title={deleteModal.event?.type === "appointment" ? "Supprimer le rendez-vous" : "Supprimer l'indisponibilité"}
        message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
        variant="error"
        confirmText="Supprimer"
        cancelText="Annuler"
        showCancel
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
