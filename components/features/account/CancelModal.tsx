"use client";

import { Calendar, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Appointment } from "./types";

interface CancelModalProps {
    appointment: Appointment;
    reason: string;
    setReason: (reason: string) => void;
    onClose: () => void;
    onConfirm: () => void;
    cancelling: boolean;
    formatDate: (date: string) => string;
    formatTime: (date: string) => string;
}

export function CancelModal({
    appointment,
    reason,
    setReason,
    onClose,
    onConfirm,
    cancelling,
    formatDate,
    formatTime
}: CancelModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Annuler la réservation</h3>
                <p className="text-gray-600 mb-4">
                    Êtes-vous sûr de vouloir annuler votre rendez-vous chez <strong>{appointment.establishments?.name}</strong> ?
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar size={14} />
                        <span>{formatDate(appointment.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{formatTime(appointment.start_time)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{appointment.services?.name}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motif de l&apos;annulation <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Indiquez la raison de votre annulation..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        rows={3}
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Retour
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={cancelling}
                        className="flex-1"
                    >
                        {cancelling ? (
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
    );
}
