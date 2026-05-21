// src/hooks/useDashboard.ts

import { useState, useEffect, useCallback } from "react";

export type DashboardSection =
  | "dashboard"
  | "orders"
  | "menu"
  | "tables"
  | "qr"
  | "analytics"
  | "staff"
  | "branding"
  | "settings";

export type ThemeMode = "dark" | "light";

interface UseDashboardReturn {
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 🌙 Tema con persistenza
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("tavolarapida_theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("tavolarapida_theme", next);
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  return {
    activeSection,
    setActiveSection,
    isSidebarCollapsed,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
  };
}