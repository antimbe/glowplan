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
    <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 p-4 lg:p-6 shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto mx-2 lg:mx-0">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-primary text-base lg:text-lg font-bold">
          {appointment ? "Modifier le RDV" : "Nouveau RDV"}
        </h3>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:gap-4">
        {/* Client */}
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 lg:gap-2">
            <User size={12} className="lg:w-3.5 lg:h-3.5" />
            Nom du client *
          </label>
          <input
            type="text"
            value={formData.client_name}
            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
            placeholder="Nom complet"
            className="h-10 lg:h-12 px-3 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <div className="flex flex-col gap-1.5 lg:gap-2">
            <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 lg:gap-2">
              <Mail size={12} className="lg:w-3.5 lg:h-3.5" />
              Email
            </label>
            <input
              type="email"
              value={formData.client_email || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
              placeholder="email@exemple.com"
              className="h-10 lg:h-12 px-3 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base"
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:gap-2">
            <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 lg:gap-2">
              <Phone size={12} className="lg:w-3.5 lg:h-3.5" />
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.client_phone || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
              placeholder="06 12 34 56 78"
              className="h-10 lg:h-12 px-3 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base"
            />
          </div>
        </div>

        {/* Service */}
        {services.length > 0 && (
          <div className="flex flex-col gap-1.5 lg:gap-2">
            <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Prestation
            </label>
            <select
              value={formData.service_id || ""}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="h-10 lg:h-12 px-3 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base bg-white cursor-pointer"
            >
              <option value="">Aucune prestation</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}€ ({service.duration} min)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date et heure */}
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 lg:gap-2">
            <Clock size={12} className="lg:w-3.5 lg:h-3.5" />
            Date et heure *
          </label>
          <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 lg:h-12 px-2 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base"
            />
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-10 lg:h-12 px-2 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base bg-white cursor-pointer"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="h-10 lg:h-12 px-2 lg:px-4 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base bg-white cursor-pointer"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5 lg:gap-2">
          <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 lg:gap-2">
            <FileText size={12} className="lg:w-3.5 lg:h-3.5" />
            Notes
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes supplémentaires..."
            rows={2}
            className="px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm lg:text-base resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 lg:gap-3 pt-3 lg:pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onCancel} size="sm" className="px-4 lg:px-6">
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="px-4 lg:px-6 bg-primary hover:bg-primary-dark"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Enregistrement...</span>
              </div>
            ) : (
              <span>{appointment ? "Modifier" : "Créer"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
