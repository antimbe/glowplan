"use client";

import { Star, MapPin, Trash2, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { motion } from "framer-motion";
import { Review } from "./types";

interface ReviewsTabProps {
    reviews: Review[];
    onDelete: (id: string) => void;
    deletingId: string | null;
    formatDate: (date: string) => string;
}

const RATING_LABELS = ["", "Décevant", "Passable", "Bien", "Très bien", "Excellent"];

export function ReviewsTab({ reviews, onDelete, deletingId, formatDate }: ReviewsTabProps) {
    if (reviews.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-16 text-center"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#c0a062]/10 to-amber-50 flex items-center justify-center mb-5 shadow-inner">
                    <Star size={36} className="text-[#c0a062]/40" />
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-2">Aucun avis</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">Après votre visite, partagez votre expérience pour aider la communauté</p>
                <Link href="/search">
                    <button className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">
                        <Sparkles size={15} />
                        Trouver un établissement
                    </button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review, i) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[#c0a062]/20 transition-all duration-300"
                >
                    {/* Header: establishment + rating */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                            <Link href={`/establishment/${review.establishment_id}`}>
                                <h3 className="font-bold text-gray-900 hover:text-primary transition-colors cursor-pointer truncate text-base">
                                    {review.establishments?.name}
                                </h3>
                            </Link>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5 font-medium">
                                <MapPin size={11} className="text-[#c0a062]/60 flex-shrink-0" />
                                <span>{review.establishments?.city}</span>
                            </div>
                        </div>

                        {/* Stars + label */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={15}
                                        className={cn(
                                            "transition-colors",
                                            star <= review.rating
                                                ? "text-[#c0a062] fill-[#c0a062]"
                                                : "text-gray-200 fill-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-[#c0a062] uppercase tracking-wide">
                                {RATING_LABELS[review.rating]}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                        <div className="relative bg-gray-50/80 rounded-xl px-4 py-3 mb-3">
                            <div className="absolute top-2 left-3 text-3xl text-[#c0a062]/20 font-serif leading-none select-none">"</div>
                            <p className="text-gray-600 text-sm leading-relaxed pl-4">{review.comment}</p>
                        </div>
                    )}

                    {/* Provider reply */}
                    {review.provider_reply && (
                        <div className="flex gap-3 mb-3 pl-2">
                            {/* Vertical connector */}
                            <div className="flex flex-col items-center gap-0 flex-shrink-0">
                                <div className="w-px h-3 bg-[#32422c]/20" />
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#32422c] to-[#4a5e3a] flex items-center justify-center shadow-sm flex-shrink-0">
                                    <MessageSquare size={13} className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 bg-gradient-to-br from-[#f4f6f2] to-[#eef2eb] border border-[#32422c]/10 rounded-xl px-4 py-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-black text-[#32422c] uppercase tracking-widest">
                                        Réponse de l'établissement
                                    </span>
                                    {review.replied_at && (
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {formatDate(review.replied_at)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-[#32422c]/80 leading-relaxed">{review.provider_reply}</p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <p className="text-gray-300 text-xs font-medium">
                            {formatDate(review.created_at)}
                        </p>
                        <button
                            onClick={() => onDelete(review.id)}
                            disabled={deletingId === review.id}
                            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40 font-bold"
                        >
                            {deletingId === review.id ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <Trash2 size={13} />
                            )}
                            Supprimer
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
