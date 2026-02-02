"use client";

import { Store, Building2, Hash, FileText } from "lucide-react";
import SectionCard from "../SectionCard";
import FormInput from "../FormInput";
import FormTextarea from "../FormTextarea";
import { TabProps } from "../types";

export default function EstablishmentSection({ formData, updateField }: TabProps) {
  return (
    <SectionCard
      icon={Store}
      title="Informations de l'établissement"
      subtitle="Les champs marqués d'un * sont obligatoires"
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput
            label="Nom de la boutique"
            icon={Building2}
            placeholder="Mon Salon"
            value={formData.name}
            onChange={(value) => updateField("name", value)}
            required
          />
          <FormInput
            label="Siret"
            icon={Hash}
            placeholder="123 456 789 00012"
            value={formData.siret}
            onChange={(value) => updateField("siret", value)}
          />
        </div>
        <FormTextarea
          label="Description"
          icon={FileText}
          placeholder="Décrivez votre établissement..."
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          required
        />
      </div>
    </SectionCard>
  );
}
