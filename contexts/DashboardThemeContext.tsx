"use client";

import { createContext, useContext } from "react";

export interface DashboardTheme {
  color: string;
  logoUrl: string | null;
  establishmentName: string | null;
}

export const DEFAULT_THEME: DashboardTheme = {
  color: "#32422c",
  logoUrl: null,
  establishmentName: null,
};

export const DashboardThemeContext = createContext<DashboardTheme>(DEFAULT_THEME);

export function useDashboardTheme() {
  return useContext(DashboardThemeContext);
}
