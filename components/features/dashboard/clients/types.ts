export interface ClientStats {
    id: string;
    client_profile_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    instagram: string | null;
    total_visits: number;
    total_spent: number;
    total_cancellations: number;
    last_visit: string | null;
    is_blocked: boolean;
}

export type SortField = "name" | "visits" | "spent" | "last_visit";
