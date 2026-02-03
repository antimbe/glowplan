"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { 
  Building2, 
  Wallet, 
  Calendar, 
  Users, 
  Briefcase, 
  CreditCard, 
  LogOut,
  X
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
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ onLogout, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 bg-primary h-screen flex flex-col fixed left-0 top-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo + Close button mobile */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Logo variant="light" size="md" />
          <button 
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="flex flex-col gap-1 px-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? "bg-white text-primary" 
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onLogout}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 rounded-xl w-full text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
