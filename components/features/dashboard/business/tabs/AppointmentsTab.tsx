"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, User, Mail, Phone, Instagram, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string | null;
  client_first_name: string | null;
  client_last_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_instagram: string | null;
  notes: string | null;
  services: {
    name: string;
    price: number;
    duration: number;
  } | null;
}

interface AppointmentsTabProps {
  establishmentId: string;
}

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default function AppointmentsTab({ establishmentId }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [updating, setUpdating] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const supabase = createClient();

  useEffect(() => {
    loadAppointments();
  }, [establishmentId]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, start_time, end_time, status, client_name, client_first_name, client_last_name, client_email, client_phone, client_instagram, notes,
          services(name, price, duration)
        `)
        .eq("establishment_id", establishmentId)
        .order("start_time", { ascending: false });

      if (error) throw error;
      setAppointments((data || []) as unknown as Appointment[]);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    setUpdating(appointmentId);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      setAppointments(prev =>
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt)
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
    } finally {
      setUpdating(null);
    }
  };

  const openCancelModal = (apt: Appointment) => {
    setCancelModal(apt);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    
    setUpdating(cancelModal.id);
    try {
      // Update appointment status
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: "cancelled",
          cancelled_by_client: false,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", cancelModal.id);

      if (error) throw error;

      // Send cancellation email to client with reason
      await fetch("/api/booking/cancel-by-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          appointmentId: cancelModal.id,
          reason: cancelReason || null,
        }),
      });

      setAppointments(prev =>
        prev.map(apt => apt.id === cancelModal.id ? { ...apt, status: "cancelled" } : apt)
      );
      setCancelModal(null);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const getClientName = (apt: Appointment) => {
    if (apt.client_first_name && apt.client_last_name) {
      return `${apt.client_first_name} ${apt.client_last_name}`;
    }
    return apt.client_name || "Client anonyme";
  };

  const now = new Date();
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time);
    if (filter === "upcoming") return aptDate >= now && apt.status !== "cancelled";
    if (filter === "past") return aptDate < now || apt.status === "cancelled";
    return true;
  });

  const upcomingCount = appointments.filter(apt => new Date(apt.start_time) >= now && apt.status !== "cancelled").length;
  const pastCount = appointments.filter(apt => new Date(apt.start_time) < now || apt.status === "cancelled").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Rendez-vous clients</h2>
        <p className="text-gray-500 text-sm">Gérez les réservations effectuées par vos clients</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "upcoming" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("upcoming")}
          className="cursor-pointer"
        >
          À venir ({upcomingCount})
        </Button>
        <Button
          variant={filter === "past" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("past")}
          className="cursor-pointer"
        >
          Passés / Annulés ({pastCount})
        </Button>
        <Button
          variant={filter === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="cursor-pointer"
        >
          Tous ({appointments.length})
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className={cn(
                "bg-white rounded-2xl p-5 border",
                apt.status === "cancelled" ? "border-red-200 bg-red-50/30" :
                apt.status === "confirmed" ? "border-green-200" :
                "border-gray-100"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  {/* Client Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {getClientName(apt).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{getClientName(apt)}</h3>
                      <p className="text-sm text-gray-500">{apt.services?.name || "Prestation non spécifiée"}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(apt.start_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </span>
                    {apt.client_email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {apt.client_email}
                      </span>
                    )}
                    {apt.client_phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {apt.client_phone}
                      </span>
                    )}
                    {apt.client_instagram && (
                      <span className="flex items-center gap-1">
                        <Instagram size={14} />
                        @{apt.client_instagram.replace(/^@/, "")}
                      </span>
                    )}
                  </div>

                  {apt.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">Note: {apt.notes}</p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                    apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {apt.status === "confirmed" ? "Confirmé" :
                     apt.status === "pending" ? "En attente" :
                     apt.status === "cancelled" ? "Annulé" : apt.status}
                  </span>

                  <span className="font-bold text-primary text-lg">
                    {apt.services?.price || "—"}€
                  </span>

                  {apt.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                        disabled={updating === apt.id}
                        className="cursor-pointer"
                      >
                        {updating === apt.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCancelModal(apt)}
                        disabled={updating === apt.id}
                        className="text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )}

                  {apt.status === "confirmed" && new Date(apt.start_time) >= now && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCancelModal(apt)}
                      disabled={updating === apt.id}
                      className="text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
                    >
                      {updating === apt.id ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                      <span className="ml-1">Annuler</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rendez-vous</h3>
          <p className="text-gray-500">
            {filter === "upcoming" ? "Vous n'avez pas de rendez-vous à venir" :
             filter === "past" ? "Aucun rendez-vous passé" :
             "Aucun rendez-vous enregistré"}
          </p>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Annuler ce rendez-vous ?</h2>
                <p className="text-gray-500 text-sm">Cette action est irréversible</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-900">{getClientName(cancelModal)}</p>
              <p className="text-sm text-gray-500">{cancelModal.services?.name}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(cancelModal.start_time)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatTime(cancelModal.start_time)}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de l'annulation (optionnel)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Indisponibilité, urgence personnelle..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ce motif sera communiqué au client par email
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCancelModal(null)}
                disabled={updating === cancelModal.id}
                className="flex-1 cursor-pointer"
              >
                Retour
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCancel}
                disabled={updating === cancelModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {updating === cancelModal.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Annulation...
                  </span>
                ) : (
                  "Confirmer l'annulation"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
