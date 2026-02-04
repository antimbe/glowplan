"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Star, Search, Heart, Calendar } from "lucide-react";
import { Card, CardContent, Badge, Button, Link, Heading, Text, Box, Flex, Stack, MotionBox } from "@/components/ui";
import Header from "@/components/features/Header";

interface Establishment {
  id: string;
  name: string;
  city: string;
  activity_sectors: string[];
  main_photo_url: string | null;
  description: string | null;
  min_price?: number;
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

  const supabase = createClient();

  useEffect(() => {
    searchEstablishments();
  }, [query, location]);

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
          services(price)
        `)
        .eq("is_profile_complete", true);

      // Build search conditions
      const conditions: string[] = [];
      
      if (query) {
        conditions.push(`name.ilike.%${query}%`);
        conditions.push(`activity_sectors.cs.{${query}}`);
        conditions.push(`description.ilike.%${query}%`);
      }

      if (location) {
        queryBuilder = queryBuilder.or(`city.ilike.%${location}%,postal_code.ilike.%${location}%`);
      }

      if (conditions.length > 0) {
        queryBuilder = queryBuilder.or(conditions.join(","));
      }

      const { data, error } = await queryBuilder.limit(20);

      if (error) throw error;

      // Calculate min price for each establishment
      const resultsWithPrice = (data || []).map((est: any) => ({
        ...est,
        min_price: est.services?.length > 0 
          ? Math.min(...est.services.map((s: any) => s.price))
          : null,
        services: undefined,
      }));

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
      <div className="bg-white border-b border-gray-100 pt-24">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-3 max-w-2xl mx-auto">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Prestation, établissement..."
              className="flex-1 bg-transparent outline-none"
            />
            <div className="w-px h-6 bg-gray-300" />
            <MapPin size={20} className="text-gray-400" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ville"
              className="w-28 sm:w-40 bg-transparent outline-none"
            />
            <Button size="md" onClick={handleSearch} className="rounded-full cursor-pointer">
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
              <EstablishmentCard key={establishment.id} establishment={establishment} />
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
    </div>
  );
}

function EstablishmentCard({ establishment }: { establishment: Establishment }) {
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
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-md text-gray-900 hover:text-red-500 hover:bg-white transition-all shadow-sm h-10 w-10 min-w-0 z-10 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart size={18} strokeWidth={2.5} />
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
              <Flex align="center" gap={1.5} className="bg-accent/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                <Star size={14} className="text-accent fill-accent" />
                <Text variant="small" as="span" className="font-extrabold text-accent leading-none">4.8</Text>
              </Flex>
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
