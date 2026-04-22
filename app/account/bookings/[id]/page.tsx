"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, ArrowLeft, Calendar, Clock, MapPin,
  CheckCircle2, XCircle, AlertCircle, CalendarClock,
  Sparkles, ExternalLink
} from "lucide-react";
import { Button, Badge, Separator } from "@/components/ui";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/features/Header";
import { CancelModal } from "@/components/features/account/CancelModal";
import { RescheduleModal } from "@/components/features/account/RescheduleModal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

/* ─── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, {
  label: string;
  dot: string;
  badge: string;
  icon: React.ReactNode;
}> = {
  confirmed:       { label: "Confirmé",           dot: "bg-emerald-400",  badge: "bg-emerald-50/90  text-emerald-700 border-emerald-200/60", icon: <CheckCircle2 size={13} /> },
  pending:         { label: "En attente",          dot: "bg-amber-400",    badge: "bg-amber-50/90    text-amber-700   border-amber-200/60",   icon: <AlertCircle  size={13} /> },
  pending_deposit: { label: "Acompte en attente",  dot: "bg-orange-400",   badge: "bg-orange-50/90   text-orange-700  border-orange-200/60",  icon: <AlertCircle  size={13} /> },
  cancelled:       { label: "Annulé",              dot: "bg-red-400",      badge: "bg-red-50/90      text-red-700     border-red-200/60",      icon: <XCircle      size={13} /> },
  refused:         { label: "Refusé",              dot: "bg-red-400",      badge: "bg-red-50/90      text-red-700     border-red-200/60",      icon: <XCircle      size={13} /> },
  completed:       { label: "Honoré",              dot: "bg-emerald-400",  badge: "bg-emerald-50/90  text-emerald-700 border-emerald-200/60", icon: <CheckCircle2 size={13} /> },
  no_show:         { label: "Absent (Lapin)",      dot: "bg-red-600",      badge: "bg-red-100/90     text-red-700     border-red-300/60",      icon: <XCircle      size={13} /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400", badge: "bg-white/80 text-gray-700 border-gray-200/60", icon: null };
  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border backdrop-blur-md shadow-sm",
      cfg.badge
    )}>
      <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

/* ─── Info card (date / heure) ──────────────────────────────────────────── */
function InfoCard({ icon: Icon, label, value, accent = false }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-2xl border transition-all",
      accent
        ? "bg-primary/5 border-primary/10"
        : "bg-white border-gray-100 shadow-sm"
    )}>
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
        accent ? "bg-[#c0a062]/15" : "bg-gray-50"
      )}>
        <Icon size={20} className={accent ? "text-[#c0a062]" : "text-primary/50"} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={cn("font-black tracking-tight", accent ? "text-gray-900 text-lg" : "text-gray-800 text-base")}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Section title ──────────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const supabase = createClient();

  useEffect(() => { fetchBookingData(); }, [id]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select(`*, services (*), establishments (*)`)
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("Réservation introuvable ou vous n'avez pas l'autorisation d'y accéder.");
        setLoading(false);
        return;
      }
      setAppointment(data);
    } catch (err) {
      setError("Une erreur est survenue lors du chargement de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      const response = await fetch("/api/booking/cancel-by-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, reason: cancelReason || null }),
      });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || "Failed to cancel");
      setAppointment((prev: any) => ({ ...prev, status: "cancelled" }));
      setShowCancelModal(false);
    } catch (error) {
      console.error("Erreur annulation:", error);
    } finally {
      setCancelling(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f3ef] via-[#f0eeea] to-[#edf0ea] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-primary/40 text-sm font-bold tracking-wider uppercase">Chargement...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f3ef] to-[#edf0ea] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <XCircle className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Réservation introuvable</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link href="/account">
            <Button variant="primary" className="w-full rounded-xl font-bold cursor-pointer">
              Retour à mon compte
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(appointment.start_time);
  const endDate   = new Date(appointment.end_time);
  const isFuture  = endDate > new Date();

  let displayStatus = appointment.status;
  if (displayStatus === "confirmed" && !isFuture) displayStatus = "completed";

  const hasCancelableStatus = ["confirmed", "pending", "pending_deposit"].includes(appointment.status);
  const canCancel = isFuture && hasCancelableStatus;
  const isCancelled = ["cancelled", "refused", "no_show"].includes(displayStatus);

  const timelineSteps = [
    { key: "booked",    label: "Réservé",   done: true },
    { key: "confirmed", label: "Confirmé",  done: displayStatus === "confirmed" || displayStatus === "completed" },
    { key: "completed", label: "Honoré",    done: displayStatus === "completed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3ef] via-[#f0eeea] to-[#edf0ea] pb-16">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#c0a062]/[0.03] blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <Header />

      <div className="relative z-10 pt-24">
        <div className="max-w-3xl mx-auto px-4">

          {/* ── Back button ── */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5"
          >
            <Link href="/account">
              <Button variant="ghost" className="text-gray-500 hover:text-primary font-bold group px-0 gap-2 cursor-pointer">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Mes réservations
              </Button>
            </Link>
          </motion.div>

          {/* ── Main card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden"
          >
            {/* Hero photo */}
            <div className="relative h-52 md:h-72 w-full bg-gray-100">
              {appointment.establishments?.main_photo_url ? (
                <Image
                  src={appointment.establishments.main_photo_url}
                  alt={appointment.establishments.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2b18] to-[#32422c] flex items-center justify-center">
                  <span className="text-white/10 font-black text-4xl uppercase tracking-tighter">
                    {appointment.establishments?.name}
                  </span>
                </div>
              )}
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/50 to-transparent" />

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <StatusBadge status={displayStatus} />
              </div>

              {/* Ref badge */}
              <div className="absolute bottom-4 left-5">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                  Réf · {appointment.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="p-6 md:p-8 space-y-8">

              {/* Establishment name + address + actions */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                    {appointment.establishments?.name}
                  </h1>
                  <div className="flex items-start gap-2 text-gray-500">
                    <MapPin size={15} className="text-[#c0a062] flex-shrink-0 mt-0.5" />
                    {appointment.establishments?.hide_exact_address &&
                     (new Date(appointment.start_time).getTime() - new Date().getTime() > 24 * 60 * 60 * 1000) ? (
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {appointment.establishments?.city} {appointment.establishments?.zip_code}
                        </p>
                        <p className="text-xs text-primary font-bold mt-1 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 inline-block">
                          Adresse communiquée 24h avant le RDV
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-600">
                        {appointment.establishments?.address}, {appointment.establishments?.city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {canCancel && (
                  <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
                    <Button
                      variant="outline"
                      className="border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary rounded-xl font-bold gap-2 cursor-pointer"
                      onClick={() => setShowRescheduleModal(true)}
                    >
                      <CalendarClock size={16} />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold gap-2 cursor-pointer"
                      onClick={() => setShowCancelModal(true)}
                    >
                      <XCircle size={16} />
                      Annuler
                    </Button>
                  </div>
                )}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* ── Prestation ── */}
              <div>
                <SectionTitle>Prestation</SectionTitle>
                <div className="bg-gradient-to-br from-gray-50/80 to-white rounded-2xl border border-gray-100 p-5 md:p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Service image */}
                    {appointment.services?.image_url ? (
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl relative overflow-hidden shadow-lg ring-4 ring-white flex-shrink-0">
                        <Image
                          src={appointment.services.image_url}
                          alt={appointment.services.name || "Prestation"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-[#c0a062]/10 flex items-center justify-center flex-shrink-0 ring-4 ring-white shadow-lg">
                        <Sparkles size={36} className="text-primary/30" />
                      </div>
                    )}

                    <div className="text-center md:text-left space-y-3 flex-1">
                      <p className="font-black text-gray-900 text-xl md:text-2xl leading-tight">
                        {appointment.services?.name || "Prestation personnalisée"}
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {appointment.services?.duration && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-600 shadow-sm">
                            <Clock size={12} className="text-primary/60" />
                            {appointment.services.duration} min
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c0a062]/10 text-xs font-black text-[#8a6e34]">
                          {appointment.services?.price ? `${appointment.services.price}€` : "—"}
                        </span>
                      </div>
                      {appointment.services?.description && appointment.services.description !== "Mystère" && (
                        <p className="text-gray-400 text-sm leading-relaxed italic border-l-2 border-[#c0a062]/30 pl-3">
                          {appointment.services.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Date + Paiement ── */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Date & heure */}
                <div>
                  <SectionTitle>Rendez-vous</SectionTitle>
                  <div className="space-y-3">
                    <InfoCard icon={Calendar} label="Date" value={formatDateFull(startDate)} accent />
                    <InfoCard icon={Clock}    label="Heure" value={`${formatTime(startDate)} → ${formatTime(endDate)}`} />
                  </div>
                </div>

                {/* Paiement */}
                <div>
                  <SectionTitle>Paiement</SectionTitle>
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* Dark premium background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e2b18] to-[#2e3d23]" />
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/50 to-transparent" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#c0a062]/5 blur-2xl" />

                    <div className="relative z-10 p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total prestation</span>
                        <span className="text-white/70 font-black text-base">
                          {appointment.services?.price ? `${appointment.services.price}€` : "—"}
                        </span>
                      </div>

                      {appointment.deposit_amount && (
                        <>
                          <div className="h-px bg-white/[0.06]" />
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-black text-[#c0a062]/80 uppercase tracking-[0.2em]">Acompte payé</span>
                              <p className="text-[10px] text-white/30 mt-0.5">Réservé en ligne</p>
                            </div>
                            <span className="text-[#c0a062] font-black text-base">-{appointment.deposit_amount}€</span>
                          </div>
                          <div className="h-px border-t border-dashed border-white/10" />
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Reste à payer</span>
                            <div className="text-right">
                              <span className="text-3xl font-black text-white tracking-tight">
                                {appointment.services?.price
                                  ? `${appointment.services.price - (appointment.deposit_amount || 0)}€`
                                  : "—"}
                              </span>
                              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Sur place</p>
                            </div>
                          </div>
                        </>
                      )}

                      {!appointment.deposit_amount && (
                        <>
                          <div className="h-px bg-white/[0.06]" />
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">À régler sur place</span>
                            <span className="text-3xl font-black text-white tracking-tight">
                              {appointment.services?.price ? `${appointment.services.price}€` : "—"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Timeline ── */}
              {appointment.deposit_amount && !isCancelled && (
                <div>
                  <SectionTitle>Progression</SectionTitle>
                  <div className="relative flex items-start justify-between px-4 pt-2">
                    {/* Track line background */}
                    <div className="absolute top-[22px] left-12 right-12 h-0.5 bg-gray-100" />
                    {/* Track line progress */}
                    <motion.div
                      className="absolute top-[22px] left-12 h-0.5 bg-gradient-to-r from-[#c0a062] to-primary"
                      initial={{ width: 0 }}
                      animate={{
                        width: displayStatus === "pending_deposit" ? "0%"
                          : displayStatus === "confirmed" ? "50%"
                          : "100%"
                      }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    />

                    {timelineSteps.map((step, i) => {
                      const isActive = step.done;
                      const isCurrent = (
                        (step.key === "booked"    && displayStatus === "pending_deposit") ||
                        (step.key === "confirmed" && displayStatus === "confirmed") ||
                        (step.key === "completed" && displayStatus === "completed")
                      );

                      return (
                        <motion.div
                          key={step.key}
                          className="flex flex-col items-center gap-2 z-10 flex-1"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          <div className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500",
                            isActive
                              ? "bg-gradient-to-br from-[#c0a062] to-[#a8854e] text-white shadow-lg shadow-[#c0a062]/25"
                              : "bg-white border-2 border-gray-100 text-gray-300"
                          )}>
                            {isActive ? <CheckCircle2 size={20} /> : (i + 1)}
                          </div>
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest text-center",
                            isCurrent ? "text-[#c0a062]" : isActive ? "text-gray-800" : "text-gray-300"
                          )}>
                            {step.label}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Cancelled banner ── */}
              {isCancelled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-red-700 text-sm">Réservation annulée</p>
                    {appointment.cancellation_reason && (
                      <p className="text-xs text-red-400 mt-0.5">Motif : {appointment.cancellation_reason}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ── Footer CTA ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex justify-center"
          >
            <Link href={`/establishment/${appointment.establishments?.id}`}>
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-primary font-bold gap-2 group cursor-pointer"
              >
                <ExternalLink size={14} className="group-hover:scale-110 transition-transform" />
                Voir la page de l'établissement
              </Button>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Modals */}
      {showCancelModal && appointment && (
        <CancelModal
          appointment={appointment}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelAppointment}
          reason={cancelReason}
          setReason={setCancelReason}
          cancelling={cancelling}
          formatDate={(d) => formatDateFull(new Date(d))}
          formatTime={(d) => formatTime(new Date(d))}
        />
      )}

      {showRescheduleModal && appointment && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
          onSuccess={(newStart, newEnd) => {
            setAppointment((prev: any) => ({ ...prev, start_time: newStart, end_time: newEnd }));
            setShowRescheduleModal(false);
          }}
        />
      )}
    </div>
  );
}
