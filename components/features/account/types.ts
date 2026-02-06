/**
 * Types partagés pour les composants Account
 */

export interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  instagram: string | null;
  cancellation_count: number;
}

export interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  establishment_id: string;
  establishments: {
    id: string;
    name: string;
    city: string;
  } | null;
  services: {
    name: string;
    price: number;
    duration: number;
  } | null;
  has_review?: boolean;
}

export interface Favorite {
  id: string;
  establishment_id: string;
  establishments: {
    id: string;
    name: string;
    city: string;
    main_photo_url: string | null;
    activity_sectors: string[];
  } | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  establishment_id: string;
  establishments: {
    id: string;
    name: string;
    city: string;
  } | null;
}

export type AccountTab = "reservations" | "favorites" | "reviews" | "profile";
