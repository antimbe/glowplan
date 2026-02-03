"use client";

import { Menu, Search, Bell, Settings } from "lucide-react";

interface DashboardHeaderProps {
  userEmail?: string;
  onMenuClick?: () => void;
}

export default function DashboardHeader({ userEmail, onMenuClick }: DashboardHeaderProps) {
  return (
    <div className="h-14 lg:h-16 bg-primary sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left: Menu button (mobile) + Search */}
        <div className="flex items-center gap-3">
          {/* Menu hamburger - mobile only */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Menu size={20} className="text-white" />
          </button>

          {/* Search Bar - hidden on mobile, visible on tablet+ */}
          <div className="relative hidden sm:block w-64 md:w-80 lg:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full h-10 pl-11 pr-4 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search button - mobile only */}
          <button className="sm:hidden w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Search size={20} className="text-white/70" />
          </button>

          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Bell size={20} className="text-white/70" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings - hidden on mobile */}
          <button className="hidden sm:flex w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 items-center justify-center transition-colors">
            <Settings size={20} className="text-white/70" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 lg:pl-4 border-l border-white/10">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {userEmail?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-white font-medium text-sm truncate max-w-[150px]">
                {userEmail || "Utilisateur"}
              </p>
              <p className="text-white/50 text-xs">Professionnel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
