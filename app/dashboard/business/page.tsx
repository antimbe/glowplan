"use client";

import { useState } from "react";
import { Button, Tabs } from "@/components/ui";
import { Loader2, Info, ChevronRight, X } from "lucide-react";
import {
  TABS,
  useEstablishment
} from "@/components/features/dashboard/business";
import { GeneralInfoTab, GeneralInfoPreview, UnderConstructionTab, ServicesTab, OpeningHoursTab, AppointmentsTab, ReviewsTab, RemindersTab, PaymentTab } from "@/components/features/dashboard/business/tabs";

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("general");

  const {
    formData,
    loading,
    saving,
    establishmentId,
    isProfileComplete,
    missingFields,
    isEditMode,
    updateField,
    saveEstablishment,
    toggleEditMode,
    refresh
  } = useEstablishment();

  // Tabs accessible même avant complétion du profil
  const ALWAYS_ACCESSIBLE = ["general", "offres", "horaires"];

  const handleTabClick = (tabId: string) => {
    if (!ALWAYS_ACCESSIBLE.includes(tabId) && !isProfileComplete) return;
    setActiveTab(tabId);
  };

  const canAccessTab = (tabId: string) => ALWAYS_ACCESSIBLE.includes(tabId) || isProfileComplete;

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
            <div className="flex-1">
              <h3 className="text-amber-800 font-bold text-sm">Complétez votre profil professionnel</h3>
              <p className="text-amber-700 text-xs mt-1">
                Pour apparaître dans les recherches et accepter des réservations, veuillez compléter les éléments suivants :
              </p>
              {missingFields.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {missingFields.map((field, index) => (
                    <li key={index} className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                      {field}
                    </li>
                  ))}
                </ul>
              )}
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
            <GeneralInfoTab formData={formData} updateField={updateField} establishmentId={establishmentId} />
            <div className="w-full flex justify-end items-center gap-3 mt-4">
              {isProfileComplete && (
                <Button
                  variant="outline"
                  className="rounded-xl px-6 lg:px-8 h-10 lg:h-12 text-sm lg:text-base font-semibold cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => refresh()}
                  disabled={saving}
                >
                  <div className="flex items-center gap-2">
                    <X size={18} />
                    <span>Retour</span>
                  </div>
                </Button>
              )}
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
      ) : activeTab === "rappels" && establishmentId ? (
        <RemindersTab establishmentId={establishmentId} />
      ) : activeTab === "horaires" && establishmentId ? (
        <OpeningHoursTab establishmentId={establishmentId} />
      ) : activeTab === "paiement" ? (
        <PaymentTab 
          formData={formData} 
          updateField={updateField} 
          saveEstablishment={saveEstablishment} 
          saving={saving} 
        />
      ) : activeTab === "avis" && establishmentId ? (
        <ReviewsTab establishmentId={establishmentId} />
      ) : (
        <UnderConstructionTab />
      )}
    </div>
  );
}
