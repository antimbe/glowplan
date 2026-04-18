"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar, DashboardHeader } from "@/components/features/dashboard";
import { Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { DashboardThemeContext, DEFAULT_THEME, type DashboardTheme, applyThemeColor } from "@/contexts/DashboardThemeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setThemeState] = useState<DashboardTheme>(DEFAULT_THEME);

  const setTheme = (updates: Partial<DashboardTheme>) => {
    setThemeState(prev => {
      const next = { ...prev, ...updates };
      if (updates.color) applyThemeColor(updates.color);
      return next;
    });
  };
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/pro/login");
        return;
      }

      const userType = user.user_metadata?.user_type;

      // Si c'est explicitement un pro, autoriser l'accès
      if (userType === "pro") {
        setUser(user);
        
        // Fetch establishment ID for notifications
        const { data: est } = await supabase
          .from("establishments")
          .select("id, name, dashboard_color, dashboard_logo_url")
          .eq("user_id", user.id)
          .single();

        if (est) {
          setEstablishmentId(est.id);
          const color = est.dashboard_color || DEFAULT_THEME.color;
          applyThemeColor(color);
          setTheme({
            color,
            logoUrl: est.dashboard_logo_url || null,
            establishmentName: est.name || null,
          });
        }
        
        setLoading(false);
        return;
      }

      // Si c'est explicitement un client, rediriger
      if (userType === "client") {
        router.push("/account");
        return;
      }

      // Fallback pour les anciens comptes sans user_type
      // Vérifier si l'utilisateur a un établissement (donc c'est un pro)
      const { data: establishment } = await supabase
        .from("establishments")
        .select("id, name, dashboard_color, dashboard_logo_url")
        .eq("user_id", user.id)
        .limit(1);

      if (establishment && establishment.length > 0) {
        // A un établissement = pro
        setUser(user);
        setEstablishmentId(establishment[0].id);
        const color2 = establishment[0].dashboard_color || DEFAULT_THEME.color;
        applyThemeColor(color2);
        setTheme({
          color: color2,
          logoUrl: establishment[0].dashboard_logo_url || null,
          establishmentName: establishment[0].name || null,
        });
        setLoading(false);
        return;
      }

      // Vérifier si c'est un client
      const { data: clientProfiles } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (clientProfiles && clientProfiles.length > 0) {
        // User is a client, redirect to client account
        router.push("/account");
        return;
      }

      // Ni pro ni client connu - rediriger vers select-space
      router.push("/auth/select-space");
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/pro/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="text-primary font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardThemeContext.Provider value={{ theme, setTheme }}>
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <DashboardHeader
            userEmail={user?.email}
            onMenuClick={() => setSidebarOpen(true)}
            establishmentId={establishmentId}
          />
          <div className="flex-1 p-4 lg:p-6 w-full">
            {children}
          </div>
        </div>
      </div>
    </DashboardThemeContext.Provider>
  );
}
