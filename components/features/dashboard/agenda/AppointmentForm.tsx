"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Phone, FileText, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { AppointmentData } from "./types";
import { ServiceData } from "../business/types";
import { createClient } from "@/lib/supabase/client";

interface AppointmentFormProps {
  appointment?: AppointmentData | null;
  establishmentId: string;
  selectedDate?: Date;
  onSave: (appointment: AppointmentData) => void;
  onCancel: () => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

export default function AppointmentForm({ 
  appointment, 
  establishmentId, 
  selectedDate,
  onSave, 
  onCancel 
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
  const [date, setDate] = useState(
    selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

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

  const handleSubmit = async () => {
    if (!formData.client_name || !date || !startTime || !endTime) return;

    setSaving(true);
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      const appointmentData = {
        ...formData,
        establishment_id: establishmentId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      };

      if (appointment?.id) {
        const { data, error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", appointment.id)
          .select()
          .single();

        if (error) throw error;
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

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden mx-2 lg:mx-0">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white text-base lg:text-lg font-bold">
                {appointment ? "Modifier le RDV" : "Nouveau rendez-vous"}
              </h3>
              <p className="text-white/70 text-xs lg:text-sm">Remplissez les informations client</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
        <div className="flex flex-col gap-4 lg:gap-5">
          {/* Client */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
              <User size={14} className="text-primary" />
              Nom du client <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="Nom complet du client"
              className="h-11 lg:h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                Email
              </label>
              <input
                type="email"
                value={formData.client_email || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="email@exemple.com"
                className="h-11 lg:h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.client_phone || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                placeholder="06 12 34 56 78"
                className="h-11 lg:h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Service */}
          {services.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600">
                Prestation
              </label>
              <select
                value={formData.service_id || ""}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="h-11 lg:h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base bg-white cursor-pointer"
              >
                <option value="">Sélectionner une prestation</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price}€ ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date et heure */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-2 mb-3">
              <Clock size={14} className="text-primary" />
              Date et horaires <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm bg-white"
              />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Début</span>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm bg-white cursor-pointer"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 mb-1">Fin</span>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm bg-white cursor-pointer"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires sur le rendez-vous..."
              rows={2}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm resize-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Footer avec actions */}
      <div className="border-t border-gray-100 p-4 lg:p-5 bg-gray-50/50">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="px-5">
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Enregistrement...</span>
              </div>
            ) : (
              <span>{appointment ? "Modifier" : "Créer le RDV"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
