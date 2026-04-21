"use client";

import { Calendar, Clock, Check, X, Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Appointment } from "./types";

interface AppointmentsTabProps {
    appointments: Appointment[];
    onCancelClick: (apt: Appointment) => void;
    onReviewClick: (apt: Appointment) => void;
    formatDate: (date: string) => string;
    formatTime: (date: string) => string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
    confirmed:        { label: "Confirmé",              dot: "bg-emerald-400",  badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    pending:          { label: "En attente",            dot: "bg-amber-400",    badge: "bg-amber-50 text-amber-700 border-amber-100" },
    pending_deposit:  { label: "Acompte en attente",    dot: "bg-orange-400",   badge: "bg-orange-50 text-orange-700 border-orange-100" },
    completed:        { label: "Honoré",                dot: "bg-emerald-400",  badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    cancelled:        { label: "Annulé",                dot: "bg-red-400",      badge: "bg-red-50 text-red-600 border-red-100" },
    no_show:          { label: "Absent (Lapin)",        dot: "bg-red-600",      badge: "bg-red-100 text-red-700 border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-100" };
    return (
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border", cfg.badge)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
        </span>
    );
}

function AppointmentCard({
    apt,
    isUpcoming,
    onCancelClick,
    onReviewClick,
    formatDate,
    formatTime,
    index,
}: {
    apt: Appointment;
    isUpcoming: boolean;
    onCancelClick: (apt: Appointment) => void;
    onReviewClick: (apt: Appointment) => void;
    formatDate: (date: string) => string;
    formatTime: (date: string) => string;
    index: number;
}) {
    const router = useRouter();
    const isPast = new Date(apt.end_time) <= new Date();
    const displayStatus = apt.status === "confirmed" && isPast ? "completed" : apt.status;
    const canReview = displayStatus === "completed" && !apt.has_review;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => router.push(`/account/bookings/${apt.id}`)}
            className={cn(
                "group relative rounded-2xl border cursor-pointer transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-0.5",
                isUpcoming
                    ? "bg-white border-gray-100 hover:border-[#c0a062]/30 hover:shadow-[#c0a062]/10"
                    : apt.status === "cancelled"
                        ? "bg-red-50/40 border-red-100 hover:border-red-200"
                        : "bg-gray-50/60 border-gray-100 hover:border-gray-200"
            )}
        >
            {/* Gold left accent for upcoming */}
            {isUpcoming && (
                <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-[#c0a062] to-[#a8854e]" />
            )}

            <div className="p-4 pl-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                            <h3 className={cn(
                                "font-bold truncate text-base",
                                isUpcoming ? "text-gray-900" : "text-gray-600"
                            )}>
                                {apt.establishments?.name}
                            </h3>
                        </div>
                        <p className={cn(
                            "text-sm truncate mt-0.5",
                            isUpcoming ? "text-primary/70 font-medium" : "text-gray-400"
                        )}>
                            {apt.services?.name}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                            <span className={cn(
                                "flex items-center gap-1.5 text-xs font-medium",
                                isUpcoming ? "text-gray-600" : "text-gray-400"
                            )}>
                                <Calendar size={12} className={isUpcoming ? "text-[#c0a062]" : "text-gray-300"} />
                                {formatDate(apt.start_time)}
                            </span>
                            <span className={cn(
                                "flex items-center gap-1.5 text-xs font-medium",
                                isUpcoming ? "text-gray-600" : "text-gray-400"
                            )}>
                                <Clock size={12} className={isUpcoming ? "text-[#c0a062]" : "text-gray-300"} />
                                {formatTime(apt.start_time)} · {apt.services?.duration} min
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2.5">
                            <StatusBadge status={displayStatus} />
                            {apt.status === "cancelled" && !apt.cancelled_by_client && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-orange-50 text-orange-600 border-orange-100">
                                    Par l'établissement
                                </span>
                            )}
                            {apt.has_review && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-100">
                                    <Star size={10} className="fill-blue-400 text-blue-400" />
                                    Avis laissé
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: price + actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100/80">
                        <p className={cn(
                            "text-xl font-black",
                            isUpcoming ? "text-[#c0a062]" : "text-gray-300"
                        )}>
                            {apt.services?.price}€
                        </p>

                        {isUpcoming && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); onCancelClick(apt); }}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl"
                            >
                                Annuler
                            </Button>
                        )}
                        {canReview && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); onReviewClick(apt); }}
                                className="text-primary hover:bg-primary/5 text-xs font-bold rounded-xl gap-1"
                            >
                                <Star size={12} className="text-[#c0a062]" />
                                Avis
                            </Button>
                        )}

                        <ArrowRight
                            size={14}
                            className="text-gray-300 group-hover:text-gray-400 transition-colors hidden sm:block mt-auto"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-black text-gray-700 uppercase tracking-[0.12em]">{children}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>
    );
}

export function AppointmentsTab({
    appointments,
    onCancelClick,
    onReviewClick,
    formatDate,
    formatTime,
}: AppointmentsTabProps) {
    const upcomingAppointments = appointments.filter(
        (a) => new Date(a.end_time) > new Date() && a.status !== "cancelled"
    );
    const pastAppointments = appointments.filter(
        (a) => new Date(a.end_time) <= new Date() || a.status === "cancelled"
    );

    if (appointments.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-16 text-center"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-[#c0a062]/10 flex items-center justify-center mb-5 shadow-inner">
                    <Calendar size={36} className="text-primary/30" />
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-2">Aucune réservation</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">Explorez nos établissements partenaires et réservez votre première prestation</p>
                <Link href="/search">
                    <Button variant="primary" className="cursor-pointer gap-2 rounded-xl font-bold">
                        <Sparkles size={15} />
                        Trouver un établissement
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            {upcomingAppointments.length > 0 && (
                <div>
                    <SectionLabel>À venir · {upcomingAppointments.length}</SectionLabel>
                    <div className="space-y-3">
                        {upcomingAppointments.map((apt, i) => (
                            <AppointmentCard
                                key={apt.id}
                                apt={apt}
                                isUpcoming
                                onCancelClick={onCancelClick}
                                onReviewClick={onReviewClick}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                index={i}
                            />
                        ))}
                    </div>
                </div>
            )}

            {pastAppointments.length > 0 && (
                <div>
                    <SectionLabel>Historique · {pastAppointments.length}</SectionLabel>
                    <div className="space-y-3">
                        {pastAppointments.map((apt, i) => (
                            <AppointmentCard
                                key={apt.id}
                                apt={apt}
                                isUpcoming={false}
                                onCancelClick={onCancelClick}
                                onReviewClick={onReviewClick}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                index={i}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
