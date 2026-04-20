"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Clock, Star, Phone, Mail, Tag, Eye } from "lucide-react";
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
    if (isOpen && establishmentId) loadData();
  }, [isOpen, establishmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: hours } = await supabase
        .from("opening_hours")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("day_of_week");

      if (hours) {
        setOpeningHours(hours.map(h => ({
          ...h,
          open_time: h.open_time ? h.open_time.substring(0, 5) : null,
          close_time: h.close_time ? h.close_time.substring(0, 5) : null,
          break_start: h.break_start ? h.break_start.substring(0, 5) : null,
          break_end: h.break_end ? h.break_end.substring(0, 5) : null,
        })));
      }

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true)
        .order("position");

      if (servicesData) setServices(servicesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Top accent */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#32422c]/8 border border-[#32422c]/12 flex items-center justify-center flex-shrink-0">
              <Eye size={17} className="text-[#32422c]" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-gray-900 tracking-tight">Aperçu de votre annonce</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Telle que vue par vos clients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-[2.5px] border-[#32422c]/20 border-t-[#32422c] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-5 space-y-4">

              {/* Hero photo */}
              {formData.main_photo_url && (
                <div className="relative h-52 rounded-2xl overflow-hidden">
                  <img
                    src={formData.main_photo_url}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black text-white leading-tight">{formData.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-white/80 mt-1">
                      <MapPin size={13} />
                      <span>{formData.city}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Infos */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                {formData.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{formData.description}</p>
                )}

                {/* Sector tags */}
                {formData.activity_sectors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.activity_sectors.map((sector, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-[#32422c]/8 text-[#32422c] text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <Tag size={9} />
                        {sector}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact info */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  {formData.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                      <span>{formData.address}, {formData.postal_code} {formData.city}</span>
                    </div>
                  )}
                  {formData.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={13} className="text-gray-400 flex-shrink-0" />
                      <span>{formData.phone}</span>
                    </div>
                  )}
                  {formData.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={13} className="text-gray-400 flex-shrink-0" />
                      <span>{formData.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Horaires */}
              {openingHours.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock size={12} className="text-[#32422c]" />
                    Horaires d'ouverture
                  </p>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <div className="space-y-2">
                      {openingHours.map((hour) => (
                        <div key={hour.day_of_week} className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-gray-700 w-24">{DAYS[hour.day_of_week]}</span>
                          <span className={hour.is_open ? "text-gray-600" : "text-gray-300 font-medium"}>
                            {hour.is_open && hour.open_time && hour.close_time ? (
                              <>
                                {hour.open_time} – {hour.close_time}
                                {hour.break_start && hour.break_end && (
                                  <span className="text-gray-400 text-xs ml-2">
                                    (pause {hour.break_start}–{hour.break_end})
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

              {/* Services */}
              {services.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Star size={12} className="text-[#c0a062]" />
                    Prestations
                  </p>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{service.description}</p>
                          )}
                          <span className="text-xs text-gray-400 mt-0.5 block">{service.duration} min</span>
                        </div>
                        <span className="font-black text-[#32422c] text-base ml-4 flex-shrink-0">
                          {service.price}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-[#32422c] hover:bg-[#3d5438] text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-[#32422c]/20"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}
