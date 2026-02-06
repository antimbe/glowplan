"use client";

import { useState } from "react";
import { Clock, FileText, Ban, Trash2, Tag, Calendar, User, AlertTriangle, Check } from "lucide-react";
import { Button, Input, Select, FormField, FormModal, Modal } from "@/components/ui";
import { UnavailabilityData, UnavailabilityType } from "./types";
import { checkUnavailabilityConflicts, ConflictResult, ConflictingAppointment } from "./hooks";
import { createClient } from "@/lib/supabase/client";

interface UnavailabilityFormProps {
  unavailability?: UnavailabilityData | null;
  establishmentId: string;
  selectedDate?: Date;
  onSave: (unavailability: UnavailabilityData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const TIME_OPTIONS = Array.from({ length: 27 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7;
  const minutes = (i % 2) * 30;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

const UNAVAILABILITY_TYPES = [
  { value: "vacation", label: "Vacances" },
  { value: "training", label: "Formation" },
  { value: "illness", label: "Maladie" },
  { value: "event", label: "Événement" },
  { value: "other", label: "Autre" },
];

export default function UnavailabilityForm({ 
  unavailability, 
  establishmentId, 
  selectedDate,
  onSave, 
  onCancel,
  onDelete
}: UnavailabilityFormProps) {
  const [startDate, setStartDate] = useState(
    selectedDate ? selectedDate.toISOString().split("T")[0] : 
    unavailability?.start_time ? new Date(unavailability.start_time).toISOString().split("T")[0] :
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    unavailability?.end_time ? new Date(unavailability.end_time).toISOString().split("T")[0] :
    selectedDate ? selectedDate.toISOString().split("T")[0] :
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(() => {
    if (unavailability?.start_time) {
      const d = new Date(unavailability.start_time);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return "09:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (unavailability?.end_time) {
      const d = new Date(unavailability.end_time);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return "18:00";
  });
  const [unavailabilityType, setUnavailabilityType] = useState<UnavailabilityType>(
    unavailability?.unavailability_type || "other"
  );
  const [reason, setReason] = useState(unavailability?.reason || "");
  const [saving, setSaving] = useState(false);
  const [conflictModal, setConflictModal] = useState<{ 
    open: boolean; 
    conflict: ConflictResult | null; 
    selectedAppointments: string[];
    customCancelReason: string;
  }>({
    open: false,
    conflict: null,
    selectedAppointments: [],
    customCancelReason: "",
  });

  const supabase = createClient();

  const handleSubmit = async (skipConflictCheck = false, appointmentsToCancel: string[] = [], customReason?: string) => {
    if (!startDate || !endDate || !startTime || !endTime) return;

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    // Vérifier les conflits avant de sauvegarder
    if (!skipConflictCheck) {
      setSaving(true);
      const conflict = await checkUnavailabilityConflicts(
        establishmentId,
        startDateTime,
        endDateTime,
        unavailability?.id
      );
      
      if (conflict.hasConflict) {
        setSaving(false);
        if (conflict.type === "appointment" && conflict.conflictingAppointments) {
          setConflictModal({ 
            open: true, 
            conflict, 
            selectedAppointments: [],
            customCancelReason: "",
          });
        } else {
          setConflictModal({ open: true, conflict, selectedAppointments: [], customCancelReason: "" });
        }
        return;
      }
    }

    setSaving(true);
    try {
      // Annuler les rendez-vous sélectionnés
      if (appointmentsToCancel.length > 0) {
        // Utiliser le motif personnalisé s'il existe, sinon le motif automatique
        const defaultReason = `Indisponibilité du professionnel : ${UNAVAILABILITY_TYPES.find(t => t.value === unavailabilityType)?.label || unavailabilityType}${reason ? ` - ${reason}` : ""}`;
        const cancelReason = customReason || defaultReason;

        for (const aptId of appointmentsToCancel) {
          await supabase
            .from("appointments")
            .update({ 
              status: "cancelled",
              cancelled_by_client: false,
              cancelled_at: new Date().toISOString(),
              cancellation_reason: cancelReason,
            })
            .eq("id", aptId);

          // Envoyer email d'annulation
          await fetch("/api/booking/cancel-by-pro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              appointmentId: aptId,
              reason: cancelReason,
            }),
          });
        }
      }

      const unavailabilityData = {
        establishment_id: establishmentId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        unavailability_type: unavailabilityType,
        reason: reason || null,
        is_recurring: false,
        recurrence_pattern: null,
      };

      if (unavailability?.id) {
        const { data, error } = await supabase
          .from("unavailabilities")
          .update(unavailabilityData)
          .eq("id", unavailability.id)
          .select()
          .single();

        if (error) throw error;
        onSave(data);
      } else {
        const { data, error } = await supabase
          .from("unavailabilities")
          .insert(unavailabilityData)
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

  const toggleAppointmentSelection = (aptId: string) => {
    setConflictModal(prev => ({
      ...prev,
      selectedAppointments: prev.selectedAppointments.includes(aptId)
        ? prev.selectedAppointments.filter(id => id !== aptId)
        : [...prev.selectedAppointments, aptId]
    }));
  };

  const selectAllAppointments = () => {
    const allIds = conflictModal.conflict?.conflictingAppointments?.map(a => a.id) || [];
    setConflictModal(prev => ({ ...prev, selectedAppointments: allIds }));
  };

  const deselectAllAppointments = () => {
    setConflictModal(prev => ({ ...prev, selectedAppointments: [] }));
  };

  const formatAppointmentTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    return `${days[date.getDay()]} ${date.getDate()}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  };

  const isValid = startDate && endDate && startTime && endTime && unavailabilityType;

  const timeOptions = TIME_OPTIONS.map(time => ({ value: time, label: time }));

  const footer = (
    <div className="flex justify-between">
      {unavailability && onDelete ? (
        <Button variant="outline" onClick={onDelete} className="px-4 text-red-500 border-red-200 hover:bg-red-50">
          <Trash2 size={16} className="mr-2" />
          Supprimer
        </Button>
      ) : <div />}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="px-5">
          Annuler
        </Button>
        <Button
          variant="danger"
          onClick={() => handleSubmit()}
          disabled={!isValid || saving}
          loading={saving}
          className="px-6"
        >
          {unavailability ? "Modifier" : "Bloquer ce créneau"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
    <FormModal
      isOpen={true}
      onClose={onCancel}
      title={unavailability ? "Modifier l'indisponibilité" : "Nouvelle indisponibilité"}
      subtitle="Bloquez un créneau dans votre agenda"
      icon={<Ban className="w-5 h-5 text-white" />}
      variant="danger"
      footer={footer}
    >
      <div className="flex flex-col gap-4 lg:gap-5">
        <FormField
          label="Type d'indisponibilité"
          required
          leftIcon={<Tag size={14} className="text-red-500" />}
        >
          <Select
            value={unavailabilityType}
            onChange={(e) => setUnavailabilityType(e.target.value as UnavailabilityType)}
            options={UNAVAILABILITY_TYPES}
            fullWidth
            size="md"
          />
        </FormField>

        <div className="bg-red-50/50 rounded-xl p-4">
          <FormField
            label="Période"
            required
            leftIcon={<Clock size={14} className="text-red-500" />}
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Date de début</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  className="h-11 !p-3"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Heure de début</span>
                <Select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  options={timeOptions}
                  fullWidth
                  size="md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Date de fin</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  className="h-11 !p-3"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Heure de fin</span>
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
          label="Motif (optionnel)"
          leftIcon={<FileText size={14} className="text-red-500" />}
        >
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Précisez le motif de l'indisponibilité..."
            fullWidth
            className="h-11"
          />
        </FormField>
      </div>
    </FormModal>

      {/* Modal de conflit avec indisponibilité existante */}
      {conflictModal.open && conflictModal.conflict?.type !== "appointment" && (
        <Modal
          isOpen={true}
          onClose={() => setConflictModal({ open: false, conflict: null, selectedAppointments: [], customCancelReason: "" })}
          title="Conflit détecté"
          message={conflictModal.conflict?.message || ""}
          variant="error"
          confirmText="Compris"
          onConfirm={() => setConflictModal({ open: false, conflict: null, selectedAppointments: [], customCancelReason: "" })}
        />
      )}

      {/* Modal de gestion des rendez-vous en conflit */}
      {conflictModal.open && conflictModal.conflict?.type === "appointment" && conflictModal.conflict.conflictingAppointments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rendez-vous en conflit</h2>
                <p className="text-gray-500 text-sm">
                  {conflictModal.conflict.conflictingAppointments.length} rendez-vous sur cette période
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Que souhaitez-vous faire avec ces rendez-vous ?
            </p>

            {/* Liste des rendez-vous */}
            <div className="flex-1 overflow-y-auto mb-4 max-h-[200px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Sélectionnez les rendez-vous à annuler</span>
                <div className="flex gap-2">
                  <button 
                    onClick={selectAllAppointments}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={deselectAllAppointments}
                    className="text-xs text-gray-500 hover:underline cursor-pointer"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {conflictModal.conflict.conflictingAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    onClick={() => toggleAppointmentSelection(apt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      conflictModal.selectedAppointments.includes(apt.id)
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          conflictModal.selectedAppointments.includes(apt.id)
                            ? "border-red-500 bg-red-500"
                            : "border-gray-300"
                        }`}>
                          {conflictModal.selectedAppointments.includes(apt.id) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-900">{apt.client_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Calendar size={12} />
                            <span>{formatAppointmentDate(apt.start_time)}</span>
                            <Clock size={12} />
                            <span>{formatAppointmentTime(apt.start_time)} - {formatAppointmentTime(apt.end_time)}</span>
                          </div>
                        </div>
                      </div>
                      {conflictModal.selectedAppointments.includes(apt.id) && (
                        <span className="text-xs text-red-600 font-medium">Sera annulé</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motif personnalisé - affiché seulement si des rendez-vous sont sélectionnés */}
            {conflictModal.selectedAppointments.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif d'annulation (optionnel)
                </label>
                <textarea
                  value={conflictModal.customCancelReason}
                  onChange={(e) => setConflictModal(prev => ({ ...prev, customCancelReason: e.target.value }))}
                  placeholder="Laissez vide pour utiliser le motif automatique (type d'indisponibilité)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ce motif sera communiqué aux clients par email
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="primary"
                onClick={() => {
                  const toCancel = conflictModal.selectedAppointments;
                  const customReason = conflictModal.customCancelReason;
                  setConflictModal({ open: false, conflict: null, selectedAppointments: [], customCancelReason: "" });
                  handleSubmit(true, toCancel, customReason || undefined);
                }}
                className="w-full"
              >
                {conflictModal.selectedAppointments.length > 0 
                  ? `Créer et annuler ${conflictModal.selectedAppointments.length} rendez-vous`
                  : "Créer sans annuler de rendez-vous"
                }
              </Button>
              <Button
                variant="outline"
                onClick={() => setConflictModal({ open: false, conflict: null, selectedAppointments: [], customCancelReason: "" })}
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
