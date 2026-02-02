"use client";

import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function SectionCard({ icon: Icon, title, subtitle, children }: SectionCardProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg flex-shrink-0">
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">{title}</h2>
          <p className="text-gray-500 text-[10px] lg:text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
