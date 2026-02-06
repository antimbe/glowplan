"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Star, Search, Heart, Calendar, LogIn, UserPlus } from "lucide-react";
import { Card, CardContent, Badge, Button, Link, Heading, Text, Box, Flex, Stack, MotionBox } from "@/components/ui";
import Header from "@/components/features/Header";
import NextLink from "next/link";

interface Establishment {
  id: string;
  name: string;
  city: string;
  activity_sectors: string[];
  main_photo_url: string | null;
  description: string | null;
  min_price?: number;
  isFavorite?: boolean;
  average_rating?: number | null;
  review_count?: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";

  const [results, setResults] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const [locationQuery, setLocationQuery] = useState(location);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptEstablishmentId, setLoginPromptEstablishmentId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadClientProfile();
  }, []);

  useEffect(() => {
    searchEstablishments();
  }, [query, location]);

  const loadClientProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (clientProfile) {
      setClientProfileId(clientProfile.id);

      // Charger les favoris du client
      const { data: favoritesData } = await supabase
        .from("favorites")
        .select("establishment_id")
        .eq("client_id", clientProfile.id);

      if (favoritesData) {
        setFavorites(new Set(favoritesData.map(f => f.establishment_id)));
      }
    }
  };

  const handleToggleFavorite = async (establishmentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!clientProfileId) {
      setLoginPromptEstablishmentId(establishmentId);
      setShowLoginPrompt(true);
      return;
    }

    const isFav = favorites.has(establishmentId);

    try {
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("client_id", clientProfileId)
          .eq("establishment_id", establishmentId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(establishmentId);
          return newSet;
        });
      } else {
        await supabase.from("favorites").insert({
          client_id: clientProfileId,
          establishment_id: establishmentId,
        });
        setFavorites(prev => new Set(prev).add(establishmentId));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const searchEstablishments = async () => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from("establishments")
        .select(`
          id, 
          name, 
          city, 
          activity_sectors, 
          main_photo_url, 
          description,
          services(price),
          reviews(rating)
        `);

      // Build search conditions
      const allConditions: string[] = [];
      
      if (query) {
        allConditions.push(`name.ilike.%${query}%`);
        allConditions.push(`description.ilike.%${query}%`);
      }

      if (location) {
        allConditions.push(`city.ilike.%${location}%`);
        allConditions.push(`postal_code.ilike.%${location}%`);
      }

      // Apply filters only if there are conditions
      if (allConditions.length > 0) {
        queryBuilder = queryBuilder.or(allConditions.join(","));
      }

      const { data, error } = await queryBuilder.limit(20);

      console.log("Search query:", query, "location:", location);
      console.log("Search data:", data);
      console.log("Search error:", error);

      if (error) throw error;

      // Calculate min price and average rating for each establishment
      const resultsWithPrice = (data || []).map((est: any) => {
        const reviewCount = est.reviews?.length || 0;
        const avgRating = reviewCount > 0
          ? Math.round((est.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount) * 10) / 10
          : null;
        
        return {
          ...est,
          min_price: est.services?.length > 0 
            ? Math.min(...est.services.map((s: any) => s.price))
            : null,
          average_rating: avgRating,
          review_count: reviewCount,
          services: undefined,
          reviews: undefined,
        };
      });

      setResults(resultsWithPrice);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-100 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Desktop Search Bar */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-3 max-w-2xl mx-auto">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Prestation, établissement..."
              className="flex-1 bg-transparent outline-none min-w-0"
            />
            <div className="w-px h-6 bg-gray-300 flex-shrink-0" />
            <MapPin size={20} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ville"
              className="w-28 sm:w-40 bg-transparent outline-none"
            />
            <Button size="md" onClick={handleSearch} className="rounded-full cursor-pointer flex-shrink-0">
              Rechercher
            </Button>
          </div>

          {/* Mobile Search Bar */}
          <div className="sm:hidden space-y-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Prestation, établissement..."
                className="flex-1 bg-transparent outline-none min-w-0"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
              <MapPin size={20} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ville"
                className="flex-1 bg-transparent outline-none min-w-0"
              />
            </div>
            <Button size="md" onClick={handleSearch} fullWidth className="rounded-xl cursor-pointer">
              <Search size={18} className="mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Results count */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Résultats pour "${query}"` : "Tous les établissements"}
            {location && ` à ${location}`}
          </h1>
          <p className="text-gray-500 mt-1">
            {loading ? "Recherche en cours..." : `${results.length} établissement${results.length > 1 ? "s" : ""} trouvé${results.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((establishment) => (
              <EstablishmentCard 
                key={establishment.id} 
                establishment={establishment} 
                isFavorite={favorites.has(establishment.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat</h2>
            <p className="text-gray-500 mb-6">
              Essayez avec d'autres termes de recherche ou une autre localisation.
            </p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Retour à l'accueil
            </Button>
          </div>
        )}
      </div>

      {/* Modal de prompt de connexion pour les favoris */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Heart size={24} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ajouter aux favoris</h2>
                <p className="text-gray-500 text-sm">Connectez-vous pour sauvegarder vos établissements préférés</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Créez un compte ou connectez-vous pour ajouter cet établissement à vos favoris et retrouver facilement vos adresses préférées.
            </p>

            <div className="flex flex-col gap-2">
              <NextLink href={`/auth/client/login?redirect=/search${query ? `?q=${query}` : ""}${location ? `${query ? "&" : "?"}location=${location}` : ""}`}>
                <Button variant="primary" className="w-full cursor-pointer">
                  <LogIn size={18} className="mr-2" />
                  Se connecter
                </Button>
              </NextLink>
              <NextLink href={`/auth/client/login?redirect=/search${query ? `?q=${query}` : ""}${location ? `${query ? "&" : "?"}location=${location}` : ""}&signup=true`}>
                <Button variant="outline" className="w-full cursor-pointer">
                  <UserPlus size={18} className="mr-2" />
                  Créer un compte
                </Button>
              </NextLink>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-500 hover:text-gray-700 mt-2"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EstablishmentCardProps {
  establishment: Establishment;
  isFavorite: boolean;
  onToggleFavorite: (establishmentId: string, e: React.MouseEvent) => void;
}

function EstablishmentCard({ establishment, isFavorite, onToggleFavorite }: EstablishmentCardProps) {
  return (
    <Link href={`/establishment/${establishment.id}`} className="block cursor-pointer">
      <Card 
        variant="default" 
        padding="none" 
        hoverable 
        className="group overflow-hidden bg-white border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1px_rgba(50,66,44,0.1),0_20px_40px_-5px_rgba(50,66,44,0.15)] transition-all duration-500 cursor-pointer"
      >
        {/* Image Container with Hover Effect */}
        <Box className="relative h-56 overflow-hidden">
          <MotionBox
            className="absolute inset-0 bg-gray-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: establishment.main_photo_url ? `url(${establishment.main_photo_url})` : undefined,
            }}
          />
          {!establishment.main_photo_url && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Star size={40} className="text-primary/30" />
            </div>
          )}
          <Box className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Wishlist Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-sm h-10 w-10 min-w-0 z-10 cursor-pointer ${
              isFavorite 
                ? "bg-red-50 text-red-500 hover:bg-red-100" 
                : "bg-white/90 text-gray-900 hover:text-red-500 hover:bg-white"
            }`}
            onClick={(e) => onToggleFavorite(establishment.id, e)}
          >
            <Heart size={18} strokeWidth={2.5} className={isFavorite ? "fill-red-500" : ""} />
          </Button>

          {/* Quick Info Overlay - Services on hover */}
          {establishment.activity_sectors?.length > 0 && (
            <Box className="absolute bottom-4 left-4 right-4 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <Flex wrap="wrap" gap={2}>
                {establishment.activity_sectors.slice(0, 3).map((sector) => (
                  <Badge key={sector} variant="secondary" size="sm" className="bg-white/95 backdrop-blur-sm text-primary border-none shadow-md font-bold">
                    <Text variant="small" as="span" className="font-bold">{sector}</Text>
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}
        </Box>

        <CardContent className="p-5 space-y-4">
          <Stack space={2}>
            <Flex justify="between" align="start" gap={4}>
              <Heading level={3} variant="card" className="group-hover:text-primary transition-colors line-clamp-1 flex-1 text-base">
                {establishment.name}
              </Heading>
              {establishment.average_rating !== null && establishment.average_rating !== undefined ? (
                <Flex align="center" gap={1.5} className="bg-accent/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                  <Star size={14} className="text-accent fill-accent" />
                  <Text variant="small" as="span" className="font-extrabold text-accent leading-none">{establishment.average_rating}</Text>
                </Flex>
              ) : (
                <Flex align="center" gap={1.5} className="bg-gray-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                  <Star size={14} className="text-gray-400" />
                  <Text variant="small" as="span" className="font-medium text-gray-400 leading-none text-xs">Nouveau</Text>
                </Flex>
              )}
            </Flex>
            
            <Flex align="center" gap={1.5}>
              <MapPin size={16} className="text-primary/40" />
              <Text variant="small" as="span" className="text-gray-500 font-semibold">{establishment.city}</Text>
            </Flex>
          </Stack>

          <Flex align="center" justify="between" gap={4} className="pt-4 border-t border-gray-100">
            <Flex direction="col">
              <Text variant="muted" className="text-[10px] uppercase tracking-widest font-bold">À partir de</Text>
              <Text variant="default" as="span" className="font-extrabold text-primary text-xl">
                {establishment.min_price ? `${establishment.min_price}€` : "—"}
              </Text>
            </Flex>
            <Button 
              variant="primary" 
              size="md" 
              className="font-bold shadow-lg shadow-primary/20 group/btn cursor-pointer"
            >
              <Calendar size={18} className="group-hover/btn:scale-110 transition-transform" />
              <Text variant="small" as="span" className="font-bold">Réserver</Text>
            </Button>
          </Flex>
        </CardContent>
      </Card>
    </Link>
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
