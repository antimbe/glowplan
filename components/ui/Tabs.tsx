"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Lock } from "lucide-react";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Tabs({ tabs, activeTab, onTabChange, className, size = "md" }: TabsProps) {
  const sizes = {
    sm: "px-2 py-2 text-xs gap-1",
    md: "px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm gap-1 lg:gap-2",
    lg: "px-4 lg:px-8 py-4 lg:py-5 text-sm lg:text-base gap-2",
  };

  return (
    <div className={cn("w-full bg-white rounded-2xl border border-gray-200 overflow-x-auto shadow-sm", className)}>
      <div className="flex min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={cn(
                "font-medium whitespace-nowrap transition-all border-b-2 flex items-center cursor-pointer",
                sizes[size],
                isDisabled
                  ? "text-gray-300 border-transparent cursor-not-allowed"
                  : isActive
                    ? "text-primary border-primary bg-primary/5"
                    : "text-gray-500 border-transparent hover:text-primary hover:bg-gray-50"
              )}
            >
              {isDisabled && <Lock size={14} />}
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
