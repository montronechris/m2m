// src/components/admin/DashboardContent.tsx

"use client";

import { DashboardSection, ThemeMode } from "@/hooks/useDashboard";
import { StatsCards } from "./sections/StatsCards";

interface DashboardContentProps {
  activeSection: DashboardSection;
  theme: ThemeMode;
}

export function DashboardContent({ activeSection, theme }: DashboardContentProps) {
  const isLight = theme === "light";

  const sectionBaseClass = `rounded-2xl p-6 transition-colors ${
    isLight
      ? "bg-white border-2 border-green-500 shadow-md" // 🔧 Bordo verde spesso
      : "bg-[#111118]/60 backdrop-blur-sm border border-white/5"
  }`;

  const titleClass = `text-xl font-bold mb-4 ${isLight ? "text-gray-900" : "text-white"}`;
  const textClass = isLight ? "text-gray-700" : "text-gray-400"; // 🔧 Testo più scuro

  switch (activeSection) {
    case "dashboard":
      return (
        <div className="space-y-6">
          <StatsCards theme={theme} />
          <div className={sectionBaseClass}>
            <p className={textClass}>Altre sezioni dashboard in arrivo...</p>
          </div>
        </div>
      );
    // ... altri casi con classi dinamiche
    default:
      return (
        <div className={sectionBaseClass}>
          <h2 className={titleClass}>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
          <p className={textClass}>Sezione in sviluppo...</p>
        </div>
      );
  }
}