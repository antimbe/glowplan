"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, MessageSquare, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  client_name: string | null;
  is_visible: boolean;
  is_verified: boolean;
  created_at: string;
  client_profiles?: {
    first_name: string;
    last_name: string;
  } | null;
  appointments?: {
    services: {
      name: string;
    } | null;
  } | null;
}

interface ReviewsTabProps {
  establishmentId: string;
}

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default function ReviewsTab({ establishmentId }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadReviews();
  }, [establishmentId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, client_name, is_visible, is_verified, created_at,
          client_profiles(first_name, last_name),
          appointments(services(name))
        `)
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewsData = (data || []) as unknown as Review[];
      setReviews(reviewsData);

      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (reviewId: string, currentVisibility: boolean) => {
    setUpdating(reviewId);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_visible: !currentVisibility })
        .eq("id", reviewId);

      if (error) throw error;

      setReviews(prev =>
        prev.map(r => r.id === reviewId ? { ...r, is_visible: !currentVisibility } : r)
      );
    } catch (error) {
      console.error("Error updating review visibility:", error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getReviewerName = (review: Review) => {
    if (review.client_profiles) {
      return `${review.client_profiles.first_name} ${review.client_profiles.last_name?.charAt(0)}.`;
    }
    return review.client_name || "Client anonyme";
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Vos avis clients</h2>

        {reviews.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Average Rating */}
            <div className="text-center lg:text-left">
              <div className="text-5xl font-bold text-primary mb-2">{averageRating}</div>
              <div className="flex items-center justify-center lg:justify-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={cn(
                      star <= Math.round(averageRating || 0)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <p className="text-gray-500 text-sm">{reviews.length} avis au total</p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{rating} étoile{rating > 1 ? "s" : ""}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis pour le moment</h3>
            <p className="text-gray-500">Les avis de vos clients apparaîtront ici</p>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "bg-white rounded-2xl p-5 border",
                !review.is_visible ? "border-gray-200 bg-gray-50/50" : "border-gray-100"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {getReviewerName(review).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{getReviewerName(review)}</h3>
                        {review.is_verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vérifié</span>
                        )}
                        {!review.is_visible && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Masqué</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
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

                  {/* Service */}
                  {review.appointments?.services?.name && (
                    <p className="text-sm text-primary font-medium mb-2">
                      {review.appointments.services.name}
                    </p>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleVisibility(review.id, review.is_visible)}
                  disabled={updating === review.id}
                  className={cn(
                    "cursor-pointer",
                    !review.is_visible && "text-gray-400"
                  )}
                >
                  {updating === review.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : review.is_visible ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
