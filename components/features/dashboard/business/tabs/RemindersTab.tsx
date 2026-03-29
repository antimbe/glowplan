"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, User, Mail, Phone, Instagram, Send, Loader2, CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { MONTHS_LOWER } from "@/lib/utils/formatters";

interface Reminder {
  id: string;
  type: string;
  status: string;
  sent_at: string;
}

interface AppointmentWithReminders {
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
  client_profile_id: string | null;
  services: {
    name: string;
    price: number;
    duration: number;
  } | null;
  appointment_reminders: Reminder[];
}

interface RemindersTabProps {
  establishmentId: string;
}

export default function RemindersTab({ establishmentId }: RemindersTabProps) {
  const [appointments, setAppointments] = useState<AppointmentWithReminders[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    loadAppointments();
  }, [establishmentId]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Pour "les rdv du lendemain", nous prenons de maintenant jusqu'à la fin de demain
      const now = new Date();
      const endOfTomorrow = new Date();
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, start_time, end_time, status, client_name, client_first_name, client_last_name, client_email, client_phone, client_instagram, client_profile_id,
          services(name, price, duration),
          appointment_reminders(id, type, status, sent_at)
        `)
        .eq("establishment_id", establishmentId)
        .neq("status", "cancelled")
        .gte("start_time", now.toISOString())
        .lte("start_time", endOfTomorrow.toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        // En cas d'erreur de relation (si la table n'existe pas encore ou erreur de cache)
        console.error("Error fetching appointments with reminders:", error);
        // Fallback sans la jointure si la migration n'est pas passée correctement
        const { data: fallbackData } = await supabase
          .from("appointments")
          .select(`
            id, start_time, end_time, status, client_name, client_first_name, client_last_name, client_email, client_phone, client_instagram, client_profile_id,
            services(name, price, duration)
          `)
          .eq("establishment_id", establishmentId)
          .neq("status", "cancelled")
          .gte("start_time", now.toISOString())
          .lte("start_time", endOfTomorrow.toISOString())
          .order("start_time", { ascending: true });
          
        setAppointments((fallbackData || []).map(apt => ({ ...apt, appointment_reminders: [] })) as unknown as AppointmentWithReminders[]);
      } else {
        setAppointments((data || []) as unknown as AppointmentWithReminders[]);
      }
    } catch (error) {
      console.error("Error in loadAppointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendManualReminder = async (appointmentId: string) => {
    setSendingId(appointmentId);
    try {
      // 1. Enregistrer le rappel dans Supabase
      const { data, error } = await supabase
        .from("appointment_reminders")
        .insert({
          appointment_id: appointmentId,
          establishment_id: establishmentId,
          type: "manual",
          status: "sent"
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Appeler l'API pour envoyer l'email
      await fetch("/api/booking/reminder/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      // 3. Mettre à jour l'affichage
      setAppointments(prev => prev.map(apt => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            appointment_reminders: [...(apt.appointment_reminders || []), data as Reminder]
          };
        }
        return apt;
      }));
    } catch (error) {
      console.error("Erreur lors de l'envoi du rappel manuel :", error);
      alert("Erreur lors de l'enregistrement du rappel. Vérifiez que la base de données est à jour.");
    } finally {
      setSendingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS_LOWER[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const getClientName = (apt: AppointmentWithReminders) => {
    if (apt.client_first_name && apt.client_last_name) {
      return `${apt.client_first_name} ${apt.client_last_name}`;
    }
    return apt.client_name || "Client anonyme";
  };

  const isTomorrow = (dateStr: string) => {
    const date = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
  };

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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Suivi des rappels</h2>
          <p className="text-gray-600 text-sm max-w-xl">
            Retrouvez ici les rendez-vous à venir (aujourd'hui et demain). Un rappel automatique est envoyé 24h avant chaque rendez-vous. Vous pouvez aussi relancer manuellement.
          </p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-50 text-center flex-shrink-0">
          <p className="text-3xl font-bold text-primary">{appointments.filter(a => isTomorrow(a.start_time)).length}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold mt-1">RDV pour demain</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col lg:flex-row gap-5">
                
                {/* Left col: Appointment Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full",
                      isTomorrow(apt.start_time) ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {isTomorrow(apt.start_time) ? "Demain" : "Aujourd'hui"}
                    </span>
                    <span className="font-bold text-primary whitespace-nowrap">
                      {apt.services?.price || "—"}€
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{getClientName(apt)}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-4">{apt.services?.name || "Prestation non spécifiée"}</p>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(apt.start_time)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {formatTime(apt.start_time)}
                    </div>
                    {apt.client_phone && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Phone size={14} className="text-gray-400" />
                        {apt.client_phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-px bg-gray-100 mx-2" />
                <div className="block lg:hidden h-px w-full bg-gray-100 my-1" />

                {/* Right col: Reminders Status & Actions */}
                <div className="w-full lg:w-72 flex flex-col justify-between">
                  <div className="mb-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                      <History size={16} className="text-gray-400" />
                      Historique des rappels
                    </h4>
                    
                    {apt.appointment_reminders && apt.appointment_reminders.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {apt.appointment_reminders.map((reminder) => (
                          <div key={reminder.id} className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg text-xs">
                            <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-700">
                                {reminder.type === "email_24h" ? "Email automatique 24h" : 
                                 reminder.type === "sms_24h" ? "SMS automatique 24h" : 
                                 "Rappel manuel"}
                              </p>
                              <p className="text-gray-500 text-[10px]">Envoyé le {formatDate(reminder.sent_at)} à {formatTime(reminder.sent_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-lg text-center">
                        Aucun rappel envoyé pour le moment.
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer"
                    onClick={() => handleSendManualReminder(apt.id)}
                    disabled={sendingId === apt.id}
                  >
                    {sendingId === apt.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Envoi...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send size={16} /> Envoyer un rappel manuel
                      </span>
                    )}
                  </Button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rendez-vous à venir</h3>
            <p className="text-gray-500" />
            <p className="text-gray-500">
              Vous n'avez pas de rendez-vous prévus pour aujourd'hui ou demain.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
