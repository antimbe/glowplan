"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useEstablishmentActions(establishmentId: string) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [clientProfileId, setClientProfileId] = useState<string | null>(null);

    const supabase = createClient();

    const checkFavoriteStatus = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (clientProfile) {
            setClientProfileId(clientProfile.id);
            const { data: favorite } = await supabase
                .from("favorites")
                .select("id")
                .eq("client_id", clientProfile.id)
                .eq("establishment_id", establishmentId)
                .single();

            if (favorite) {
                setIsFavorite(true);
                setFavoriteId(favorite.id);
            }
        }
        setLoading(false);
    }, [establishmentId, supabase]);

    const toggleFavorite = async () => {
        if (!clientProfileId) return { error: "authentication_required" };

        try {
            if (isFavorite && favoriteId) {
                await supabase
                    .from("favorites")
                    .delete()
                    .eq("id", favoriteId);
                setIsFavorite(false);
                setFavoriteId(null);
            } else {
                const { data, error } = await supabase
                    .from("favorites")
                    .insert({
                        client_id: clientProfileId,
                        establishment_id: establishmentId,
                    })
                    .select()
                    .single();

                if (error) throw error;
                setIsFavorite(true);
                setFavoriteId(data.id);
            }
            return { success: true };
        } catch (error) {
            console.error("Error toggling favorite:", error);
            return { error: "operation_failed" };
        }
    };

    useEffect(() => {
        checkFavoriteStatus();
    }, [checkFavoriteStatus]);

    return {
        isFavorite,
        loading,
        toggleFavorite,
        hasProfile: !!clientProfileId,
    };
}
