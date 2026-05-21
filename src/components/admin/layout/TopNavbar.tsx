// src/components/admin/layout/TopNavbar.tsx

"use client";

import { Search, Bell, Moon, Sun } from "lucide-react";
import { ThemeMode } from "@/hooks/useDashboard";

interface TopNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  restaurantStatus: "open" | "closed";
  onToggleStatus: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function TopNavbar({
  searchQuery,
  onSearchChange,
  restaurantStatus,
  onToggleStatus,
  theme,
  onToggleTheme,
}: TopNavbarProps) {
  const isLight = theme === "light";

  return (
    <header
      className={`sticky top-0 z-30 border-b px-6 py-4 transition-colors duration-300 ${
        isLight
          ? "bg-white/90 backdrop-blur-md border-b-2 border-gray-300" // 🔧 Bordo spesso
          : "bg-[#0a0a0f]/80 backdrop-blur-xl border-white/5"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-gray-500" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Cerca ordini, piatti, tavoli..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all w-80 ${
              isLight
                ? "bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-green-500/30 focus:border-green-500" // 🔧 Bordo input spesso
                : "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-green-500/30 focus:border-green-500/30"
            }`}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Restaurant Status */}
          <button
            onClick={onToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              restaurantStatus === "open"
                ? isLight
                  ? "bg-green-50 border-2 border-green-300 text-green-800 hover:bg-green-100" // 🔧 Bordo spesso
                  : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                : isLight
                ? "bg-red-50 border-2 border-red-300 text-red-800 hover:bg-red-100"
                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${restaurantStatus === "open" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm font-medium">{restaurantStatus === "open" ? "Aperto" : "Chiuso"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition-all ${
              isLight
                ? "bg-gray-50 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900" // 🔧 Bordo spesso
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
            title={isLight ? "Attiva modalità scura" : "Attiva modalità chiara"}
          >
            {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className={`relative p-2.5 rounded-xl transition-colors ${isLight ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/5 text-gray-400"}`}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className={`flex items-center gap-3 pl-3 border-l ${isLight ? "border-l-2 border-gray-300" : "border-white/10"}`}> {/* 🔧 Separatore spesso */}
            <div className="text-right hidden sm:block">
              <p className={`text-sm font-medium ${isLight ? "text-gray-900" : "text-white"}`}>Admin</p>
              <p className={`text-xs ${isLight ? "text-gray-700" : "text-gray-500"}`}>Gestore</p> {/* 🔧 Testo più scuro */}
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-sm ring-2 ring-green-500/30 text-white">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}