"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Mail, Phone, Edit, FileText, Info, Star } from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { EstablishmentData } from "../types";

interface OpeningHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  is_active: boolean;
}

interface GeneralInfoPreviewProps {
  formData: EstablishmentData;
  establishmentId: string;
  onEdit: () => void;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function GeneralInfoPreview({ formData, establishmentId, onEdit }: GeneralInfoPreviewProps) {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [establishmentId]);

  const loadData = async () => {
    try {
      // Charger les horaires
      const { data } = await supabase
        .from("opening_hours")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("day_of_week");

      if (data) {
        // Réorganiser pour commencer par Lundi (day_of_week = 1)
        const sorted = [...data].sort((a, b) => {
          const aDay = a.day_of_week === 0 ? 7 : a.day_of_week;
          const bDay = b.day_of_week === 0 ? 7 : b.day_of_week;
          return aDay - bDay;
        });
        const normalizedHours = sorted.map(h => ({
          ...h,
          open_time: h.open_time ? h.open_time.substring(0, 5) : null,
          close_time: h.close_time ? h.close_time.substring(0, 5) : null,
          break_start: h.break_start ? h.break_start.substring(0, 5) : null,
          break_end: h.break_end ? h.break_end.substring(0, 5) : null,
        }));
        setOpeningHours(normalizedHours);
      }

      // Charger les services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true)
        .order("position");

      if (servicesData) {
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hour: OpeningHour) => {
    if (!hour.is_open) return "Fermé";
    let result = `${hour.open_time} - ${hour.close_time}`;
    if (hour.break_start && hour.break_end) {
      result = `${hour.open_time} - ${hour.break_start}, ${hour.break_end} - ${hour.close_time}`;
    }
    return result;
  };

  const getDayName = (dayOfWeek: number) => {
    // Convertir: 0=Dimanche -> index 6, 1=Lundi -> index 0, etc.
    const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return DAYS[index];
  };

  return (
    <div className="space-y-6">
      {/* Header avec photo et infos principales */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-start gap-4 p-4">
          {formData.main_photo_url ? (
            <img 
              src={formData.main_photo_url} 
              alt={formData.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <FileText size={24} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{formData.name || "Mon établissement"}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.activity_sectors.map((sector, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {sector}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
            className="flex-shrink-0"
          >
            <Edit size={16} className="mr-2" />
            Modifier mes informations
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={18} className="text-primary" />
            Informations générales
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">Description</span>
              <p className="text-sm text-gray-700 mt-1">{formData.description || "Non renseigné"}</p>
            </div>
          </div>
        </div>

        {/* Contact & Adresse */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Contact & Adresse
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span className="text-primary">{formData.email || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-gray-400" />
              <span className="text-gray-700">{formData.phone || "Non renseigné"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-700">{formData.address || "Non renseigné"}</p>
                <p className="text-gray-700">{formData.postal_code} {formData.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          Horaires d'ouverture
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : openingHours.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {openingHours.map((hour) => (
              <div key={hour.day_of_week} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{getDayName(hour.day_of_week)}</p>
                <p className={`text-sm font-medium ${hour.is_open ? "text-primary" : "text-gray-400"}`}>
                  {formatHours(hour)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucun horaire configuré</p>
        )}
      </div>

      {/* Offres et prestations */}
      {services.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={18} className="text-primary" />
            Offres et prestations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <div key={service.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 text-sm">{service.name}</h5>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                  )}
                  <span className="text-xs text-gray-400 mt-1 inline-block">{service.duration} min</span>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <span className="font-bold text-primary">{service.price}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
