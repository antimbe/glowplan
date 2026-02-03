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
  main_photo_url: string;
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
  { id: "offres", label: "Offres et prestations" },
  { id: "sections", label: "Sections de rendez-vous" },
  { id: "rappels", label: "Rappels et RDV" },
  { id: "horaires", label: "Horaires d'ouverture" },
  { id: "paiement", label: "Paiement et acompte" },
  { id: "avancee", label: "Avancée" },
];

export interface ServiceData {
  id?: string;
  establishment_id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  min_age?: number | null;
  image_url?: string | null;
  is_active: boolean;
  position: number;
}

export interface OpeningHoursData {
  id?: string;
  establishment_id?: string;
  day_of_week: number; // 0=Lundi, 6=Dimanche
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

export const DAYS_OF_WEEK = [
  { value: 0, label: "Lundi" },
  { value: 1, label: "Mardi" },
  { value: 2, label: "Mercredi" },
  { value: 3, label: "Jeudi" },
  { value: 4, label: "Vendredi" },
  { value: 5, label: "Samedi" },
  { value: 6, label: "Dimanche" },
];
