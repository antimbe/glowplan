"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Tabs } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Info, ChevronRight } from "lucide-react";
import { 
  EstablishmentData, 
  TABS,
  EstablishmentPreviewModal
} from "@/components/features/dashboard/business";
import { GeneralInfoTab, GeneralInfoPreview, UnderConstructionTab, ServicesTab, OpeningHoursTab, AppointmentsTab, ReviewsTab } from "@/components/features/dashboard/business/tabs";
import { useModal } from "@/contexts/ModalContext";

export default function BusinessPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean | null>(null); // null = pas encore déterminé
  
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
      if (!user) {
        router.push("/auth/pro/login");
        return;
      }

      // Vérifier le type d'utilisateur dans les métadonnées
      const userType = user.user_metadata?.user_type;

      const { data } = await supabase
        .from("establishments")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Si pas d'établissement
      if (!data) {
        // Si c'est un pro sans établissement, le laisser créer son établissement
        if (userType === "pro") {
          // Créer automatiquement un établissement vide pour ce pro
          const { data: newEstablishment, error: createError } = await supabase
            .from("establishments")
            .insert({
              user_id: user.id,
              name: "",
              is_profile_complete: false,
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating establishment:", createError);
            router.push("/auth/pro/login");
            return;
          }

          setEstablishmentId(newEstablishment.id);
          setIsProfileComplete(false);
          setIsEditMode(true);
          setLoading(false);
          return;
        }
        
        // Sinon c'est un client - rediriger vers /account
        router.push("/account");
        return;
      }

      if (data) {
        setEstablishmentId(data.id);
        const profileComplete = data.is_profile_complete || false;
        setIsProfileComplete(profileComplete);
        // Mode aperçu par défaut si le profil est complet, sinon mode édition
        setIsEditMode(!profileComplete);
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
      } else {
        // Pas d'établissement existant, mode édition
        setIsEditMode(true);
      }
    } catch (error) {
      console.error("Error loading establishment:", error);
      setIsEditMode(true);
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
      setIsEditMode(false);
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
        isEditMode ? (
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
        ) : establishmentId ? (
          <GeneralInfoPreview 
            formData={formData} 
            establishmentId={establishmentId} 
            onEdit={() => setIsEditMode(true)} 
          />
        ) : null
      ) : activeTab === "offres" && establishmentId ? (
        <ServicesTab establishmentId={establishmentId} />
      ) : activeTab === "sections" && establishmentId ? (
        <AppointmentsTab establishmentId={establishmentId} />
      ) : activeTab === "horaires" && establishmentId ? (
        <OpeningHoursTab establishmentId={establishmentId} />
      ) : activeTab === "avis" && establishmentId ? (
        <ReviewsTab establishmentId={establishmentId} />
      ) : (
        <UnderConstructionTab />
      )}
    </div>
  );
}
