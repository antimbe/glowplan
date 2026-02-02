"use client";

import { Box, Flex, Text, Input } from "@/components/ui";
import { Search, Bell, Settings } from "lucide-react";

interface DashboardHeaderProps {
  userEmail?: string;
}

export default function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <Box className="h-16 bg-[#2a3626] sticky top-0 z-30">
      <Flex align="center" justify="between" className="h-full px-8">
        {/* Search Bar */}
        <Box className="relative w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full h-10 pl-11 pr-4 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
          />
        </Box>

        {/* Right Actions */}
        <Flex align="center" gap={4}>
          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Bell size={20} className="text-white/70" />
            <Box className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Settings size={20} className="text-white/70" />
          </button>

          {/* User Profile */}
          <Flex align="center" gap={3} className="pl-4 border-l border-white/10">
            <Box className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Text className="text-[#2a3626] font-bold text-sm">
                {userEmail?.charAt(0).toUpperCase() || "U"}
              </Text>
            </Box>
            <Box className="hidden md:block">
              <Text className="text-white font-medium text-sm truncate max-w-[150px]">
                {userEmail || "Utilisateur"}
              </Text>
              <Text className="text-white/50 text-xs">Professionnel</Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
