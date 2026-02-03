"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Share2, Copy, ExternalLink, Download, ChevronLeft, ChevronRight, Calendar, MapPin, Lightbulb, Link2, X } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import html2canvas from "html2canvas";

interface ShareAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
}

interface OpeningHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

interface AvailabilitySlot {
  date: Date;
  slots: string[];
}

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const PERIOD_OPTIONS = [
  { value: "7", label: "7 prochains jours" },
  { value: "14", label: "14 prochains jours" },
  { value: "30", label: "30 prochains jours" },
];

export default function ShareAvailabilityModal({ isOpen, onClose, establishmentId }: ShareAvailabilityModalProps) {
  const [period, setPeriod] = useState("30");
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [establishment, setEstablishment] = useState<{ name: string; city: string } | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen && establishmentId) {
      loadData();
    }
  }, [isOpen, establishmentId, period]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les infos de l'établissement
      const { data: estab } = await supabase
        .from("establishments")
        .select("name, city")
        .eq("id", establishmentId)
        .single();

      if (estab) {
        setEstablishment({ name: estab.name, city: estab.city });
      }

      // Charger les horaires d'ouverture depuis la table opening_hours
      const { data: hours } = await supabase
        .from("opening_hours")
        .select("day_of_week, is_open, open_time, close_time, break_start, break_end")
        .eq("establishment_id", establishmentId);

      // Normaliser les heures (enlever les secondes si présentes)
      const normalizedHours = hours ? hours.map(h => ({
        ...h,
        open_time: h.open_time ? h.open_time.substring(0, 5) : null,
        close_time: h.close_time ? h.close_time.substring(0, 5) : null,
        break_start: h.break_start ? h.break_start.substring(0, 5) : null,
        break_end: h.break_end ? h.break_end.substring(0, 5) : null,
      })) as OpeningHour[] : [];

      if (normalizedHours.length > 0) {
        setOpeningHours(normalizedHours);
      }

      // Charger les indisponibilités
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(period));

      const { data: unavailabilities } = await supabase
        .from("unavailabilities")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .lte("start_time", endDate.toISOString())
        .gte("end_time", startDate.toISOString());

      // Charger les RDV existants
      const { data: appointments } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .eq("establishment_id", establishmentId)
        .neq("status", "cancelled")
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      // Calculer les disponibilités
      if (normalizedHours.length > 0) {
        const slots = calculateAvailabilities(
          normalizedHours,
          unavailabilities || [],
          appointments || [],
          parseInt(period)
        );
        setAvailabilities(slots);
      } else {
        setAvailabilities([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvailabilities = (
    hours: OpeningHour[],
    unavailabilities: { start_time: string; end_time: string }[],
    appointments: { start_time: string; end_time: string }[],
    days: number
  ): AvailabilitySlot[] => {
    const result: AvailabilitySlot[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      // day_of_week: 0 = dimanche, 1 = lundi, etc.
      const dayOfWeek = date.getDay();
      const dayHours = hours.find(h => h.day_of_week === dayOfWeek);

      if (!dayHours || !dayHours.is_open || !dayHours.open_time || !dayHours.close_time) continue;

      const openTime = parseInt(dayHours.open_time.split(":")[0]);
      const closeTime = parseInt(dayHours.close_time.split(":")[0]);

      // Vérifier si le jour est complètement indisponible
      const dayStart = new Date(date);
      dayStart.setHours(openTime, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(closeTime, 0, 0, 0);

      const isFullDayUnavailable = unavailabilities.some(u => {
        const uStart = new Date(u.start_time);
        const uEnd = new Date(u.end_time);
        return uStart <= dayStart && uEnd >= dayEnd;
      });

      if (isFullDayUnavailable) continue;

      // Calculer les heures de pause
      const breakStart = dayHours.break_start ? parseInt(dayHours.break_start.split(":")[0]) : null;
      const breakEnd = dayHours.break_end ? parseInt(dayHours.break_end.split(":")[0]) : null;

      // Calculer les créneaux disponibles
      const slots: string[] = [];
      let currentSlotStart: number | null = null;

      for (let hour = openTime; hour < closeTime; hour++) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(date);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        // Vérifier si c'est pendant la pause
        const isDuringBreak = breakStart !== null && breakEnd !== null && hour >= breakStart && hour < breakEnd;

        const isUnavailable = unavailabilities.some(u => {
          const uStart = new Date(u.start_time);
          const uEnd = new Date(u.end_time);
          return slotStart < uEnd && slotEnd > uStart;
        });

        const isBooked = appointments.some(a => {
          const aStart = new Date(a.start_time);
          const aEnd = new Date(a.end_time);
          return slotStart < aEnd && slotEnd > aStart;
        });

        if (!isUnavailable && !isBooked && !isDuringBreak) {
          if (currentSlotStart === null) {
            currentSlotStart = hour;
          }
        } else {
          if (currentSlotStart !== null) {
            slots.push(`${currentSlotStart}h à ${hour}h`);
            currentSlotStart = null;
          }
        }
      }

      if (currentSlotStart !== null) {
        slots.push(`${currentSlotStart}h à ${closeTime}h`);
      }

      if (slots.length > 0) {
        result.push({ date, slots });
      }
    }

    return result;
  };

  const getStoriesData = () => {
    const itemsPerStory = 12; // 12 jours par Story
    const stories: AvailabilitySlot[][] = [];
    
    for (let i = 0; i < availabilities.length; i += itemsPerStory) {
      stories.push(availabilities.slice(i, i + itemsPerStory));
    }
    
    return stories.length > 0 ? stories : [[]];
  };

  const stories = getStoriesData();
  const totalStories = stories.length;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/book/${establishmentId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    const link = `${window.location.origin}/book/${establishmentId}`;
    window.open(link, "_blank");
  };

  const downloadStory = useCallback(async (storyIndex: number) => {
    if (!storyRef.current) return;
    
    try {
      // Cloner l'élément et le mettre dans un conteneur isolé
      const clone = storyRef.current.cloneNode(true) as HTMLElement;
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.backgroundColor = "#f5f5f0";
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Forcer les styles inline sur tous les éléments
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computed = window.getComputedStyle(htmlEl);
        // Remplacer les couleurs lab() par des couleurs RGB
        if (computed.color.includes("lab")) {
          htmlEl.style.color = "#374151";
        }
        if (computed.backgroundColor.includes("lab")) {
          htmlEl.style.backgroundColor = "transparent";
        }
      });
      
      const canvas = await html2canvas(clone, {
        backgroundColor: "#f5f5f0",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      document.body.removeChild(container);
      
      const link = document.createElement("a");
      link.download = `disponibilites-story-${storyIndex + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Erreur téléchargement:", error);
    }
  }, []);

  const downloadAllStories = useCallback(async () => {
    for (let i = 0; i < totalStories; i++) {
      setCurrentStoryIndex(i);
      // Attendre que le rendu soit mis à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      await downloadStory(i);
    }
  }, [totalStories, downloadStory]);

  const currentMonth = availabilities.length > 0 
    ? MONTHS[availabilities[0].date.getMonth()]
    : MONTHS[new Date().getMonth()];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Partager mes disponibilités</h2>
              <p className="text-sm text-gray-500">Story Instagram avec vos créneaux disponibles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Story Preview */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  options={PERIOD_OPTIONS}
                  fullWidth
                />
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-medium text-gray-700">Aperçu Story Instagram</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStoryIndex(Math.max(0, currentStoryIndex - 1))}
                    disabled={currentStoryIndex === 0}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-500">{currentStoryIndex + 1} / {totalStories}</span>
                  <button
                    onClick={() => setCurrentStoryIndex(Math.min(totalStories - 1, currentStoryIndex + 1))}
                    disabled={currentStoryIndex === totalStories - 1}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Story Preview - Using inline styles for html2canvas compatibility */}
              <div 
                ref={storyRef}
                style={{
                  background: "linear-gradient(to bottom, #f5f5f0, #eae8e0)",
                  borderRadius: "24px",
                  padding: "20px 16px",
                  width: "280px",
                  height: "560px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {loading ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "32px", height: "32px", border: "3px solid #4a5d4a", borderTopColor: "transparent", borderRadius: "50%" }} />
                  </div>
                ) : (
                  <>
                    {/* Logo */}
                    <div style={{ 
                      backgroundColor: "#4a5d4a", 
                      color: "white", 
                      fontSize: "10px", 
                      fontWeight: "700", 
                      padding: "5px 14px", 
                      borderRadius: "9999px", 
                      marginBottom: "12px",
                      letterSpacing: "1px"
                    }}>
                      GLOWPLAN
                    </div>

                    {/* Establishment Name */}
                    <h3 style={{ 
                      fontSize: "18px", 
                      fontWeight: "700", 
                      color: "#1f2937", 
                      marginBottom: "4px",
                      textAlign: "center"
                    }}>
                      {establishment?.name || "Mon établissement"}
                    </h3>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "3px", 
                      color: "#6b7280", 
                      fontSize: "11px", 
                      marginBottom: "10px" 
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {establishment?.city || "Ma ville"}
                    </div>

                    {/* Month Badge */}
                    <div style={{ 
                      backgroundColor: "#4a5d4a", 
                      color: "white", 
                      fontSize: "11px", 
                      fontWeight: "600", 
                      padding: "6px 14px", 
                      borderRadius: "9999px", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      marginBottom: "10px" 
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                        <line x1="16" x2="16" y1="2" y2="6"/>
                        <line x1="8" x2="8" y1="2" y2="6"/>
                        <line x1="3" x2="21" y1="10" y2="10"/>
                      </svg>
                      {currentMonth}
                    </div>

                    {/* Availability List */}
                    <div style={{ 
                      backgroundColor: "rgba(255,255,255,0.9)", 
                      borderRadius: "12px", 
                      padding: "10px", 
                      width: "100%", 
                      flex: 1,
                      border: "1px solid rgba(74, 93, 74, 0.15)"
                    }}>
                      {stories[currentStoryIndex]?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {stories[currentStoryIndex].map((slot, idx) => (
                            <div key={idx} style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "8px",
                              padding: "3px 4px",
                              borderRadius: "4px",
                              backgroundColor: idx % 2 === 0 ? "rgba(74, 93, 74, 0.06)" : "transparent"
                            }}>
                              <div style={{ 
                                width: "22px", 
                                height: "22px", 
                                borderRadius: "4px", 
                                backgroundColor: "#4a5d4a", 
                                color: "white", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontSize: "10px", 
                                fontWeight: "700",
                                flexShrink: 0
                              }}>
                                {slot.date.getDate()}
                              </div>
                              <span style={{ fontSize: "10px", color: "#374151", fontWeight: "500" }}>
                                {slot.slots.join(" / ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: "11px" }}>
                          Aucune disponibilité
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                      <p style={{ fontSize: "10px", color: "#4b5563" }}>
                        Réservez sur <span style={{ fontWeight: "700", color: "#4a5d4a" }}>GlowPlan.fr</span>
                      </p>
                      <p style={{ fontSize: "9px", color: "#9ca3af", marginTop: "3px" }}>
                        {currentStoryIndex + 1} / {totalStories}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Share Options */}
            <div className="space-y-6">
              {/* Shareable Link */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Link2 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lien partageable</h4>
                    <p className="text-xs text-gray-500">Mis à jour en temps réel</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Page web avec la liste de vos créneaux disponibles et bouton de réservation direct.
                </p>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate mb-3">
                  {window.location.origin}/book/{establishmentId}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex-1"
                  >
                    <Copy size={16} className="mr-2" />
                    {copied ? "Copié !" : "Copier"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenLink}
                    className="flex-1"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Ouvrir
                  </Button>
                </div>
              </div>

              {/* Tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Astuce :</span> Postez la Story PNG sur Instagram et ajoutez le lien en bio pour que vos clientes puissent réserver !
                  </p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => downloadStory(currentStoryIndex)}
                >
                  <Download size={18} className="mr-2" />
                  Télécharger cette Story
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={downloadAllStories}
                >
                  <Download size={18} className="mr-2" />
                  Télécharger les {totalStories} Stories
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
