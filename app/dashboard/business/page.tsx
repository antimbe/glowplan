"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { 
  Camera, Plus, Check, Building2, Mail, Phone, MapPin, 
  FileText, Clock, AlertCircle, Scissors, Image as ImageIcon, ChevronRight,
  Store, Hash, Shield, Loader2, Lock, Info
} from "lucide-react";

interface EstablishmentData {
  id?: string;
  name: string;
  siret: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  address_complement: string;
  hide_exact_address: boolean;
  auto_confirm_appointments: boolean;
  general_conditions: string;
  show_conditions_online: boolean;
  emergency_contact: string;
  activity_sectors: string[];
  logo_format: string;
  photo_format: string;
  photo_display: string;
}

const tabs = [
  { id: "general", label: "Informations générales" },
  { id: "sections", label: "Sections de rendez-vous" },
  { id: "rappels", label: "Rappels et RDV" },
  { id: "horaires", label: "Horaires d'ouverture" },
  { id: "paiement", label: "Paiement et acompte" },
  { id: "offres", label: "Offres et prestations" },
  { id: "avancee", label: "Avancée" },
];

const secteurActivite = [
  { id: "coiffure", label: "Coupes & coiffures" },
  { id: "ongles", label: "Ongles" },
  { id: "sourcils", label: "Sourcils & cils" },
  { id: "massage", label: "Massage" },
  { id: "barbier", label: "Barbier" },
  { id: "epilation", label: "Épilation" },
  { id: "soins", label: "Soins du corps" },
  { id: "protheses", label: "Prothèses capillaires" },
  { id: "tatouage", label: "Tatouage & piercing" },
  { id: "maquillage", label: "Maquillage" },
  { id: "medical", label: "Médical & dentaire" },
];

