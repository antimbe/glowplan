"use client";

import { Shield, Clock, FileText, AlertCircle } from "lucide-react";
import SectionCard from "../SectionCard";
import FormInput from "../FormInput";
import FormTextarea from "../FormTextarea";
import { TabProps } from "../types";

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
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary cursor-pointer block"
                  />
                </div>
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
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
              checked={formData.show_conditions_online}
              onChange={(e) => updateField("show_conditions_online", e.target.checked)}
            />
            <span className="text-gray-500 text-xs">Afficher les conditions sur ma vitrine en ligne</span>
          </div>
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
