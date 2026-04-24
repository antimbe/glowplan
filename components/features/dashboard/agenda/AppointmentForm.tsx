"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, FileText, Clock, X, AlertTriangle, Loader2, Ban, UserCheck } from "lucide-react";
import { Button, Input, Textarea, Select, FormField, FormModal, Modal } from "@/components/ui";
import { AppointmentData } from "./types";
import { checkAppointmentConflicts, ConflictResult } from "./hooks";
import { ServiceData } from "../business/types";
import { createClient } from "@/lib/supabase/client";
import { useModal } from "@/contexts/ModalContext";

interface AppointmentFormProps {
  appointment?: AppointmentData | null;
  establishmentId: string;
  selectedDate?: Date;
  onSave: (appointment: AppointmentData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const TIME_OPTIONS = Array.from({ length: 53 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

export default function AppointmentForm({
  appointment,
  establishmentId,
  selectedDate,
  onSave,
  onCancel,
  onDelete
}: AppointmentFormProps) {
  const { showError } = useModal();

  const [formData, setFormData] = useState<Partial<AppointmentData>>({
    client_name: appointment?.client_name || "",
    client_email: appointment?.client_email || "",
    client_phone: appointment?.client_phone || "",
    service_id: appointment?.service_id || null,
    start_time: appointment?.start_time || "",
    end_time: appointment?.end_time || "",
    notes: appointment?.notes || "",
    status: appointment?.status || "confirmed",
    is_manual: true,
  });

  const [services, setServices] = useState<ServiceData[]>([]);
  const [saving, setSaving] = useState(false);
  const [customServiceName, setCustomServiceName] = useState(
    appointment?.service_id === "other" ? (appointment?.notes?.match(/^\[Prestation: (.+?)\]/))?.[1] ?? "" : ""
  );
  const [conflictModal, setConflictModal] = useState<{ open: boolean; conflict: ConflictResult | null }>({
    open: false,
    conflict: null,
  });
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [date, setDate] = useState(
    selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(() => {
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
    return "09:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (selectedDate) {
      const endDate = new Date(selectedDate);
      endDate.setHours(endDate.getHours() + 1);
      return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
    }
    return "10:00";
  });

  const supabase = createClient();

  useEffect(() => {
    loadServices();
    if (appointment?.start_time) {
      const start = new Date(appointment.start_time);
      const end = new Date(appointment.end_time);
      setDate(start.toISOString().split("T")[0]);
      setStartTime(`${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`);
      setEndTime(`${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`);
    }
  }, [establishmentId]);

  const loadServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("establishment_id", establishmentId)
      .eq("is_active", true)
      .order("name");

    if (data) setServices(data);
  };

  const getServiceById = (serviceId: string | null | undefined) => {
    if (!serviceId || serviceId === "none" || serviceId === "other") return null;
    return services.find(s => s.id === serviceId) || null;
  };

  const calculateEndTime = (start: string, duration: number) => {
    const [hours, minutes] = start.split(":").map(Number);
    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleServiceChange = (serviceId: string) => {
    if (serviceId === "none") {
      setFormData(prev => ({ ...prev, service_id: null }));
      setCustomServiceName("");
      return;
    }
    if (serviceId === "other") {
      setFormData(prev => ({ ...prev, service_id: "other" as any }));
      return;
    }

    const service = services.find(s => s.id === serviceId);
    setFormData(prev => ({ ...prev, service_id: serviceId || null }));

    if (service) {
      setEndTime(calculateEndTime(startTime, service.duration));
    }
    setCustomServiceName("");
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    const service = getServiceById(formData.service_id as string | null | undefined);
    if (service) {
      setEndTime(calculateEndTime(newStartTime, service.duration));
    }
  };

  const handleSubmit = async (skipConflictCheck = false) => {
    if (!formData.client_name || !date || !startTime || !endTime) return;

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);
    const now = new Date();

    // Refuser les RDV dans le passé (sauf lors d'une modification d'un RDV existant)
    if (startDateTime < now && !appointment?.id) {
      setGlobalError("Impossible de créer un rendez-vous à une date ou heure déjà passée.");
      return;
    }

    if (endDateTime <= startDateTime) {
      setGlobalError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    setGlobalError(null);

    // Vérifier les conflits avant de sauvegarder
    if (!skipConflictCheck) {
      setSaving(true);
      const conflict = await checkAppointmentConflicts(
        establishmentId,
        startDateTime,
        endDateTime,
        appointment?.id
      );

      if (conflict.hasConflict) {
        setSaving(false);
        setConflictModal({ open: true, conflict });
        return;
      }
    }

    setSaving(true);
    try {
      // Normaliser service_id : "other" et "none" ne sont pas de vraies FK
      const resolvedServiceId =
        (formData.service_id as string) === "other" || (formData.service_id as string) === "none" || !formData.service_id
          ? null
          : formData.service_id;

      // Si "Autre", préfixer le nom saisi dans les notes
      const resolvedNotes =
        (formData.service_id as string) === "other" && customServiceName.trim()
          ? `[Prestation: ${customServiceName.trim()}]${formData.notes ? `\n${formData.notes}` : ""}`
          : formData.notes ?? null;

      const nameParts = (formData.client_name || "").trim().split(/\s+/);
      const resolvedFirstName = nameParts[0] || "";
      const resolvedLastName = nameParts.slice(1).join(" ") || "";

      const appointmentData = {
        establishment_id: establishmentId,
        service_id: resolvedServiceId,
        client_name: formData.client_name,
        client_first_name: resolvedFirstName,
        client_last_name: resolvedLastName,
        client_email: formData.client_email || null,
        client_phone: formData.client_phone || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: formData.status || "confirmed",
        is_manual: true,
        notes: resolvedNotes,
      };

      if (appointment?.id) {
        // Sauvegarder les anciennes valeurs pour l'email de notification
        const oldStartDate = new Date(appointment.start_time);
        const oldEndDate = new Date(appointment.end_time);
        const oldService = services.find(s => s.id === appointment.service_id);
        const newService = services.find(s => s.id === formData.service_id);

        const { data, error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", appointment.id)
          .select()
          .single();

        if (error) throw error;

        // Vérifier si des changements ont été faits et envoyer un email
        const dateChanged = oldStartDate.toDateString() !== startDateTime.toDateString();
        const timeChanged = oldStartDate.getTime() !== startDateTime.getTime() || oldEndDate.getTime() !== endDateTime.getTime();
        const serviceChanged = appointment.service_id !== formData.service_id;

        if (dateChanged || timeChanged || serviceChanged) {
          const formatDateStr = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
          const formatTimeStr = (d: Date) => `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

          await fetch("/api/booking/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentId: appointment.id,
              changes: {
                date: dateChanged,
                oldDate: formatDateStr(oldStartDate),
                newDate: formatDateStr(startDateTime),
                time: timeChanged,
                oldTime: `${formatTimeStr(oldStartDate)} - ${formatTimeStr(oldEndDate)}`,
                newTime: `${formatTimeStr(startDateTime)} - ${formatTimeStr(endDateTime)}`,
                service: serviceChanged,
                oldService: oldService?.name || "Non spécifiée",
                newService: newService?.name || "Non spécifiée",
              },
            }),
          });
        }

        onSave(data);
      } else {
        const { data, error } = await supabase
          .from("appointments")
          .insert(appointmentData)
          .select()
          .single();

        if (error) throw error;

        // Envoyer l'email de notification pour création manuelle
        if (data.client_email) {
          await fetch("/api/booking/manual-create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointmentId: data.id }),
          });
        }

        onSave(data);
      }
    } catch (error: any) {
      console.error("Erreur détaillée sauvegarde:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      setGlobalError(error.message || "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const isValid = formData.client_name && date && startTime && endTime;

  const timeOptions = TIME_OPTIONS.map(time => ({ value: time, label: time }));
  const serviceOptions = [
    { value: "none", label: "— Aucune prestation —" },
    ...services.map(s => ({
      value: s.id || "",
      label: `${s.name} - ${s.price}€ (${s.duration} min)`
    })),
    { value: "other", label: "✏️ Autre (saisie libre)" },
  ];

  const handleConfirmAppointment = async () => {
    if (!appointment?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", appointment.id);

      if (error) throw error;

      // Envoyer l'email de confirmation au client
      await fetch("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id }),
      });

      onSave({ ...appointment, status: "confirmed" });
    } catch (error) {
      console.error("Error confirming appointment:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRefuseAppointment = async () => {
    if (!appointment?.id) return;

    setCancelling(true);
    try {
      await fetch("/api/booking/refuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          reason: cancelReason || null,
        }),
      });

      setCancelModal(false);
      setCancelReason("");
      onSave({ ...appointment, status: "refused" } as AppointmentData);
    } catch (error) {
      console.error("Error refusing appointment:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment?.id) return;

    setCancelling(true);
    try {
      // Call API to cancel appointment (which updates DB and sends email)
      const response = await fetch("/api/booking/cancel-by-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          reason: cancelReason || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel appointment");
      }

      setCancelModal(false);
      setCancelReason("");
      onSave(appointment as AppointmentData); // Rafraîchir le calendrier et fermer
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      showError("Annulation impossible", "Une erreur est survenue lors de l'annulation du rendez-vous.");
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!appointment?.id) return;
    setCancelling(true);
    try {
      const response = await fetch("/api/booking/mark-no-show", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ appointmentId: appointment.id }),
      });
      if (!response.ok) throw new Error("Erreur");
      
      setCancelModal(false);
      onSave({ ...appointment, status: "no_show" } as AppointmentData);
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };
  
  const handleMarkCompleted = async () => {
    if (!appointment?.id) return;
    setSaving(true);
    try {
      const response = await fetch("/api/booking/mark-completed", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ appointmentId: appointment.id }),
      });
      if (!response.ok) throw new Error("Erreur");
      
      setCancelModal(false);
      onSave({ ...appointment, status: "completed" } as AppointmentData);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const [modalMode, setModalMode] = useState<"cancel" | "refuse" | "no_show" | "completed">("cancel");

  // Vérifier si le rendez-vous est totalement terminé ou dans un état final
  const isPast = appointment?.end_time ? new Date(appointment.end_time) < new Date() : false;
  const isFinalStatus = !!(appointment?.status && ["completed", "no_show", "cancelled", "refused"].includes(appointment.status));
  const isReadOnly = isPast || isFinalStatus;
  
  // Vérifier si le RDV vient d'un client (externe)
  const isExternal = !!(appointment && !appointment.is_manual);

  const footer = (
    <div className="flex flex-wrap items-center gap-2">
      {appointment && (appointment.status === "pending" || appointment.status === "confirmed") && !isPast && (
        <Button variant="danger" onClick={() => { setModalMode("cancel"); setCancelModal(true); }} size="sm">
          <X size={14} className="mr-1" />
          Annuler le RDV
        </Button>
      )}
      {appointment?.status === "pending" && !isPast && (
        <Button variant="outline" onClick={() => { setModalMode("refuse"); setCancelModal(true); }} size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
          <X size={14} className="mr-1" />
          Refuser le RDV
        </Button>
      )}
      {appointment && (appointment.status === "confirmed" || appointment.status === "completed") && isPast && (
        <Button variant="outline" onClick={() => { setModalMode("no_show"); setCancelModal(true); }} size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
          <Ban size={14} className="mr-1" />
          Marquer Lapin
        </Button>
      )}
      {appointment?.status === "confirmed" && isPast && (
        <Button variant="primary" onClick={() => { setModalMode("completed"); setCancelModal(true); }} size="sm" className="bg-green-600 hover:bg-green-700 text-white border-none">
          <UserCheck size={14} className="mr-1" />
          Marquer Honoré
        </Button>
      )}
      <div className="flex-1" />
      {appointment?.status === "pending" && !isReadOnly && (
        <Button
          variant="primary"
          onClick={handleConfirmAppointment}
          disabled={saving}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white border-none"
        >
          <UserCheck size={14} className="mr-1" />
          Confirmer le RDV
        </Button>
      )}
      <Button
        variant="primary"
        onClick={isReadOnly ? onCancel : () => handleSubmit()}
        disabled={(!isReadOnly && !isValid) || saving}
        loading={saving}
        size="sm"
      >
        {isReadOnly ? "Fermer" : (appointment ? "Modifier" : "Créer le RDV")}
      </Button>
    </div>
  );

  return (
    <>
      <FormModal
        isOpen={true}
        onClose={onCancel}
        title={isReadOnly ? "Détails du rendez-vous" : (appointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous")}
        subtitle={isReadOnly ? "Consultation des informations" : "Remplissez les informations client"}
        icon={<User className="w-5 h-5 text-white" />}
        variant="primary"
        footer={footer}
      >
        <div className="flex flex-col gap-4 lg:gap-5">
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm font-medium">{globalError}</span>
            </div>
          )}
          <FormField
            label="Nom du client"
            required
            leftIcon={<User size={14} className="text-primary" />}
          >
            <Input
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="Nom complet du client"
              fullWidth
              className="h-11"
              disabled={isReadOnly || isExternal}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Email"
              leftIcon={<Mail size={14} className="text-primary" />}
            >
              <Input
                type="email"
                value={formData.client_email || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="email@exemple.com"
                fullWidth
                className="h-11"
                disabled={isReadOnly || isExternal}
              />
            </FormField>
            <FormField
              label="Téléphone"
              leftIcon={<Phone size={14} className="text-primary" />}
            >
              <Input
                type="tel"
                value={formData.client_phone || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                placeholder="06 12 34 56 78"
                fullWidth
                className="h-11"
                disabled={isReadOnly || isExternal}
              />
            </FormField>
          </div>

          {services.length > 0 && (
            <div className="flex flex-col gap-2">
              <Select
                label="Prestation"
                value={(formData.service_id as string) === "other" ? "other" : (formData.service_id || "none")}
                onChange={(e) => handleServiceChange(e.target.value)}
                options={serviceOptions}
                fullWidth
                size="md"
                disabled={isReadOnly}
              />
              {(formData.service_id as string) === "other" && (
                <Input
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="Décrivez la prestation (optionnel)..."
                  fullWidth
                  className="h-11"
                />
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4">
            <FormField
              label="Date et horaires"
              required
              leftIcon={<Clock size={14} className="text-primary" />}
            >
              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 mb-1">Date</span>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    fullWidth
                    className="h-11 !p-3"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 mb-1">Début</span>
                  <Select
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    options={timeOptions}
                    fullWidth
                    size="md"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 mb-1">Fin</span>
                  <Select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    options={timeOptions}
                    fullWidth
                    size="md"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </FormField>
          </div>

          <FormField
            label="Notes (optionnel)"
            leftIcon={<FileText size={14} className="text-primary" />}
          >
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires sur le rendez-vous..."
              rows={2}
              fullWidth
              disabled={isReadOnly}
            />
          </FormField>
        </div>
      </FormModal>

      <Modal
        isOpen={conflictModal.open}
        onClose={() => setConflictModal({ open: false, conflict: null })}
        title="Conflit de créneau"
        message={conflictModal.conflict?.message || ""}
        variant="warning"
        confirmText={conflictModal.conflict?.type === "appointment" ? "Créer quand même" : "Compris"}
        cancelText={conflictModal.conflict?.type === "appointment" ? "Annuler" : undefined}
        showCancel={conflictModal.conflict?.type === "appointment"}
        onConfirm={() => {
          if (conflictModal.conflict?.type === "appointment") {
            setConflictModal({ open: false, conflict: null });
            handleSubmit(true);
          } else {
            setConflictModal({ open: false, conflict: null });
          }
        }}
      />

      {/* Modal d'annulation / refuse */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "cancel" ? "Annuler le rendez-vous" : 
                 modalMode === "refuse" ? "Refuser le rendez-vous" : 
                 modalMode === "no_show" ? "Marquer comme non honoré (Lapin)" :
                 "Marquer comme honoré"}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {modalMode === "cancel" 
                ? "Êtes-vous sûr de vouloir annuler ce rendez-vous ? Un email sera envoyé au client pour l'informer."
                : modalMode === "refuse" 
                  ? "Êtes-vous sûr de vouloir refuser cette demande ? Le créneau sera libéré et un email de refus sera envoyé au client."
                  : modalMode === "no_show"
                    ? "Le client ne s'est pas présenté ? Cette action le marquera comme non honoré (lapin)."
                    : "Le client s'est bien présenté ? Cette action marquera le rendez-vous comme effectué."
              }
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif {modalMode === "cancel" ? "d'annulation" : "du refus"} (optionnel)
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Indisponibilité, créneau complet..."
                rows={2}
                fullWidth
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setCancelModal(false); setCancelReason(""); }}
                size="sm"
              >
                Retour
              </Button>
              <Button
                variant="danger"
                onClick={
                   modalMode === "cancel" ? handleCancelAppointment : 
                   modalMode === "refuse" ? handleRefuseAppointment : 
                   modalMode === "no_show" ? handleMarkNoShow :
                   handleMarkCompleted
                }
                disabled={cancelling || saving}
                size="sm"
              >
                {(cancelling || saving) ? <Loader2 className="animate-spin mr-1" size={14} /> : null}
                {modalMode === "cancel" ? "Confirmer l'annulation" : 
                 modalMode === "refuse" ? "Confirmer le refus" :
                 modalMode === "no_show" ? "Confirmer Lapin" :
                 "Confirmer Honoré"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
