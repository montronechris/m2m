// src/components/admin/layout/Sidebar.tsx

"use client";

import {
  LayoutDashboard, ShoppingCart, Utensils, Table, QrCode,
  BarChart3, Users, Palette, Settings, Zap, ChevronLeft, ChevronRight,
} from "lucide-react";
import { DashboardSection, ThemeMode } from "@/hooks/useDashboard";

interface SidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  restaurantName: string;
  logoUrl: string | null;
  theme: ThemeMode;
}

const navItems: { id: DashboardSection; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Ordini", icon: ShoppingCart },
  { id: "menu", label: "Menu", icon: Utensils },
  { id: "tables", label: "Tavoli", icon: Table },
  { id: "qr", label: "QR Code", icon: QrCode },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "staff", label: "Staff", icon: Users },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "settings", label: "Impostazioni", icon: Settings },
];

export function Sidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
  restaurantName,
  logoUrl,
  theme,
}: SidebarProps) {
  const isLight = theme === "light";

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      } ${
        isLight
          ? "bg-white border-r-2 border-gray-300" // 🔧 Bordo spesso e visibile
          : "bg-[#111118]/95 backdrop-blur-xl border-r border-white/5"
      }`}
    >
      {/* Logo & Toggle */}
      <div
        className={`p-5 border-b flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } ${isLight ? "border-b-2 border-gray-300" : "border-white/5"}`} // 🔧 Separatore spesso
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-green-500/30"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center font-bold text-sm text-white">
                TR
              </div>
            )}
            <span className={`font-bold text-lg ${isLight ? "text-gray-900" : "bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"}`}>
              {restaurantName}
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-lg transition-colors ${
            isLight
              ? "hover:bg-gray-100 text-gray-700 hover:text-gray-900" // 🔧 Testo più scuro
              : "hover:bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isCollapsed ? "justify-center" : ""
              } ${
                isActive
                  ? isLight
                    ? "bg-green-50 text-green-700 border border-green-300"
                    : "bg-green-500/15 text-green-400 border border-green-500/20"
                  : isLight
                  ? "text-gray-900 hover:bg-gray-100" // 🔧 Testo nero
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive
                    ? isLight
                      ? "text-green-700"
                      : "text-green-400"
                    : isLight
                    ? "text-gray-700 group-hover:text-gray-900" // 🔧 Icone scure
                    : "text-gray-400 group-hover:text-white"
                } transition-colors`}
              />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
              {isActive && !isCollapsed && (
                <span className={`ml-auto w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? "bg-green-700" : "bg-green-400"}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Kitchen Mode Shortcut */}
      {!isCollapsed && (
        <div className="absolute bottom-6 left-3 right-3">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${
              isLight
                ? "bg-orange-50 border-2 border-orange-300 text-orange-800 hover:bg-orange-100" // 🔧 Bordo spesso e testo scuro
                : "bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-400 hover:border-orange-500/40"
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="font-medium">Modalità Cucina</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isLight ? "bg-orange-100 text-orange-800" : "bg-orange-500/20 text-orange-400"}`}>
              Ctrl+K
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}