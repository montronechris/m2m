// src/components/admin/staff/StaffHeader.tsx

"use client";

import { ChefHat, LogOut, RefreshCw, Moon, Sun } from "lucide-react";

interface StaffHeaderProps {
  userName: string;
  theme: "light" | "dark";
  refreshing: boolean;
  onToggleTheme: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export function StaffHeader({
  userName,
  theme,
  refreshing,
  onToggleTheme,
  onRefresh,
  onLogout,
}: StaffHeaderProps) {
  const isLight = theme === "light";

  return (
    <header
      className={`sticky top-0 z-40 border-b px-6 py-4 transition-colors ${
        isLight
          ? "bg-white/90 backdrop-blur-md border-gray-200"
          : "bg-[#0a0a0f]/90 backdrop-blur-xl border-white/5"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Area Staff</h1>
            <p className={`text-xs ${isLight ? "text-gray-500" : "text-gray-400"}`}>
              Benvenuto, {userName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition-all ${
              isLight
                ? "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <button
            onClick={onRefresh}
            className={`p-2.5 rounded-xl border transition-all ${
              isLight
                ? "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onLogout}
            className={`p-2.5 rounded-xl border transition-all ${
              isLight
                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
            }`}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}