"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, FileText, Clock, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button, Input, Textarea, Select, FormField, FormModal, Modal } from "@/components/ui";
import { AppointmentData } from "./types";
import { checkAppointmentConflicts, ConflictResult } from "./hooks";
import { ServiceData } from "../business/types";
import { createClient } from "@/lib/supabase/client";

interface AppointmentFormProps {
  appointment?: AppointmentData | null;
  establishmentId: string;
  selectedDate?: Date;
  onSave: (appointment: AppointmentData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const TIME_OPTIONS = Array.from({ length: 27 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7;
  const minutes = (i % 2) * 30;
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
  const [conflictModal, setConflictModal] = useState<{ open: boolean; conflict: ConflictResult | null }>({
    open: false,
    conflict: null,
  });
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
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

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setFormData(prev => ({ ...prev, service_id: serviceId || null }));
    
    if (service) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date(date);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate.getTime() + service.duration * 60000);
      setEndTime(`${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`);
    }
  };

  const handleSubmit = async (skipConflictCheck = false) => {
    if (!formData.client_name || !date || !startTime || !endTime) return;

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

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
      const appointmentData = {
        ...formData,
        establishment_id: establishmentId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
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
        onSave(data);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const isValid = formData.client_name && date && startTime && endTime;

  const timeOptions = TIME_OPTIONS.map(time => ({ value: time, label: time }));
  const serviceOptions = services.map(s => ({ 
    value: s.id || "", 
    label: `${s.name} - ${s.price}€ (${s.duration} min)` 
  }));

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

  const handleCancelAppointment = async () => {
    if (!appointment?.id) return;
    
    setCancelling(true);
    try {
      // Mettre à jour le statut du RDV
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: "cancelled",
          cancelled_by_client: false,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancelReason || null,
        })
        .eq("id", appointment.id);

      if (error) throw error;

      // Envoyer l'email d'annulation
      await fetch("/api/booking/cancel-by-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          appointmentId: appointment.id,
          reason: cancelReason || null,
        }),
      });

      setCancelModal(false);
      setCancelReason("");
      onSave(appointment as AppointmentData); // Rafraîchir le calendrier et fermer
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setCancelling(false);
    }
  };

  const footer = (
    <div className="flex flex-wrap items-center gap-2">
      {appointment && (appointment.status === "pending" || appointment.status === "confirmed") && (
        <Button variant="danger" onClick={() => setCancelModal(true)} size="sm">
          <X size={14} className="mr-1" />
          Annuler le RDV
        </Button>
      )}
      <div className="flex-1" />
      {appointment?.status === "pending" && (
        <Button
          variant="primary"
          onClick={handleConfirmAppointment}
          disabled={saving}
          size="sm"
        >
          Confirmer le RDV
        </Button>
      )}
      <Button
        variant="primary"
        onClick={() => handleSubmit()}
        disabled={!isValid || saving}
        loading={saving}
        size="sm"
      >
        {appointment ? "Modifier" : "Créer le RDV"}
      </Button>
    </div>
  );

  return (
    <>
    <FormModal
      isOpen={true}
      onClose={onCancel}
      title={appointment ? "Modifier le RDV" : "Nouveau rendez-vous"}
      subtitle="Remplissez les informations client"
      icon={<User className="w-5 h-5 text-white" />}
      variant="primary"
      footer={footer}
    >
      <div className="flex flex-col gap-4 lg:gap-5">
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
            />
          </FormField>
        </div>

        {services.length > 0 && (
          <Select
            label="Prestation"
            value={formData.service_id || ""}
            onChange={(e) => handleServiceChange(e.target.value)}
            options={serviceOptions}
            placeholder="Sélectionner une prestation"
            fullWidth
            size="md"
          />
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
                  fullWidth
                  className="h-11 !p-3"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Début</span>
                <Select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  options={timeOptions}
                  fullWidth
                  size="md"
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

      {/* Modal d'annulation */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Annuler le rendez-vous</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir annuler ce rendez-vous ? Un email sera envoyé au client pour l'informer.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif d'annulation (optionnel)
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Indisponibilité, urgence personnelle..."
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
                onClick={handleCancelAppointment}
                disabled={cancelling}
                size="sm"
              >
                {cancelling ? <Loader2 className="animate-spin mr-1" size={14} /> : null}
                Confirmer l'annulation
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
