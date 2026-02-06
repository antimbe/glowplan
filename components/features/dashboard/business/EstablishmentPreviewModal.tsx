"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Clock, Star, Phone, Mail, Tag } from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { EstablishmentData } from "./types";

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

interface EstablishmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
  formData: EstablishmentData;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function EstablishmentPreviewModal({ 
  isOpen, 
  onClose, 
  establishmentId,
  formData 
}: EstablishmentPreviewModalProps) {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen && establishmentId) {
      loadData();
    }
  }, [isOpen, establishmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les horaires
      const { data: hours } = await supabase
        .from("opening_hours")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("day_of_week");

      if (hours) {
        const normalizedHours = hours.map(h => ({
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-primary/5">
          <h2 className="text-lg font-bold text-gray-900">Aperçu de votre annonce</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="p-4">
              {/* Photo principale */}
              {formData.main_photo_url && (
                <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={formData.main_photo_url} 
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{formData.name}</h3>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                      <MapPin size={14} />
                      {formData.city}
                    </div>
                  </div>
                </div>
              )}

              {/* Infos principales */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm mb-3">{formData.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.activity_sectors.map((sector, idx) => (
                    <span key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Tag size={10} />
                      {sector}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  {formData.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      {formData.address}, {formData.postal_code} {formData.city}
                    </div>
                  )}
                  {formData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {formData.phone}
                    </div>
                  )}
                  {formData.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {formData.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Horaires d'ouverture */}
              {openingHours.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    Horaires d'ouverture
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="grid gap-1">
                      {openingHours.map((hour) => (
                        <div key={hour.day_of_week} className="flex justify-between text-sm py-1">
                          <span className="font-medium text-gray-700">{DAYS[hour.day_of_week]}</span>
                          <span className={hour.is_open ? "text-gray-600" : "text-gray-400"}>
                            {hour.is_open && hour.open_time && hour.close_time ? (
                              <>
                                {hour.open_time} - {hour.close_time}
                                {hour.break_start && hour.break_end && (
                                  <span className="text-gray-400 ml-2">
                                    (pause {hour.break_start} - {hour.break_end})
                                  </span>
                                )}
                              </>
                            ) : (
                              "Fermé"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Prestations */}
              {services.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star size={16} className="text-primary" />
                    Offres et prestations
                  </h4>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">{service.name}</h5>
                          {service.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                          )}
                          <span className="text-xs text-gray-400">{service.duration} min</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary">{service.price}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Button variant="primary" onClick={onClose} className="w-full">
            Fermer l'aperçu
          </Button>
        </div>
      </div>
    </div>
  );
}
