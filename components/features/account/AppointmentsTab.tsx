"use client";

import { Calendar, Clock, Check, X, Star } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { Appointment } from "./types";

interface AppointmentsTabProps {
    appointments: Appointment[];
    onCancelClick: (apt: Appointment) => void;
    onReviewClick: (apt: Appointment) => void;
    formatDate: (date: string) => string;
    formatTime: (date: string) => string;
}

export function AppointmentsTab({
    appointments,
    onCancelClick,
    onReviewClick,
    formatDate,
    formatTime
}: AppointmentsTabProps) {
    const upcomingAppointments = appointments.filter(
        a => new Date(a.start_time) > new Date() && a.status !== "cancelled"
    );
    const pastAppointments = appointments.filter(
        a => new Date(a.start_time) <= new Date() || a.status === "cancelled"
    );

    return (
        <div>
            {upcomingAppointments.length > 0 && (
                <>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Réservations à venir</h2>
                    <div className="space-y-4 mb-8">
                        {upcomingAppointments.map((apt) => (
                            <div key={apt.id} className="border border-gray-200 rounded-xl p-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{apt.establishments?.name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{apt.services?.name}</p>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} className="flex-shrink-0" />
                                                <span className="truncate">{formatDate(apt.start_time)}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} className="flex-shrink-0" />
                                                {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                                            </span>
                                            <span className="hidden sm:inline">({apt.services?.duration} min)</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                                                apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                                                    apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-gray-100 text-gray-700"
                                            )}>
                                                <Check size={12} />
                                                {apt.status === "confirmed" ? "RDV Confirmé" :
                                                    apt.status === "pending" ? "En attente" : apt.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                        <p className="text-lg font-bold text-primary">{apt.services?.price}€</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onCancelClick(apt)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {pastAppointments.length > 0 && (
                <>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Historique</h2>
                    <div className="space-y-4">
                        {pastAppointments.map((apt) => {
                            const canReview = apt.status !== "cancelled" && !apt.has_review;
                            return (
                                <div key={apt.id} className={cn(
                                    "border rounded-xl p-4",
                                    apt.status === "cancelled" ? "border-red-200 bg-red-50/50" : "border-gray-200"
                                )}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{apt.establishments?.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{apt.services?.name}</p>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                                                <span>{formatDate(apt.start_time)}</span>
                                                <span>{formatTime(apt.start_time)}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {apt.status === "cancelled" && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                                        <X size={12} />
                                                        Annulé
                                                    </span>
                                                )}
                                                {apt.has_review && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                        <Check size={12} />
                                                        Avis laissé
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <p className="text-lg font-bold text-gray-400">{apt.services?.price}€</p>
                                            {canReview && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onReviewClick(apt)}
                                                    className="text-primary hover:text-primary-dark hover:bg-primary/5"
                                                >
                                                    <Star size={14} className="mr-1" />
                                                    Laisser un avis
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {appointments.length === 0 && (
                <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réservation</h3>
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore de réservation</p>
                    <Link href="/search">
                        <Button variant="primary" className="cursor-pointer">
                            Trouver un établissement
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
