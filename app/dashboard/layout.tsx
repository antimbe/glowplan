"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar, DashboardHeader } from "@/components/features/dashboard";
import { Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
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
          <Loader2 className="animate-spin text-[#2a3626]" size={32} />
          <span className="text-[#2a3626] font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
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
        />
        <div className="flex-1 p-4 lg:p-6 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
