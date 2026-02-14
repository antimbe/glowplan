"use client";

import { useState } from "react";
import { Button, Tabs } from "@/components/ui";
import { Loader2, Info, ChevronRight } from "lucide-react";
import {
  TABS,
  useEstablishment
} from "@/components/features/dashboard/business";
import { GeneralInfoTab, GeneralInfoPreview, UnderConstructionTab, ServicesTab, OpeningHoursTab, AppointmentsTab, ReviewsTab } from "@/components/features/dashboard/business/tabs";

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("general");

  const {
    formData,
    loading,
    saving,
    establishmentId,
    isProfileComplete,
    isEditMode,
    updateField,
    saveEstablishment,
    toggleEditMode
  } = useEstablishment();

  const handleTabClick = (tabId: string) => {
    if (tabId !== "general" && !isProfileComplete) return;
    setActiveTab(tabId);
  };

  const canAccessTab = (tabId: string) => tabId === "general" || isProfileComplete;

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
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs
        tabs={TABS.map(tab => ({ ...tab, disabled: !canAccessTab(tab.id) }))}
        activeTab={activeTab}
        onTabChange={handleTabClick}
        className="mb-4"
      />

      {activeTab === "general" ? (
        isEditMode ? (
          <>
            <GeneralInfoTab formData={formData} updateField={updateField} />
            <div className="w-full flex justify-end mt-4">
              <Button
                variant="primary"
                className="bg-primary hover:bg-primary-dark rounded-xl px-6 lg:px-8 h-10 lg:h-12 text-sm lg:text-base font-semibold shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                onClick={saveEstablishment}
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
            onEdit={() => toggleEditMode(true)}
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
