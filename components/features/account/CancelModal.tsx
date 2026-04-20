"use client";

import { X, Calendar, Clock, AlertTriangle, Loader2 } from "lucide-react";
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-7 pb-5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={20} className="text-red-500" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-[17px] font-black text-gray-900 tracking-tight">Annuler la réservation</h3>
                            <p className="text-gray-400 text-xs font-medium mt-0.5">Cette action est irréversible</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer flex-shrink-0 mt-0.5"
                    >
                        <X size={15} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                    {/* Confirmation text */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Êtes-vous sûr de vouloir annuler votre rendez-vous chez{" "}
                        <span className="font-bold text-gray-900">{appointment.establishments?.name}</span> ?
                    </p>

                    {/* Appointment details card */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <Calendar size={13} className="text-[#32422c]" />
                            </div>
                            <span className="font-semibold">{formatDate(appointment.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <Clock size={13} className="text-[#32422c]" />
                            </div>
                            <span className="font-semibold">{formatTime(appointment.start_time)}</span>
                        </div>
                        <div className="pt-1 border-t border-gray-100">
                            <p className="text-sm font-black text-gray-900">{appointment.services?.name}</p>
                        </div>
                    </div>

                    {/* Reason textarea */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Motif <span className="normal-case font-medium text-gray-400">(optionnel)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Indiquez la raison de votre annulation..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#32422c]/20 focus:border-[#32422c]/40 transition-all resize-none placeholder:text-gray-300 text-gray-700"
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl font-bold"
                        >
                            Retour
                        </Button>
                        <button
                            onClick={onConfirm}
                            disabled={cancelling}
                            className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {cancelling ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Annulation...
                                </>
                            ) : (
                                "Confirmer l'annulation"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
