"use client";

import { useState } from "react";
import { Clock, FileText, Ban, Trash2, Tag } from "lucide-react";
import { Button, Input, Select, FormField, FormModal, Modal } from "@/components/ui";
import { UnavailabilityData, UnavailabilityType } from "./types";
import { checkUnavailabilityConflicts, ConflictResult } from "./hooks";
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
  const [conflictModal, setConflictModal] = useState<{ open: boolean; conflict: ConflictResult | null; forceCreate: boolean }>({
    open: false,
    conflict: null,
    forceCreate: false,
  });

  const supabase = createClient();

  const handleSubmit = async (skipConflictCheck = false) => {
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
        // Pour les RDV existants, on peut forcer la création
        const canForce = conflict.type === "appointment";
        setConflictModal({ open: true, conflict, forceCreate: canForce });
        return;
      }
    }

    setSaving(true);
    try {
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

      <Modal
        isOpen={conflictModal.open}
        onClose={() => setConflictModal({ open: false, conflict: null, forceCreate: false })}
        title="Conflit détecté"
        message={conflictModal.conflict?.message || ""}
        variant={conflictModal.conflict?.type === "appointment" ? "warning" : "error"}
        confirmText={conflictModal.forceCreate ? "Créer quand même" : "Compris"}
        cancelText={conflictModal.forceCreate ? "Annuler" : undefined}
        showCancel={conflictModal.forceCreate}
        onConfirm={() => {
          if (conflictModal.forceCreate) {
            setConflictModal({ open: false, conflict: null, forceCreate: false });
            handleSubmit(true);
          } else {
            setConflictModal({ open: false, conflict: null, forceCreate: false });
          }
        }}
      />
    </>
  );
}
