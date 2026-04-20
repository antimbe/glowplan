"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, LogIn, UserPlus, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui";
import Header from "@/components/features/Header";
import NextLink from "next/link";
import { useSearch } from "@/components/features/search/hooks/useSearch";
import { SearchBar } from "@/components/features/search/SearchBar";
import { ResultsGrid } from "@/components/features/search/ResultsGrid";
import { ACTIVITY_SECTORS } from "@/lib/constants/sectors";
import { EstablishmentSearchResult } from "@/components/features/search/types";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type SortOption = "relevance" | "rating" | "price_asc" | "price_desc";

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Pertinence",
  rating: "Meilleure note",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
};

/* ─────────────────────────────────────────────
   Sort helper
───────────────────────────────────────────── */
function sortResults(
  results: EstablishmentSearchResult[],
  sortBy: SortOption
): EstablishmentSearchResult[] {
  if (sortBy === "relevance") return results;
  const copy = [...results];
  if (sortBy === "rating")
    return copy.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
  if (sortBy === "price_asc")
    return copy.sort((a, b) => (a.min_price ?? Infinity) - (b.min_price ?? Infinity));
  if (sortBy === "price_desc")
    return copy.sort((a, b) => (b.min_price ?? 0) - (a.min_price ?? 0));
  return copy;
}

/* ─────────────────────────────────────────────
   Main content
───────────────────────────────────────────── */
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const sector = searchParams.get("sector") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [locationQuery, setLocationQuery] = useState(location);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const activeSectorLabel = sector
    ? ACTIVITY_SECTORS.find((s) => s.id === sector)?.label ?? sector
    : null;

  const { results, loading, favorites, toggleFavorite, clientProfileId } =
    useSearch(query, location, sector);

  const sortedResults = useMemo(
    () => sortResults(results, sortBy),
    [results, sortBy]
  );

  /* ── Handlers ── */
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    if (sector) params.set("sector", sector);
    router.push(`/search?${params.toString()}`);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setLocationQuery("");
    router.push("/search");
  };

  const handleSetSector = (sectorId: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (sectorId) params.set("sector", sectorId);
    router.push(`/search?${params.toString()}`);
  };

  /* ── Title ── */
  const pageTitle = query
    ? `Résultats pour « ${query} »`
    : activeSectorLabel
    ? activeSectorLabel
    : "Tous les établissements";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── SearchBar + category chips ── */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        locationQuery={locationQuery}
        setLocationQuery={setLocationQuery}
        onSearch={handleSearch}
        activeSector={sector}
        onSectorClick={handleSetSector}
      />

      {/* ── Results area ── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Results header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          {/* Left: title + count + active filter */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {pageTitle}
              {location && (
                <span className="text-[#32422c]"> à {location}</span>
              )}
            </h1>

            {!loading && (
              <p className="text-gray-400 font-medium text-sm mt-1">
                {results.length} établissement{results.length > 1 ? "s" : ""}{" "}
                trouvé{results.length > 1 ? "s" : ""}
              </p>
            )}

            {/* Active sector tag */}
            {activeSectorLabel && (
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 bg-[#32422c] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {activeSectorLabel}
                  <button
                    onClick={() => handleSetSector("")}
                    className="ml-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Supprimer le filtre"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Right: Sort */}
          {!loading && results.length > 1 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal size={15} className="text-gray-400" />
              <span className="text-sm text-gray-500 font-medium hidden sm:inline">
                Trier :
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#32422c]/20 focus:border-[#32422c]/30 hover:border-gray-300 transition-colors shadow-sm"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <ResultsGrid
          results={sortedResults}
          loading={loading}
          favorites={favorites}
          onToggleFavorite={(id) => toggleFavorite(id)}
          onShowLoginPrompt={() => setShowLoginPrompt(true)}
          hasProfile={!!clientProfileId}
          onResetSearch={handleResetSearch}
        />
      </div>

      {/* ── Login prompt modal ── */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">

            {/* Close */}
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X size={14} className="text-gray-500" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shadow-inner flex-shrink-0">
                <Heart size={26} className="text-red-500 fill-red-500/20" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Ajouter aux favoris
                </h2>
                <p className="text-gray-400 text-sm font-medium">
                  Ne perdez plus vos bonnes adresses
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-7">
              Connectez-vous pour sauvegarder cet établissement et le retrouver
              instantanément dans votre espace membre.
            </p>

            <div className="flex flex-col gap-2.5">
              <NextLink
                href={`/auth/client/login?redirect=${encodeURIComponent(
                  window.location.pathname + window.location.search
                )}`}
              >
                <Button
                  variant="primary"
                  className="w-full cursor-pointer h-12 text-sm font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  <LogIn size={18} className="mr-2" />
                  Se connecter
                </Button>
              </NextLink>
              <NextLink
                href={`/auth/client/login?redirect=${encodeURIComponent(
                  window.location.pathname + window.location.search
                )}&signup=true`}
              >
                <Button
                  variant="outline"
                  className="w-full cursor-pointer h-12 text-sm font-bold rounded-xl border-2"
                >
                  <UserPlus size={18} className="mr-2" />
                  Créer un compte
                </Button>
              </NextLink>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold mt-1 py-2 transition-colors cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Export (Suspense boundary for useSearchParams)
───────────────────────────────────────────── */
export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#32422c] border-t-transparent animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </>
  );
}
