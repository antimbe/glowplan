"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, Stack, Text, Logo } from "@/components/ui";
import { 
  Building2, 
  Wallet, 
  Calendar, 
  Users, 
  Briefcase, 
  CreditCard, 
  LogOut,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  { 
    label: "Mon établissement", 
    href: "/dashboard/etablissement", 
    icon: Building2 
  },
  { 
    label: "Portefeuille", 
    href: "/dashboard/portefeuille", 
    icon: Wallet 
  },
  { 
    label: "Mon agenda", 
    href: "/dashboard/agenda", 
    icon: Calendar 
  },
  { 
    label: "Mes clients", 
    href: "/dashboard/clients", 
    icon: Users 
  },
  { 
    label: "Mon Business", 
    href: "/dashboard/business", 
    icon: Briefcase,
    active: true
  },
  { 
    label: "Mes abonnements", 
    href: "/dashboard/abonnements", 
    icon: CreditCard 
  },
];

interface DashboardSidebarProps {
  onLogout?: () => void;
}

export default function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <Box className="w-64 bg-[#2a3626] h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <Box className="p-6 border-b border-white/10">
        <Logo variant="light" size="md" />
      </Box>

      {/* Navigation */}
      <Box className="flex-1 py-4 overflow-y-auto">
        <Stack space={1} className="px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <Box
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-white text-[#2a3626]" 
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <Text className={`text-sm font-medium flex-1 ${isActive ? "text-[#2a3626]" : "text-white/70"}`}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <ChevronRight size={16} className="opacity-60" />
                  )}
                </Box>
              </Link>
            );
          })}
        </Stack>
      </Box>

      {/* Logout */}
      <Box className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <Text className="text-sm font-medium text-white/60 hover:text-red-300">Déconnexion</Text>
        </button>
      </Box>
    </Box>
  );
}
