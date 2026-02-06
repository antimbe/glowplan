"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Favorite {
  id: string;
  establishment_id: string;
  establishments: {
    id: string;
    name: string;
    city: string;
    main_photo_url: string | null;
    activity_sectors: string[];
  } | null;
}

interface UseFavoritesReturn {
  favorites: Favorite[];
  loading: boolean;
  isFavorite: (establishmentId: string) => boolean;
  toggleFavorite: (establishmentId: string) => Promise<boolean>;
  loadFavorites: () => Promise<void>;
}

/**
 * Hook pour gérer les favoris d'un utilisateur
 */
export function useFavorites(userId: string | null): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from("favorites")
        .select(`
          id,
          establishment_id,
          establishments (
            id,
            name,
            city,
            main_photo_url,
            activity_sectors
          )
        `)
        .eq("user_id", userId);

      setFavorites((data || []) as unknown as Favorite[]);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  const isFavorite = useCallback((establishmentId: string): boolean => {
    return favorites.some(f => f.establishment_id === establishmentId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (establishmentId: string): Promise<boolean> => {
    if (!userId) return false;

    const existing = favorites.find(f => f.establishment_id === establishmentId);

    if (existing) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (!error) {
        setFavorites(prev => prev.filter(f => f.id !== existing.id));
        return false;
      }
    } else {
      const { data, error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, establishment_id: establishmentId })
        .select(`
          id,
          establishment_id,
          establishments (
            id,
            name,
            city,
            main_photo_url,
            activity_sectors
          )
        `)
        .single();

      if (!error && data) {
        setFavorites(prev => [...prev, data as unknown as Favorite]);
        return true;
      }
    }

    return isFavorite(establishmentId);
  }, [userId, favorites, supabase, isFavorite]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    loadFavorites,
  };
}
