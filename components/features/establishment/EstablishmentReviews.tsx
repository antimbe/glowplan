"use client";

import { useState } from "react";
import { Star, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  client_name: string | null;
  created_at: string;
  provider_reply: string | null;
  replied_at: string | null;
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

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function renderStars(rating: number, size = 14) {
  return [1, 2, 3, 4, 5].map((pos) => (
    <Star
      key={pos}
      size={size}
      className={pos <= Math.round(rating) ? "text-[#c0a062] fill-[#c0a062]" : "text-gray-200 fill-gray-200"}
    />
  ));
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

function getAvatarColor(name: string | null): string {
  const colors = [
    "bg-[#32422c]/10 text-[#32422c]",
    "bg-[#c0a062]/15 text-[#8a6e3e]",
    "bg-blue-50 text-blue-600",
    "bg-purple-50 text-purple-600",
    "bg-rose-50 text-rose-600",
  ];
  if (!name) return colors[0];
  const i = name.charCodeAt(0) % colors.length;
  return colors[i];
}

export function EstablishmentReviews({ reviews, averageRating, onAddReview }: EstablishmentReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 4;
  const displayedReviews = showAll ? reviews : reviews.slice(0, INITIAL_COUNT);

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Avis clients</h2>
        {onAddReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddReview}
            className="cursor-pointer border-[#32422c]/15 text-[#32422c] hover:border-[#c0a062]/30 hover:text-[#c0a062] hover:bg-[#c0a062]/5 rounded-xl font-bold"
          >
            <MessageSquare size={14} className="mr-1.5" />
            Donner mon avis
          </Button>
        )}
      </div>

      {reviews.length > 0 ? (
        <>
          {/* Summary */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-8 p-5 bg-[#f7f5f2] rounded-2xl">
            {/* Big score */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-5xl font-black text-gray-900 leading-none">{averageRating?.toFixed(1)}</span>
              <div className="flex gap-0.5 mt-2 mb-1">{renderStars(averageRating || 0, 16)}</div>
              <span className="text-[12px] text-gray-400 font-medium">{reviews.length} avis</span>
            </div>

            {/* Rating bars */}
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-gray-500 w-4 shrink-0">{star}</span>
                  <Star size={11} className="text-[#c0a062] fill-[#c0a062] shrink-0" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#c0a062] rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.1 * (5 - star), ease }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 w-6 text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {displayedReviews.map((review, i) => {
                const name = review.client_profiles
                  ? `${review.client_profiles.first_name} ${review.client_profiles.last_name?.charAt(0) || ""}.`
                  : review.client_name || "Client";
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06, ease }}
                    className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-[13px]",
                      getAvatarColor(name)
                    )}>
                      {getInitials(name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div>
                          <span className="text-[13px] font-bold text-gray-900">{name}</span>
                          <div className="flex gap-0.5 mt-0.5">{renderStars(review.rating, 11)}</div>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium shrink-0">
                          {new Date(review.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                          "{review.comment}"
                        </p>
                      )}
                      {review.provider_reply && (
                        <div className="mt-3 bg-[#32422c]/[0.04] border-l-2 border-[#32422c]/30 rounded-r-xl pl-4 pr-3 py-3">
                          <p className="text-[11px] font-black text-[#32422c]/60 uppercase tracking-[0.12em] mb-1">Réponse de l'établissement</p>
                          <p className="text-[12px] text-gray-600 leading-relaxed">{review.provider_reply}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Show more */}
          {reviews.length > INITIAL_COUNT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-gray-100 hover:border-[#32422c]/20 hover:bg-[#32422c]/[0.03] text-[13px] font-bold text-gray-500 hover:text-[#32422c] transition-all duration-200 cursor-pointer"
            >
              {showAll ? "Voir moins" : `Voir les ${reviews.length - INITIAL_COUNT} avis suivants`}
              <ChevronDown size={14} className={cn("transition-transform duration-200", showAll && "rotate-180")} />
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-10 bg-[#f7f5f2] rounded-2xl">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <MessageSquare size={20} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Aucun avis pour le moment</p>
          {onAddReview && (
            <button
              onClick={onAddReview}
              className="mt-3 text-[13px] font-bold text-[#32422c] hover:text-[#c0a062] transition-colors cursor-pointer"
            >
              Soyez le premier à laisser un avis →
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
