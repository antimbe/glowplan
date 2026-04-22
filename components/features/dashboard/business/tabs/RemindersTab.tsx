"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useModal } from "@/contexts/ModalContext";
import { Calendar, Clock, Phone, Send, Loader2, CheckCircle2, History, Settings2, ChevronDown, ChevronUp, Info } from "lucide-react";
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

  // ── Settings panel ────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [reminderDelayHours, setReminderDelayHours] = useState<number>(24);
  const [customDelay, setCustomDelay] = useState<string>("");
  const [reminderMessage, setReminderMessage] = useState<string>("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadAppointments();
    loadSettings();
  }, [establishmentId]);

  const loadSettings = async () => {
    if (!establishmentId) return;
    try {
      const { data } = await supabase
        .from("establishments")
        .select("reminder_delay_hours, reminder_custom_message")
        .eq("id", establishmentId)
        .single();
      if (data) {
        if (data.reminder_delay_hours) {
          const h = data.reminder_delay_hours;
          if (h === 24 || h === 48) {
            setReminderDelayHours(h);
          } else {
            setReminderDelayHours(0); // custom
            setCustomDelay(String(h));
          }
        }
        if (data.reminder_custom_message) {
          setReminderMessage(data.reminder_custom_message);
        }
      }
    } catch {
      // columns may not exist yet — silently ignore
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const hours = reminderDelayHours === 0
        ? Math.max(1, parseInt(customDelay || "24", 10))
        : reminderDelayHours;

      const { error } = await supabase
        .from("establishments")
        .update({
          reminder_delay_hours: hours,
          reminder_custom_message: reminderMessage.trim() || null,
        })
        .eq("id", establishmentId);

      if (error) throw error;

      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde paramètres rappels:", err);
    } finally {
      setSavingSettings(false);
    }
  };

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
  const { showSuccess, showError } = useModal();

  const handleSendManualReminder = async (appointmentId: string) => {
    setSendingId(appointmentId);
    try {
      // Appeler l'API qui gère l'enregistrement du rappel et l'envoi de l'email côté serveur
      const response = await fetch("/api/booking/reminder/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Échec de l'envoi de l'email");
      }

      // Recharger les rendez-vous pour mettre à jour l'état et afficher le nouveau rappel
      await loadAppointments();
      
      showSuccess("Succès", "Le rappel a été envoyé avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du rappel manuel :", error);
      const message = error.message || "Vérifiez votre configuration email.";
      const details = error.details ? ` (${error.details})` : "";
      showError("Erreur d'envoi", `${message}${details}`);
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

  const delayLabel = reminderDelayHours === 0
    ? `${customDelay || "?"} h avant`
    : `${reminderDelayHours}h avant`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Suivi des rappels</h2>
          <p className="text-gray-600 text-sm max-w-xl">
            Rappel automatique envoyé <strong>{delayLabel}</strong> chaque rendez-vous. Personnalisez le délai et le message ci-dessous.
          </p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-50 text-center flex-shrink-0">
          <p className="text-3xl font-bold text-primary">{appointments.filter(a => isTomorrow(a.start_time)).length}</p>
          <p className="text-xs text-gray-500 uppercase font-semibold mt-1">RDV pour demain</p>
        </div>
      </div>

      {/* ── Settings panel ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowSettings(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Paramètres des rappels automatiques</p>
              <p className="text-xs text-gray-400">Délai d'envoi · Message personnalisé</p>
            </div>
          </div>
          {showSettings ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {showSettings && (
          <div className="px-5 pb-5 border-t border-gray-100 space-y-5 pt-5 animate-in fade-in slide-in-from-top-2 duration-200">

            {/* Delay selector */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 block">
                Délai d'envoi avant le RDV
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "1h avant", value: 1 },
                  { label: "2h avant", value: 2 },
                  { label: "24h avant", value: 24 },
                  { label: "48h avant", value: 48 },
                  { label: "Personnalisé", value: 0 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setReminderDelayHours(opt.value)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer",
                      reminderDelayHours === opt.value
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-600 hover:border-primary/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {reminderDelayHours === 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={customDelay}
                    onChange={e => setCustomDelay(e.target.value)}
                    placeholder="Ex: 6"
                    className="w-24 h-10 px-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm text-gray-500">heures avant le rendez-vous</span>
                </div>
              )}
            </div>

            {/* Custom message */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">
                Message personnalisé
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Variables disponibles : <code className="bg-gray-100 px-1 rounded">{"{client_name}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{service_name}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{date}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{time}"}</code>
              </p>
              <textarea
                value={reminderMessage}
                onChange={e => setReminderMessage(e.target.value)}
                rows={4}
                placeholder={`Bonjour {client_name}, nous vous rappelons votre rendez-vous pour {service_name} le {date} à {time}. À bientôt !`}
                className="w-full text-sm rounded-xl border border-gray-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 placeholder:text-gray-300"
              />
              <div className="flex items-start gap-2 mt-2">
                <Info size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                  Si laissé vide, le message par défaut de l'application sera utilisé.
                </p>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3 pt-1">
              {settingsSaved && (
                <span className="text-sm text-green-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 size={15} /> Paramètres enregistrés
                </span>
              )}
              <Button
                variant="primary"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="h-10 px-5 text-sm font-semibold rounded-xl"
              >
                {savingSettings ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Enregistrement…
                  </span>
                ) : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}
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
