export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  userId: string;
  name: string;
  duration: number;
  price: number;
  category?: string;
}

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  userId: string;
  clientId: string;
  serviceId: string;
  date: Date;
  status: AppointmentStatus;
  price: number;
  notes?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  slug: string;
}
