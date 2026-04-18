"use client";

import { createContext, useContext } from "react";

export interface DashboardTheme {
  color: string;
  logoUrl: string | null;
  establishmentName: string | null;
}

export interface DashboardThemeContextValue {
  theme: DashboardTheme;
  setTheme: (updates: Partial<DashboardTheme>) => void;
}

export const DEFAULT_THEME: DashboardTheme = {
  color: "#32422c",
  logoUrl: null,
  establishmentName: null,
};

/** Ajuste la luminosité d'une couleur hex (+amount = plus clair, -amount = plus sombre) */
function adjustHex(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/** Applique la couleur principale comme variables CSS sur :root */
export function applyThemeColor(color: string) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--color-primary", color);
  document.documentElement.style.setProperty("--color-primary-light", adjustHex(color, 20));
  document.documentElement.style.setProperty("--color-primary-dark", adjustHex(color, -20));
}

export const DashboardThemeContext = createContext<DashboardThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useDashboardTheme() {
  return useContext(DashboardThemeContext);
}
