"use client";

import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    client_name: string | null;
    created_at: string;
    client_profiles?: {
        first_name: string;
        last_name: string;
    } | null;
}

interface EstablishmentReviewsProps {
    reviews: Review[];
    averageRating: number | null;
    onAddReview?: () => void;
}

export function EstablishmentReviews({
    reviews,
    averageRating,
    onAddReview
}: EstablishmentReviewsProps) {
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-gray-900">Avis clients</h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {averageRating !== null && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className={cn(
                                            star <= Math.round(averageRating)
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-gray-300"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="font-bold text-gray-900">{averageRating}</span>
                            <span className="text-gray-500 text-sm">({reviews.length} avis)</span>
                        </div>
                    )}
                    {onAddReview && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddReview}
                            className="cursor-pointer"
                        >
                            <MessageSquare size={16} className="mr-1" />
                            <span>Donner mon avis</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={12}
                                                className={cn(
                                                    star <= review.rating
                                                        ? "text-yellow-500 fill-yellow-500"
                                                        : "text-gray-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="font-semibold text-gray-900 text-sm">
                                        {review.client_profiles
                                            ? `${review.client_profiles.first_name} ${review.client_profiles.last_name}`
                                            : review.client_name || "Client anonyme"}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(review.created_at).toLocaleDateString("fr-FR")}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <MessageSquare size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Aucun avis pour le moment</p>
                    </div>
                )}
                {reviews.length > 5 && (
                    <p className="text-center text-xs text-gray-400 pt-2">
                        Affichage des 5 derniers avis sur {reviews.length}
                    </p>
                )}
            </div>
        </div>
    );
}
