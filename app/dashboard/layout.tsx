"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Box, Flex, Text } from "@/components/ui";
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
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Flex align="center" gap={3}>
          <Loader2 className="animate-spin text-[#2a3626]" size={32} />
          <Text className="text-[#2a3626] font-medium">Chargement...</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50">
      <DashboardSidebar onLogout={handleLogout} />
      <Box className="ml-64 flex flex-col min-h-screen">
        <DashboardHeader userEmail={user?.email} />
        <Box className="flex-1 p-6 w-full">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
