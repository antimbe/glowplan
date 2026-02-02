"use client";

import { MapPin } from "lucide-react";
import SectionCard from "../SectionCard";
import FormInput from "../FormInput";
import { TabProps } from "../types";

export default function LocationSection({ formData, updateField }: TabProps) {
  return (
    <SectionCard
      icon={MapPin}
      title="Localisation"
      subtitle="Où se trouve votre établissement"
    >
      <div className="flex flex-col gap-5">
        <FormInput
          label="Adresse"
          icon={MapPin}
          placeholder="10 rue d'Alembert"
          value={formData.address}
          onChange={(value) => updateField("address", value)}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <FormInput
              label="Ville"
              placeholder="Lille"
              value={formData.city}
              onChange={(value) => updateField("city", value)}
              required
            />
          </div>
          <FormInput
            label="Code postal"
            placeholder="59000"
            value={formData.postal_code}
            onChange={(value) => updateField("postal_code", value)}
          />
        </div>

        <FormInput
          label="Complément d'adresse"
          placeholder="Bâtiment A, 2ème étage..."
          value={formData.address_complement}
          onChange={(value) => updateField("address_complement", value)}
        />

        <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <input 
              type="checkbox" 
              className="mt-0.5 w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              checked={formData.hide_exact_address}
              onChange={(e) => updateField("hide_exact_address", e.target.checked)}
            />
            <div>
              <p className="text-amber-800 font-semibold text-sm">Masquer l'adresse exacte</p>
              <p className="text-amber-700/70 text-xs">
                Seule la ville sera affichée publiquement. L'adresse exacte sera envoyée au client 24h avant le rendez-vous dans le mail de rappel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
