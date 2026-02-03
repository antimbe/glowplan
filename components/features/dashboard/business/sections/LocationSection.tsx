"use client";

import { MapPin, EyeOff } from "lucide-react";
import SectionCard from "../SectionCard";
import FormInput from "../FormInput";
import { TabProps } from "../types";
import { Switch } from "@/components/ui";

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

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/15 rounded-xl p-3 lg:p-5">
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <EyeOff size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold text-xs lg:text-sm">Masquer l'adresse exacte</p>
                <Switch
                  id="hide-address"
                  checked={formData.hide_exact_address}
                  onChange={(e) => updateField("hide_exact_address", e.target.checked)}
                />
              </div>
              <p className="text-primary/60 text-xs mt-2">
                Seule la ville sera affichée publiquement. L'adresse exacte sera envoyée au client 24h avant le rendez-vous dans le mail de rappel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
