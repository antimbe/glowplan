export interface Establishment {
    id: string;
    name: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    activity_sectors: string[];
    main_photo_url: string | null;
    general_conditions: string | null;
    show_conditions_online: boolean;
    auto_confirm_appointments: boolean;
    hide_exact_address: boolean;
}

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    client_name: string | null;
    created_at: string;
    client_profiles?: {
        first_name: string;
        last_name: string;
    } | null;
}
