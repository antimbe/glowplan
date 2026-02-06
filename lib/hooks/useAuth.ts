"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  instagram: string | null;
  cancellation_count: number;
}

interface UseAuthReturn {
  user: User | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Hook pour gérer l'authentification et le profil client
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setClientProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setClientProfile(null);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        await loadProfile(user.id);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setClientProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    clientProfile,
    loading,
    isAuthenticated: !!user,
    signOut,
    refreshProfile,
  };
}
