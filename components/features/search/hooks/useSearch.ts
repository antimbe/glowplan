"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { EstablishmentSearchResult } from "../types";

export function useSearch(query: string, location: string) {
    const [results, setResults] = useState<EstablishmentSearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [clientProfileId, setClientProfileId] = useState<string | null>(null);

    const lastRequestId = useRef(0);
    const supabase = createClient();

    const loadClientProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (clientProfile) {
            setClientProfileId(clientProfile.id);

            const { data: favoritesData } = await supabase
                .from("favorites")
                .select("establishment_id")
                .eq("client_id", clientProfile.id);

            if (favoritesData) {
                setFavorites(new Set(favoritesData.map(f => f.establishment_id)));
            }
        }
    }, [supabase]);

    const searchEstablishments = useCallback(async () => {
        setLoading(true);
        const requestId = ++lastRequestId.current;

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

            const allConditions: string[] = [];
            if (query) {
                allConditions.push(`name.ilike.%${query}%`);
                allConditions.push(`description.ilike.%${query}%`);
            }
            if (location) {
                allConditions.push(`city.ilike.%${location}%`);
                allConditions.push(`postal_code.ilike.%${location}%`);
            }

            if (allConditions.length > 0) {
                queryBuilder = queryBuilder.or(allConditions.join(","));
            }

            const { data, error } = await queryBuilder.limit(20);

            if (requestId !== lastRequestId.current) return;
            if (error) throw error;

            const formatted = (data || []).map((est: any) => {
                const reviewCount = est.reviews?.length || 0;
                const avgRating = reviewCount > 0
                    ? Math.round((est.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount) * 10) / 10
                    : null;

                return {
                    id: est.id,
                    name: est.name,
                    city: est.city,
                    activity_sectors: est.activity_sectors || [],
                    main_photo_url: est.main_photo_url,
                    description: est.description,
                    min_price: est.services?.length > 0
                        ? Math.min(...est.services.map((s: any) => s.price))
                        : null,
                    average_rating: avgRating,
                    review_count: reviewCount,
                };
            });

            setResults(formatted);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            if (requestId === lastRequestId.current) {
                setLoading(false);
            }
        }
    }, [query, location, supabase]);

    const toggleFavorite = async (establishmentId: string) => {
        if (!clientProfileId) return false;

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
            return true;
        } catch (error) {
            console.error("Error toggling favorite:", error);
            return false;
        }
    };

    useEffect(() => {
        loadClientProfile();
    }, [loadClientProfile]);

    useEffect(() => {
        searchEstablishments();
    }, [searchEstablishments]);

    return {
        results,
        loading,
        favorites,
        toggleFavorite,
        clientProfileId,
    };
}
