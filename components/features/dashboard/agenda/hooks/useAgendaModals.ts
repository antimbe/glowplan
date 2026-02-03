"use client";

import { useState, useCallback } from "react";
import type { AppointmentData, UnavailabilityData, CalendarEvent } from "../types";

export function useAgendaModals(onRefresh: () => void) {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<AppointmentData | null>(null);
  const [editingUnavailability, setEditingUnavailability] = useState<UnavailabilityData | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; event: CalendarEvent | null }>({
    open: false,
    event: null,
  });

  const openNewAppointment = useCallback(() => {
    setSelectedDate(new Date());
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  }, []);

  const openNewUnavailability = useCallback(() => {
    setSelectedDate(new Date());
    setEditingUnavailability(null);
    setShowUnavailabilityForm(true);
  }, []);

  const handleSlotClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    if (event.type === "appointment") {
      setEditingAppointment(event.data as AppointmentData);
      setShowAppointmentForm(true);
    } else {
      setEditingUnavailability(event.data as UnavailabilityData);
      setShowUnavailabilityForm(true);
    }
  }, []);

  const handleAppointmentSave = useCallback(() => {
    onRefresh();
    setShowAppointmentForm(false);
    setEditingAppointment(null);
    setSelectedDate(undefined);
  }, [onRefresh]);

  const handleUnavailabilitySave = useCallback(() => {
    onRefresh();
    setShowUnavailabilityForm(false);
    setEditingUnavailability(null);
    setSelectedDate(undefined);
  }, [onRefresh]);

  const closeAppointmentForm = useCallback(() => {
    setShowAppointmentForm(false);
    setEditingAppointment(null);
    setSelectedDate(undefined);
  }, []);

  const closeUnavailabilityForm = useCallback(() => {
    setShowUnavailabilityForm(false);
    setEditingUnavailability(null);
    setSelectedDate(undefined);
  }, []);

  const openDeleteModal = useCallback((event: CalendarEvent) => {
    setDeleteModal({ open: true, event });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ open: false, event: null });
  }, []);

  return {
    showAppointmentForm,
    showUnavailabilityForm,
    selectedDate,
    editingAppointment,
    editingUnavailability,
    deleteModal,
    openNewAppointment,
    openNewUnavailability,
    handleSlotClick,
    handleEventClick,
    handleAppointmentSave,
    handleUnavailabilitySave,
    closeAppointmentForm,
    closeUnavailabilityForm,
    openDeleteModal,
    closeDeleteModal,
  };
}
