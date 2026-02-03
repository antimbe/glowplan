"use client";

import { useState, useEffect } from "react";
import { Button, Tabs } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Info, ChevronRight } from "lucide-react";
import { 
  EstablishmentData, 
  TABS 
} from "@/components/features/dashboard/business";
import { GeneralInfoTab, UnderConstructionTab, ServicesTab, OpeningHoursTab } from "@/components/features/dashboard/business/tabs";
import { useModal } from "@/contexts/ModalContext";

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  const { showSuccess, showError } = useModal();

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
    main_photo_url: "",
  });

  const supabase = createClient();

  useEffect(() => {
    loadEstablishment();
  }, []);

  const loadEstablishment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("establishments")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setEstablishmentId(data.id);
        setIsProfileComplete(data.is_profile_complete || false);
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
          main_photo_url: data.main_photo_url || "",
        });
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

      const isComplete = !!(
        formData.name && 
        formData.description && 
        formData.email && 
        formData.address && 
        formData.city && 
        formData.activity_sectors.length > 0 &&
        formData.main_photo_url
      );

      const establishmentData = {
        user_id: user.id,
        ...formData,
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
      showSuccess("Succès", "Vos informations ont été enregistrées avec succès !");
    } catch (error) {
      console.error("Error saving establishment:", error);
      showError("Erreur", "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof EstablishmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTabClick = (tabId: string) => {
    if (tabId !== "general" && !isProfileComplete) return;
    setActiveTab(tabId);
  };

  const canAccessTab = (tabId: string) => {
    return tabId === "general" || isProfileComplete;
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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
              <h3 className="text-amber-800 font-bold text-sm">Complétez votre profil professionnel</h3>
              <p className="text-amber-700 text-xs mt-1">
                Pour débloquer toutes les fonctionnalités, veuillez renseigner les informations de votre établissement. 
                Champs obligatoires : <strong>Nom</strong>, <strong>Description</strong>, <strong>Email</strong>, <strong>Adresse</strong>, <strong>Ville</strong>, au moins un <strong>Secteur d'activité</strong> et une <strong>Photo principale</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs
        tabs={TABS.map(tab => ({
          ...tab,
          disabled: !canAccessTab(tab.id)
        }))}
        activeTab={activeTab}
        onTabChange={handleTabClick}
        className="mb-4"
      />

      {/* Content */}
      {activeTab === "general" ? (
        <>
          <GeneralInfoTab formData={formData} updateField={updateField} />
          
          {/* Footer Actions */}
          <div className="w-full flex justify-end mt-4">
            <Button
              variant="primary"
              className="bg-primary hover:bg-primary-dark rounded-xl px-6 lg:px-8 h-10 lg:h-12 text-sm lg:text-base font-semibold shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
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
        </>
      ) : activeTab === "offres" && establishmentId ? (
        <ServicesTab establishmentId={establishmentId} />
      ) : activeTab === "horaires" && establishmentId ? (
        <OpeningHoursTab establishmentId={establishmentId} />
      ) : (
        <UnderConstructionTab />
      )}
    </div>
  );
}
