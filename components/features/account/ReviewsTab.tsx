import { Star, MapPin, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { Review } from "./types";

interface ReviewsTabProps {
    reviews: Review[];
    onDelete: (id: string) => void;
    deletingId: string | null;
    formatDate: (date: string) => string;
}

export function ReviewsTab({ reviews, onDelete, deletingId, formatDate }: ReviewsTabProps) {
    return (
        <div>
            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <Link href={`/establishment/${review.establishment_id}`}>
                                        <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer">
                                            {review.establishments?.name}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                        <MapPin size={14} />
                                        <span>{review.establishments?.city}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={cn(
                                                star <= review.rating
                                                    ? "text-yellow-500 fill-yellow-500"
                                                    : "text-gray-300"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-gray-400 text-xs">
                                    Publié le {formatDate(review.created_at)}
                                </p>
                                <button
                                    onClick={() => onDelete(review.id)}
                                    disabled={deletingId === review.id}
                                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {deletingId === review.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Star size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis</h3>
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore laissé d'avis</p>
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
