export type AccountTab = "reservations" | "favorites" | "reviews" | "profile";

export interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  establishment_id: string;
  service_id: string;
  has_review?: boolean;
  establishments?: {
    name: string;
    city: string;
  };
  services?: {
    name: string;
    price: number;
    duration: number;
  };
}

export interface Favorite {
  id: string;
  establishment_id: string;
  establishments?: {
    name: string;
    city: string;
    main_photo_url: string | null;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  establishment_id: string;
  establishments?: {
    name: string;
    city: string;
  };
}

export interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  instagram: string | null;
}
