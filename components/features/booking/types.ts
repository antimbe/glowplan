export interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
}

export interface OpeningHour {
    day_of_week: number;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
    break_start: string | null;
    break_end: string | null;
}

export interface AvailableSlot {
    date: Date;
    time: string;
    endTime: string;
}

export interface ClientInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    instagram: string;
    notes: string;
}

export type BookingStep = "info" | "datetime" | "recap" | "confirmation";
