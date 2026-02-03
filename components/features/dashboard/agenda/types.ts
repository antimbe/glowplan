export interface AppointmentData {
  id?: string;
  establishment_id?: string;
  service_id?: string | null;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled" | "completed" | "no_show";
  notes?: string;
  is_manual: boolean;
  service?: {
    name: string;
    duration: number;
    price: number;
  };
}

export type UnavailabilityType = "vacation" | "training" | "illness" | "event" | "other";

export interface UnavailabilityData {
  id?: string;
  establishment_id?: string;
  start_time: string;
  end_time: string;
  unavailability_type: UnavailabilityType;
  reason?: string;
  is_recurring: boolean;
  recurrence_pattern?: "daily" | "weekly" | "monthly" | null;
}

export type CalendarViewType = "day" | "week" | "month";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "appointment" | "unavailability";
  data: AppointmentData | UnavailabilityData;
}
