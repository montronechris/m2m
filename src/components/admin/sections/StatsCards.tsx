// src/components/admin/sections/StatsCards.tsx

"use client";

import { ShoppingCart, DollarSign, Table, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { ThemeMode } from "@/hooks/useDashboard";

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: any;
  color: string;
  chart: number[];
  theme: ThemeMode;
}

function StatCard({ label, value, trend, icon: Icon, color, chart, theme }: StatCardProps) {
  const isLight = theme === "light";

  const colorClasses: Record<string, string> = {
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  const bgClasses: Record<string, string> = {
    green: "bg-green-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  };

  return (
    <div
      className={`group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
        isLight
          ? "bg-white border-2 border-green-500 shadow-md hover:shadow-lg hover:shadow-green-500/10" // 🔧 Bordo verde spesso
          : "bg-[#111118]/60 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-green-500/5"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm font-medium ${isLight ? "text-gray-700" : "text-gray-400"}`}>{label}</p> {/* 🔧 Testo più scuro */}
          <p className={`text-2xl font-bold mt-1 ${isLight ? "text-gray-900" : "text-white"}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl border ${isLight ? `${bgClasses[color]} border-2 border-gray-200` : `bg-${color}-500/10 border-${color}-500/20`}`}>
          <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
        </div>
      </div>

      {/* Mini Chart */}
      <div className="flex items-end gap-1 h-8 mb-2">
        {chart.map((v, j) => (
          <div
            key={j}
            className={`flex-1 rounded-t transition-colors cursor-pointer ${
              isLight ? `bg-${color}-200 hover:bg-${color}-300` : `bg-${color}-500/30 hover:bg-${color}-500/50`
            }`}
            style={{ height: `${v * 12}%` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 text-xs">
        {trend.startsWith("+") ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
        <span className={trend.startsWith("+") ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{trend}</span> {/* 🔧 Testo scuro */}
        <span className={isLight ? "text-gray-600" : "text-gray-500"}>vs ieri</span>
      </div>

      {!isLight && (
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
      )}
    </div>
  );
}

interface StatsCardsProps {
  theme: ThemeMode;
}

export function StatsCards({ theme }: StatsCardsProps) {
  const stats = [
    { label: "Ordini Oggi", value: "47", trend: "+12%", icon: ShoppingCart, color: "green", chart: [3, 7, 4, 8, 5, 9, 6] },
    { label: "Fatturato", value: "€1.248", trend: "+8%", icon: DollarSign, color: "blue", chart: [2, 5, 3, 7, 4, 8, 5] },
    { label: "Tavoli Attivi", value: "6/12", trend: "-2", icon: Table, color: "purple", chart: [1, 3, 2, 4, 3, 5, 4] },
    { label: "Tempo Prep.", value: "18 min", trend: "-3 min", icon: Clock, color: "orange", chart: [5, 4, 6, 3, 5, 4, 2] },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} theme={theme} />
      ))}
    </section>
  );
}