const cardStyle = "w-full bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm";
const inputStyle = "w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3626]/20 focus:border-[#2a3626]/40 transition-all";
const labelStyle = "text-xs font-semibold text-gray-600 uppercase tracking-wider";

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  
  const [formData, setFormData] = useState<EstablishmentData>({
    name: "",
    siret: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    address_complement: "",
    hide_exact_address: false,
    auto_confirm_appointments: false,
    general_conditions: "",
    show_conditions_online: false,
    emergency_contact: "",
    activity_sectors: [],
    logo_format: "generate",
    photo_format: "generate",
    photo_display: "fill",
  });

  const supabase = createClient();

  useEffect(() => {
    loadEstablishment();
  }, []);

  const loadEstablishment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setEstablishmentId(data.id);
        setIsProfileComplete(data.is_profile_complete || false);
        setIsFirstVisit(false);
        setFormData({
          name: data.name || "",
          siret: data.siret || "",
          description: data.description || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          postal_code: data.postal_code || "",
          address_complement: data.address_complement || "",
          hide_exact_address: data.hide_exact_address || false,
          auto_confirm_appointments: data.auto_confirm_appointments || false,
          general_conditions: data.general_conditions || "",
          show_conditions_online: data.show_conditions_online || false,
          emergency_contact: data.emergency_contact || "",
          activity_sectors: data.activity_sectors || [],
          logo_format: data.logo_format || "generate",
          photo_format: data.photo_format || "generate",
          photo_display: data.photo_display || "fill",
        });
      } else {
        setIsFirstVisit(true);
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error("Error loading establishment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isComplete = !!(formData.name && formData.description && formData.email && formData.address && formData.city && formData.activity_sectors.length > 0);

      const establishmentData = {
        user_id: user.id,
        name: formData.name,
        siret: formData.siret,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        address_complement: formData.address_complement,
        hide_exact_address: formData.hide_exact_address,
        auto_confirm_appointments: formData.auto_confirm_appointments,
        general_conditions: formData.general_conditions,
        show_conditions_online: formData.show_conditions_online,
        emergency_contact: formData.emergency_contact,
        activity_sectors: formData.activity_sectors,
        logo_format: formData.logo_format,
        photo_format: formData.photo_format,
        photo_display: formData.photo_display,
        is_profile_complete: isComplete,
      };

      if (establishmentId) {
        const { error } = await supabase
          .from("establishments")
          .update(establishmentData)
          .eq("id", establishmentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("establishments")
          .insert(establishmentData)
          .select()
          .single();
        if (error) throw error;
        if (data) setEstablishmentId(data.id);
      }

      setIsProfileComplete(isComplete);
      setIsFirstVisit(false);
      alert("Informations enregistrées avec succès !");
    } catch (error) {
      console.error("Error saving establishment:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof EstablishmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecteur = (id: string) => {
    setFormData(prev => ({
      ...prev,
      activity_sectors: prev.activity_sectors.includes(id)
        ? prev.activity_sectors.filter(s => s !== id)
        : [...prev.activity_sectors, id]
    }));
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#2a3626]" size={32} />
      </div>
    );
  }

  const handleTabClick = (tabId: string) => {
    if (tabId !== "general" && !isProfileComplete) {
      return;
    }
    setActiveTab(tabId);
  };

  const canAccessTab = (tabId: string) => {
    return tabId === "general" || isProfileComplete;
  };

  return (
    <div className="w-full">
      {/* Onboarding Alert */}
      {!isProfileComplete && (
        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Info size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-amber-800 font-bold text-sm">Bienvenue sur GlowPlan !</h3>
              <p className="text-amber-700 text-xs mt-1">
                Pour commencer, veuillez remplir les informations générales de votre établissement. 
                Les champs obligatoires sont : <strong>Nom</strong>, <strong>Description</strong>, <strong>Email</strong>, <strong>Adresse</strong>, <strong>Ville</strong> et au moins un <strong>Secteur d'activité</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 mb-4 overflow-x-auto shadow-sm">
        <div className="flex min-w-max">
          {tabs.map((tab) => {
            const isAccessible = canAccessTab(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                disabled={!isAccessible}
                className={`
                  px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium whitespace-nowrap transition-all border-b-2 flex items-center gap-1 lg:gap-2
                  ${!isAccessible 
                    ? "text-gray-300 border-transparent cursor-not-allowed" 
                    : activeTab === tab.id 
                      ? "text-[#2a3626] border-[#2a3626] bg-[#2a3626]/5 cursor-pointer" 
                      : "text-gray-500 border-transparent hover:text-[#2a3626] hover:bg-gray-50 cursor-pointer"
                  }
                `}
              >
                {!isAccessible && <Lock size={14} />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab !== "general" ? (
        <div className={cardStyle}>
          <div className="flex flex-col items-center gap-6 py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#2a3626]/10 flex items-center justify-center">
              <span className="text-3xl">🚧</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-[#2a3626] text-xl font-bold">Section en construction</h2>
              <p className="text-gray-500 text-sm text-center max-w-md">
                Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {/* Section 1: Informations de l'établissement */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg shadow-[#2a3626]/20 flex-shrink-0">
                <Store size={20} className="text-white lg:hidden" />
                <Store size={22} className="text-white hidden lg:block" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">Informations de l'établissement</h2>
                <p className="text-[#2a3626]/60 text-[10px] lg:text-xs">Les champs marqués d'un * sont obligatoires</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-[#2a3626]/50" />
                    <label className={labelStyle}>Nom de la boutique *</label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Mon Salon" 
                    className={inputStyle}
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-[#2a3626]/50" />
                    <label className={labelStyle}>Siret</label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="123 456 789 00012" 
                    className={inputStyle}
                    value={formData.siret}
                    onChange={(e) => updateField("siret", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Description *</label>
                </div>
                <textarea
                  placeholder="Décrivez votre établissement..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3626]/20 focus:border-[#2a3626]/40 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Coordonnées */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg flex-shrink-0">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">Coordonnées</h2>
                <p className="text-gray-500 text-[10px] lg:text-xs">Comment vos clients peuvent vous contacter</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Email *</label>
                </div>
                <input 
                  type="email" 
                  placeholder="contact@monsalon.fr" 
                  className={inputStyle}
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Téléphone</label>
                </div>
                <input 
                  type="tel" 
                  placeholder="06 12 34 56 78" 
                  className={inputStyle}
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Localisation */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg flex-shrink-0">
                <MapPin size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">Localisation</h2>
                <p className="text-gray-500 text-[10px] lg:text-xs">Où se trouve votre établissement</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Adresse *</label>
                </div>
                <input 
                  type="text" 
                  placeholder="10 rue d'Alembert" 
                  className={inputStyle}
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className={labelStyle}>Ville *</label>
                  <input 
                    type="text" 
                    placeholder="Lille" 
                    className={inputStyle}
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelStyle}>Code postal</label>
                  <input 
                    type="text" 
                    placeholder="59000" 
                    className={inputStyle}
                    value={formData.postal_code}
                    onChange={(e) => updateField("postal_code", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelStyle}>Complément d'adresse</label>
                <input 
                  type="text" 
                  placeholder="Bâtiment A, 2ème étage..." 
                  className={inputStyle}
                  value={formData.address_complement}
                  onChange={(e) => updateField("address_complement", e.target.value)}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    className="mt-0.5 w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    checked={formData.hide_exact_address}
                    onChange={(e) => updateField("hide_exact_address", e.target.checked)}
                  />
                  <div>
                    <p className="text-amber-800 font-semibold text-sm">
Masquer l'adresse exacte</p>
                    <p className="text-amber-700/70 text-xs">Seule la ville sera affichée publiquement. L'adresse exacte sera envoyée au client 24h avant le rendez-vous dans le mail de rappel.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Paramètres & Règles */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">Paramètres & Règles</h2>
                <p className="text-gray-500 text-[10px] lg:text-xs">Configurez vos préférences de gestion</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-gradient-to-r from-[#2a3626]/5 to-[#2a3626]/10 border border-[#2a3626]/15 rounded-xl p-3 lg:p-5">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2a3626] flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[#2a3626] font-bold text-xs lg:text-sm">Confirmation automatique des RDV</p>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          id="auto-confirm"
                          checked={formData.auto_confirm_appointments}
                          onChange={(e) => updateField("auto_confirm_appointments", e.target.checked)}
                        />
                        <label 
                          htmlFor="auto-confirm"
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2a3626] cursor-pointer block"
                        />
                      </div>
                    </div>
                    <p className="text-[#2a3626]/60 text-xs mt-2">
                      Les demandes seront automatiquement confirmées pour les clients réguliers (2+ visites).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Conditions générales & règles</label>
                </div>
                <textarea
                  placeholder="Ex: Pour le 1er RDV : 50% d'acompte requis..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-purple-500/40 transition-all resize-none"
                  value={formData.general_conditions}
                  onChange={(e) => updateField("general_conditions", e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
                    checked={formData.show_conditions_online}
                    onChange={(e) => updateField("show_conditions_online", e.target.checked)}
                  />
                  <span className="text-gray-500 text-xs">Afficher sur ma vitrine en ligne</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Contact en cas d'urgence</label>
                </div>
                <input 
                  type="text" 
                  placeholder="Numéro ou email pour les annulations" 
                  className={inputStyle}
                  value={formData.emergency_contact}
                  onChange={(e) => updateField("emergency_contact", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Secteur d'activité */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg flex-shrink-0">
                <Scissors size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">Secteur d'activité</h2>
                <p className="text-gray-500 text-[10px] lg:text-xs">Sélectionnez un ou plusieurs secteurs</p>
              </div>
              {formData.activity_sectors.length > 0 && (
                <span className="px-2 lg:px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-[10px] lg:text-xs font-bold flex-shrink-0">
                  {formData.activity_sectors.length}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
              {secteurActivite.map((secteur) => (
                <button
                  key={secteur.id}
                  onClick={() => toggleSecteur(secteur.id)}
                  className={`
                    flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
                    ${formData.activity_sectors.includes(secteur.id)
                      ? "bg-[#2a3626] border-[#2a3626] text-white shadow-lg"
                      : "bg-gray-50 border-gray-100 text-gray-700 hover:border-[#2a3626]/30 hover:bg-white"
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center
                    ${formData.activity_sectors.includes(secteur.id) ? "border-white bg-white" : "border-gray-300"}
                  `}>
                    {formData.activity_sectors.includes(secteur.id) && <Check size={14} className="text-[#2a3626]" />}
                  </div>
                  <span className="text-sm font-medium">{secteur.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Photos & Visuels */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg flex-shrink-0">
                <ImageIcon size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">Photos & Visuels</h2>
                <p className="text-gray-500 text-[10px] lg:text-xs">Ajoutez jusqu'à 8 photos pour votre vitrine</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4">
                <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-100">
                  <p className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 lg:mb-3">Format logo</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateField("logo_format", "generate")}
                      className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
                        formData.logo_format === "generate" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Générer
                    </button>
                    <button
                      onClick={() => updateField("logo_format", "fixed")}
                      className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
                        formData.logo_format === "fixed" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Fixé
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-100">
                  <p className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 lg:mb-3">Format photos</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateField("photo_format", "generate")}
                      className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
                        formData.photo_format === "generate" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Générer
                    </button>
                    <button
                      onClick={() => updateField("photo_format", "fixed")}
                      className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
                        formData.photo_format === "fixed" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Fixé
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-100">
                  <p className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 lg:mb-3">Affichage</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateField("photo_display", "fill")}
                      className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
                        formData.photo_display === "fill" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Rempli
                    </button>
                    <button
                      onClick={() => updateField("photo_display", "contain")}
                      className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
                        formData.photo_display === "contain" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Entier
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 lg:gap-4">
                <div className="aspect-square bg-[#2a3626]/10 rounded-xl lg:rounded-2xl border-2 border-dashed border-[#2a3626]/40 flex flex-col items-center justify-center cursor-pointer hover:bg-[#2a3626]/20 transition-all">
                  <div className="w-8 h-8 lg:w-14 lg:h-14 rounded-full bg-white shadow-lg flex items-center justify-center mb-1 lg:mb-3">
                    <Camera size={16} className="text-[#2a3626] lg:hidden" />
                    <Camera size={24} className="text-[#2a3626] hidden lg:block" />
                  </div>
                  <span className="text-[#2a3626] text-[8px] lg:text-xs font-semibold text-center px-1">Photo principale</span>
                </div>
                
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i}
                    className="aspect-square bg-gray-50 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#2a3626]/30 transition-all"
                  >
                    <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1 lg:mb-2">
                      <Plus size={14} className="text-gray-400 lg:hidden" />
                      <Plus size={20} className="text-gray-400 hidden lg:block" />
                    </div>
                    <span className="text-gray-400 text-[8px] lg:text-[10px]">Photo {i + 2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="w-full flex justify-end mt-2">
            <Button
              variant="primary"
              className="bg-[#2a3626] hover:bg-[#1a2318] rounded-xl px-6 lg:px-8 h-10 lg:h-12 text-sm lg:text-base font-semibold shadow-lg shadow-[#2a3626]/20 cursor-pointer disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              <div className="flex items-center gap-2">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <span>Enregistrer</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
