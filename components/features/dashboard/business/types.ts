export interface EstablishmentData {
  id?: string;
  name: string;
  siret: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  address_complement: string;
  hide_exact_address: boolean;
  auto_confirm_appointments: boolean;
  general_conditions: string;
  show_conditions_online: boolean;
  emergency_contact: string;
  activity_sectors: string[];
  logo_format: string;
  photo_format: string;
  photo_display: string;
}

export interface TabProps {
  formData: EstablishmentData;
  updateField: (field: keyof EstablishmentData, value: any) => void;
}

export const ACTIVITY_SECTORS = [
  { id: "coiffure", label: "Coupes & coiffures" },
  { id: "ongles", label: "Ongles" },
  { id: "sourcils", label: "Sourcils & cils" },
  { id: "massage", label: "Massage" },
  { id: "barbier", label: "Barbier" },
  { id: "epilation", label: "Épilation" },
  { id: "soins", label: "Soins du corps" },
  { id: "protheses", label: "Prothèses capillaires" },
  { id: "tatouage", label: "Tatouage & piercing" },
  { id: "maquillage", label: "Maquillage" },
  { id: "medical", label: "Médical & dentaire" },
];

export const TABS = [
  { id: "general", label: "Informations générales" },
  { id: "sections", label: "Sections de rendez-vous" },
  { id: "rappels", label: "Rappels et RDV" },
  { id: "horaires", label: "Horaires d'ouverture" },
  { id: "paiement", label: "Paiement et acompte" },
  { id: "offres", label: "Offres et prestations" },
  { id: "avancee", label: "Avancée" },
];
