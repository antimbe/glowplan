"use client";

import { Mail, Phone } from "lucide-react";
import SectionCard from "../SectionCard";
import FormInput from "../FormInput";
import { TabProps } from "../types";

export default function ContactSection({ formData, updateField }: TabProps) {
  return (
    <SectionCard
      icon={Mail}
      title="Coordonnées"
      subtitle="Comment vos clients peuvent vous contacter"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          label="Email"
          icon={Mail}
          type="email"
          placeholder="contact@monsalon.fr"
          value={formData.email}
          onChange={(value) => updateField("email", value)}
          required
        />
        <FormInput
          label="Téléphone"
          icon={Phone}
          type="tel"
          placeholder="06 12 34 56 78"
          value={formData.phone}
          onChange={(value) => updateField("phone", value)}
        />
      </div>
    </SectionCard>
  );
}
