"use client";

import { Star, Loader2 } from "lucide-react";
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Laisser un avis</h2>
                <p className="text-gray-500 text-sm mb-6">
                    {appointment.establishments?.name} - {appointment.services?.name}
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="cursor-pointer transition-transform hover:scale-110"
                            >
                                <Star
                                    size={32}
                                    className={cn(
                                        star <= rating
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre commentaire (optionnel)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Partagez votre expérience..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 cursor-pointer"
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="flex-1 cursor-pointer"
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                Envoi...
                            </span>
                        ) : (
                            "Publier l'avis"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
