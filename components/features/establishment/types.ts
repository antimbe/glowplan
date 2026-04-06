export interface Photo {
    id: string;
    url: string;
    position: number;
    is_main: boolean;
}

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
    photos?: Photo[];
    require_deposit?: boolean;
    deposit_amount?: string;
    payment_links?: { provider: string; url: string }[];
    payment_instructions?: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    client_name: string | null;
    created_at: string;
    provider_reply: string | null;
    replied_at: string | null;
    client_profiles?: {
        first_name: string;
        last_name: string;
    } | null;
}
