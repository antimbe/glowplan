"use client";

import { X, Star, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { Appointment } from "./types";

interface ReviewModalProps {
    appointment: Appointment;
    rating: number;
    setRating: (rating: number) => void;
    comment: string;
    setComment: (comment: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    submitting: boolean;
}

const RATING_LABELS = ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent !"];

export function ReviewModal({
    appointment,
    rating,
    setRating,
    comment,
    setComment,
    onClose,
    onSubmit,
    submitting
}: ReviewModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Top accent */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/60 to-transparent" />

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#c0a062]/10 border border-[#c0a062]/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={19} className="text-[#c0a062]" />
                        </div>
                        <div>
                            <h3 className="text-[17px] font-black text-gray-900 tracking-tight">Votre avis</h3>
                            <p className="text-gray-400 text-xs font-medium mt-0.5">
                                {appointment.establishments?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer flex-shrink-0"
                    >
                        <X size={15} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-6 pb-7 space-y-5">
                    {/* Service pill */}
                    <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                        <span className="text-xs font-bold text-gray-500">{appointment.services?.name}</span>
                    </div>

                    {/* Star rating */}
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Votre note</p>
                        <div className="flex justify-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="cursor-pointer transition-all duration-150 hover:scale-125 active:scale-110"
                                >
                                    <Star
                                        size={36}
                                        strokeWidth={1.5}
                                        className={cn(
                                            "transition-all duration-150",
                                            star <= rating
                                                ? "text-[#c0a062] fill-[#c0a062] drop-shadow-sm"
                                                : "text-gray-200"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm font-black text-[#c0a062] animate-in fade-in duration-150">
                                {RATING_LABELS[rating]}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Commentaire <span className="normal-case font-medium">(optionnel)</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Partagez votre expérience..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:border-[#32422c]/40 focus:ring-2 focus:ring-[#32422c]/15 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl font-bold cursor-pointer"
                        >
                            Annuler
                        </Button>
                        <button
                            onClick={onSubmit}
                            disabled={submitting || rating === 0}
                            className="flex-1 h-11 rounded-xl bg-[#32422c] hover:bg-[#3d5438] text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-[#32422c]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                "Publier l'avis"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
