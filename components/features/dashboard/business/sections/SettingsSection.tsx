"use client";

import { Shield, Clock, FileText, AlertCircle } from "lucide-react";
import SectionCard from "../SectionCard";
import FormInput from "../FormInput";
import FormTextarea from "../FormTextarea";
import { TabProps } from "../types";
import { Switch, Checkbox } from "@/components/ui";

export default function SettingsSection({ formData, updateField }: TabProps) {
  return (
    <SectionCard
      icon={Shield}
      title="Paramètres & Règles"
      subtitle="Configurez vos préférences de gestion"
    >
      <div className="flex flex-col gap-5">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/15 rounded-xl p-3 lg:p-5">
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold text-xs lg:text-sm">Confirmation automatique des RDV</p>
                <Switch
                  id="auto-confirm"
                  checked={formData.auto_confirm_appointments}
                  onChange={(e) => updateField("auto_confirm_appointments", e.target.checked)}
                />
              </div>
              <p className="text-primary/60 text-xs mt-2">
                Les demandes seront automatiquement confirmées pour les clients réguliers (2+ visites).
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <FormTextarea
            label="Conditions générales & règles"
            icon={FileText}
            placeholder="Ex: Pour le 1er RDV : 50% d'acompte requis..."
            value={formData.general_conditions}
            onChange={(value) => updateField("general_conditions", value)}
            rows={3}
          />
          <Checkbox
            checked={formData.show_conditions_online}
            onChange={(e) => updateField("show_conditions_online", e.target.checked)}
            label="Afficher les conditions sur ma vitrine en ligne"
            size="sm"
          />
        </div>

        <FormInput
          label="Contact en cas d'urgence"
          icon={AlertCircle}
          placeholder="Numéro ou email pour les annulations"
          value={formData.emergency_contact}
          onChange={(value) => updateField("emergency_contact", value)}
        />
      </div>
    </SectionCard>
  );
}
