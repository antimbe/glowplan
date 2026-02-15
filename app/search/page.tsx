"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui";
import Header from "@/components/features/Header";
import NextLink from "next/link";
import { useSearch } from "@/components/features/search/hooks/useSearch";
import { SearchBar } from "@/components/features/search/SearchBar";
import { ResultsGrid } from "@/components/features/search/ResultsGrid";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [locationQuery, setLocationQuery] = useState(location);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { results, loading, favorites, toggleFavorite, clientProfileId } = useSearch(query, location);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    router.push(`/search?${params.toString()}`);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setLocationQuery("");
    router.push("/search");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        locationQuery={locationQuery}
        setLocationQuery={setLocationQuery}
        onSearch={handleSearch}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {query ? `Résultats pour "${query}"` : "Nos établissements"}
            {location && <span className="text-primary"> à {location}</span>}
          </h1>
          {!loading && (
            <p className="text-gray-500 font-medium mt-1">
              {results.length} établissement{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <ResultsGrid
          results={results}
          loading={loading}
          favorites={favorites}
          onToggleFavorite={(id) => toggleFavorite(id)}
          onShowLoginPrompt={() => setShowLoginPrompt(true)}
          hasProfile={!!clientProfileId}
          onResetSearch={handleResetSearch}
        />
      </div>

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shadow-inner">
                <Heart size={28} className="text-red-500 fill-red-500/10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ajouter aux favoris</h2>
                <p className="text-gray-500 text-sm font-medium">Ne perdez plus vos bonnes adresses</p>
              </div>
            </div>

            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Connectez-vous pour sauvegarder cet établissement et le retrouver instantanément dans votre espace membre.
            </p>

            <div className="flex flex-col gap-3">
              <NextLink href={`/auth/client/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                <Button variant="primary" className="w-full cursor-pointer h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                  <LogIn size={20} className="mr-2" />
                  Se connecter
                </Button>
              </NextLink>
              <NextLink href={`/auth/client/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&signup=true`}>
                <Button variant="outline" className="w-full cursor-pointer h-12 text-base font-bold rounded-xl border-2">
                  <UserPlus size={20} className="mr-2" />
                  Créer un compte
                </Button>
              </NextLink>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-gray-600 mt-2 font-bold"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
