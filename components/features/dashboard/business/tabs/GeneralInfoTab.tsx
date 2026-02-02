"use client";

import { TabProps } from "../types";
import {
  EstablishmentSection,
  ContactSection,
  LocationSection,
  SettingsSection,
  ActivitySection,
  PhotosSection,
} from "../sections";

export default function GeneralInfoTab({ formData, updateField }: TabProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <EstablishmentSection formData={formData} updateField={updateField} />
      <ContactSection formData={formData} updateField={updateField} />
      <LocationSection formData={formData} updateField={updateField} />
      <SettingsSection formData={formData} updateField={updateField} />
      <ActivitySection formData={formData} updateField={updateField} />
      <PhotosSection formData={formData} updateField={updateField} />
    </div>
  );
}
