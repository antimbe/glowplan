"use client";

import { Search, Heart, Star, MapPin, Calendar } from "lucide-react";
import { Box, Flex, Button } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { EstablishmentSearchResult } from "./types";

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface ResultsGridProps {
  results: EstablishmentSearchResult[];
  loading: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onShowLoginPrompt: (id: string) => void;
  hasProfile: boolean;
  onResetSearch: () => void;
}

/* ─────────────────────────────────────────────
   Skeleton card
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse shadow-sm">
      <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-7 bg-gray-100 rounded-lg w-12 flex-shrink-0" />
        </div>
        <div className="h-4 bg-gray-100 rounded-lg w-2/5" />
        <div className="h-px bg-gray-50 w-full mt-4" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-7 bg-gray-100 rounded-lg w-16" />
          <div className="h-10 bg-gray-200 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ResultsGrid
───────────────────────────────────────────── */
export function ResultsGrid({
  results,
  loading,
  favorites,
  onToggleFavorite,
  onShowLoginPrompt,
  hasProfile,
  onResetSearch,
}: ResultsGridProps) {
  /* Loading → skeleton */
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  /* Empty state */
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
        <div className="w-20 h-20 rounded-2xl bg-[#32422c]/5 border border-[#32422c]/10 flex items-center justify-center mb-6">
          <Search size={32} className="text-[#32422c]/30" />
        </div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">
          Aucun résultat
        </h2>
        <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs mb-8">
          Essayez avec d&apos;autres termes de recherche ou une autre ville pour
          trouver votre prestataire idéal.
        </p>
        <button
          onClick={onResetSearch}
          className="inline-flex items-center gap-2 bg-[#32422c] hover:bg-[#3d5438] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-[#32422c]/20"
        >
          Voir tous les établissements
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      {results.map((establishment) => (
        <EstablishmentCard
          key={establishment.id}
          establishment={establishment}
          isFavorite={favorites.has(establishment.id)}
          onToggleFavorite={(e) => {
            if (!hasProfile) {
              onShowLoginPrompt(establishment.id);
            } else {
              onToggleFavorite(establishment.id, e);
            }
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   EstablishmentCard
───────────────────────────────────────────── */
function EstablishmentCard({
  establishment,
  isFavorite,
  onToggleFavorite,
}: {
  establishment: EstablishmentSearchResult;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  return (
    <Link href={`/establishment/${establishment.id}`} className="block group">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(50,66,44,0.12)] hover:border-[#32422c]/15 transition-all duration-400 cursor-pointer h-full flex flex-col overflow-hidden">

        {/* ── Image ── */}
        <Box className="relative h-56 overflow-hidden flex-shrink-0 bg-gray-100">
          {establishment.main_photo_url ? (
            <Image
              src={establishment.main_photo_url}
              alt={establishment.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#32422c]/10 to-[#32422c]/5 flex items-center justify-center">
              <Star size={40} className="text-[#32422c]/20" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          {/* Favorite button */}
          <button
            className={[
              "absolute top-3.5 right-3.5 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-md z-10 cursor-pointer",
              isFavorite
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-white/90 text-gray-500 hover:text-red-500 hover:bg-white",
            ].join(" ")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              size={16}
              strokeWidth={2.5}
              className={isFavorite ? "fill-red-500" : ""}
            />
          </button>

          {/* Sector badges on hover */}
          {establishment.activity_sectors?.length > 0 && (
            <Box className="absolute bottom-3.5 left-3.5 right-3.5 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
              <Flex wrap="wrap" gap={1.5}>
                {establishment.activity_sectors.slice(0, 2).map((sector) => (
                  <span
                    key={sector}
                    className="bg-white/95 backdrop-blur-sm text-[#32422c] border-none shadow-md font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full"
                  >
                    {sector}
                  </span>
                ))}
              </Flex>
            </Box>
          )}
        </Box>

        {/* ── Content ── */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          {/* Name + Rating */}
          <Flex justify="between" align="start" gap={3}>
            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1 flex-1 group-hover:text-[#32422c] transition-colors duration-200">
              {establishment.name}
            </h3>

            {establishment.average_rating !== null ? (
              <Flex
                align="center"
                gap={1}
                className="bg-[#c0a062]/10 px-2.5 py-1 rounded-lg flex-shrink-0"
              >
                <Star size={13} className="text-[#c0a062] fill-[#c0a062]" />
                <span className="text-xs font-extrabold text-[#c0a062] leading-none">
                  {establishment.average_rating}
                </span>
              </Flex>
            ) : (
              <span className="bg-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex-shrink-0">
                Nouveau
              </span>
            )}
          </Flex>

          {/* City + reviews */}
          <Flex align="center" gap={1.5}>
            <MapPin size={14} className="text-[#32422c]/40 flex-shrink-0" />
            <span className="text-sm text-gray-500 font-medium">
              {establishment.city}
              {establishment.review_count > 0 && (
                <span className="text-gray-400 font-normal ml-1.5">
                  · {establishment.review_count} avis
                </span>
              )}
            </span>
          </Flex>

          {/* Price + CTA */}
          <Flex
            align="center"
            justify="between"
            gap={4}
            className="mt-auto pt-4 border-t border-gray-50"
          >
            <div>
              <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-0.5">
                À partir de
              </p>
              <p className="font-black text-[#32422c] text-xl leading-none">
                {establishment.min_price ? `${establishment.min_price}€` : "N/A"}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="rounded-xl font-bold gap-2 px-5 group-hover:scale-[1.03]"
            >
              <Calendar size={15} />
              Réserver
            </Button>
          </Flex>
        </div>
      </div>
    </Link>
  );
}
