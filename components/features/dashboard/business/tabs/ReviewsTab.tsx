"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, MessageSquare, Loader2, Eye, EyeOff, Heart } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { MONTHS_LOWER } from "@/lib/utils/formatters";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  client_name: string | null;
  is_visible: boolean;
  is_verified: boolean;
  created_at: string;
  provider_reply: string | null;
  replied_at: string | null;
  appointments?: {
    services: {
      name: string;
    } | null;
  } | null;
}

interface ReviewsTabProps {
  establishmentId: string;
}


export default function ReviewsTab({ establishmentId }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  
  // States for replying
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadReviews();
    loadFavoritesCount();
  }, [establishmentId]);

  const loadReviews = async () => {
    if (!establishmentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, client_name, is_visible, is_verified, created_at,
          provider_reply, replied_at,
          appointments(services(name))
        `)
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error details:", error.message, error.code, error.details);
        throw error;
      }

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

  const loadFavoritesCount = async () => {
    if (!establishmentId) return;

    try {
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: "exact" })
        .eq("establishment_id", establishmentId);

      if (error) throw error;
      setFavoritesCount(count || 0);
    } catch (error) {
      console.error("Error loading favorites count:", error);
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

  const handleOpenReply = (reviewId: string, currentReply: string | null) => {
    setReplyingTo(reviewId);
    setReplyText(currentReply || "");
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    setSubmittingReply(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({
          provider_reply: replyText.trim(),
          replied_at: new Date().toISOString()
        })
        .eq("id", reviewId);

      if (error) throw error;

      // Trigger email notification to client without blocking UI
      fetch("/api/reviews/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new_reply", reviewId })
      }).catch(err => console.error("Could not send reply notification", err));

      setReviews(prev =>
        prev.map(r => r.id === reviewId ? {
          ...r,
          provider_reply: replyText.trim(),
          replied_at: new Date().toISOString()
        } : r)
      );
      setReplyingTo(null);
    } catch (err) {
      console.error("Error submitting reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS_LOWER[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getReviewerName = (review: Review) => {
    return review.client_name || "Client anonyme";
  };

  // Regrouper les notes par plages (ex: 4.5-5 = "5 étoiles", 3.5-4 = "4 étoiles", etc.)
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    // Compter les avis dans la plage [rating-0.5, rating]
    const count = reviews.filter(r => r.rating > rating - 1 && r.rating <= rating).length;
    return {
      rating,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Favorites Counter */}
      <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-5 border border-pink-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
            <Heart size={24} className="text-white fill-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Ajouté en favoris par</p>
            <p className="text-2xl font-bold text-gray-900">{favoritesCount} client{favoritesCount > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Header with Stats */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Vos avis clients</h2>

        {reviews.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Average Rating */}
            <div className="text-center lg:text-left">
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">{averageRating}</div>
              <div className="flex items-center justify-center lg:justify-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const avg = Number(averageRating) || 0;
                  const isFullStar = star <= Math.floor(avg);
                  const isHalfStar = !isFullStar && star === Math.ceil(avg) && avg % 1 !== 0;

                  return (
                    <div key={star} className="relative w-5 h-5">
                      <Star size={20} className="absolute text-gray-300" />
                      {isFullStar && (
                        <Star size={20} className="absolute text-accent fill-accent" />
                      )}
                      {isHalfStar && (
                        <div className="absolute overflow-hidden w-2.5">
                          <Star size={20} className="text-accent fill-accent" />
                        </div>
                      )}
                    </div>
                  );
                })}
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
                      className="h-full bg-accent rounded-full transition-all"
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
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-none">{getReviewerName(review)}</h3>
                        {review.is_verified && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">Vérifié</span>
                        )}
                        {!review.is_visible && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">Masqué</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const rating = Number(review.rating);
                      const isFullStar = star <= Math.floor(rating);
                      const isHalfStar = !isFullStar && star === Math.ceil(rating) && rating % 1 !== 0;

                      return (
                        <div key={star} className="relative">
                          <Star size={16} className="text-gray-300" />
                          {isFullStar && (
                            <Star size={16} className="absolute inset-0 text-accent fill-accent" />
                          )}
                          {isHalfStar && (
                            <div className="absolute inset-0 overflow-hidden w-[50%]">
                              <Star size={16} className="text-accent fill-accent" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Service */}
                  {review.appointments?.services?.name && (
                    <p className="text-sm text-primary font-medium mb-2">
                      {review.appointments.services.name}
                    </p>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-600 mb-3">{review.comment}</p>
                  )}

                  {/* Provider Reply Display */}
                  {review.provider_reply && replyingTo !== review.id && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Votre réponse</span>
                            {review.replied_at && (
                                <span className="text-xs text-gray-400">{formatDate(review.replied_at)}</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-700">{review.provider_reply}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-primary/20 animate-in fade-in zoom-in-95 duration-200">
                          <label className="text-xs font-bold text-gray-900 mb-2 block">Répondre à cet avis</label>
                          <textarea
                              className="w-full text-sm rounded-xl border-gray-200 shadow-inner resize-none focus:ring-primary focus:border-primary p-3 bg-white"
                              rows={3}
                              placeholder="Merci pour votre retour..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              disabled={submittingReply}
                          />
                          <div className="flex gap-2 justify-end mt-3">
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReplyingTo(null)}
                                  disabled={submittingReply}
                              >
                                  Annuler
                              </Button>
                              <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleSubmitReply(review.id)}
                                  // @ts-ignore : TS can't infer submittingReply prop well for our UI button if not typed explicitly
                                  disabled={submittingReply || !replyText.trim()}
                              >
                                  {submittingReply ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                  Publier
                              </Button>
                          </div>
                      </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVisibility(review.id, review.is_visible)}
                    disabled={updating === review.id}
                    className={cn(
                        "cursor-pointer w-10 sm:w-auto h-10 px-0 sm:px-3 text-gray-500",
                        !review.is_visible && "bg-gray-100 text-gray-400 border-gray-200"
                    )}
                    >
                    {updating === review.id ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : review.is_visible ? (
                        <><Eye size={16} /><span className="hidden sm:inline ml-2">Visible</span></>
                    ) : (
                        <><EyeOff size={16} /><span className="hidden sm:inline ml-2">Masqué</span></>
                    )}
                    </Button>

                    <Button
                       variant="outline"
                       size="sm"
                       className={cn("w-10 sm:w-auto h-10 px-0 sm:px-3", replyingTo === review.id && "bg-primary/5 text-primary border-primary/20")}
                       onClick={() => handleOpenReply(review.id, review.provider_reply)}
                       disabled={replyingTo === review.id}
                    >
                        <MessageSquare size={16} />
                        <span className="hidden sm:inline ml-2">{review.provider_reply ? "Modifier la réponse" : "Répondre"}</span>
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
