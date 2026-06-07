// src/app/admin/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard, ShoppingCart, Utensils, Table, QrCode,
  BarChart3, Users, Palette, Settings, ChevronLeft, ChevronRight,
  Bell, Moon, Sun, Home, ChefHat,
} from "lucide-react";

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Order = {
  id: string;
  tableNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  status: "pending" | "preparing" | "ready" | "delivered";
  notes?: string;
  timestamp: string;
  total: number;
};

type TableStatus = {
  id: string;
  number: string;
  status: "free" | "occupied" | "reserved";
  guests?: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading]                   = useState(true);
  const [restaurantName, setRestaurantName]         = useState("Tavola Rapida");
  const [logoUrl, setLogoUrl]                       = useState<string | null>(null);
  const [theme, setTheme]                           = useState<"light" | "dark">("dark");
  const [orders, setOrders]                         = useState<Order[]>([]);
  const [tables, setTables]                         = useState<TableStatus[]>([]);
  const [activePiatti, setActivePiatti]             = useState<number>(0);

  const toggleTheme = () => setTheme(p => p === "light" ? "dark" : "light");

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsLoading(false); return; }

        const { data: profile } = await supabase
          .from("profiles").select("restaurant_id").eq("id", user.id).single();
        if (!profile?.restaurant_id) { setIsLoading(false); return; }

        const { data: restaurant } = await supabase
          .from("restaurants").select("name, logo_url")
          .eq("id", profile.restaurant_id).single();
        if (restaurant) {
          setRestaurantName(restaurant.name || "Tavola Rapida");
          setLogoUrl(restaurant.logo_url);
        }

        // Conta piatti attivi per la stat card
        const { data: cats } = await supabase
          .from("menu_categories").select("id").eq("restaurant_id", profile.restaurant_id);
        if (cats?.length) {
          const { count } = await supabase
            .from("menu_items").select("*", { count: "exact", head: true })
            .in("category_id", cats.map(c => c.id))
            .eq("is_available", true);
          setActivePiatti(count ?? 0);
        }

        // Mock orders/tables
        setOrders([{
          id: "ORD-2847", tableNumber: "TAV-03",
          items: [{ name: "Spaghetti Carbonara", quantity: 2, price: 14 }],
          status: "preparing", notes: "Senza cipolla", timestamp: "14:32", total: 28,
        }]);
        setTables([
          { id: "1", number: "TAV-01", status: "occupied", guests: 2 },
          { id: "2", number: "TAV-02", status: "free" },
        ]);
      } catch (err) {
        console.error("❌ Errore dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── THEME TOKENS ──────────────────────────────────────────────────────────
  const bg           = theme === "light" ? "bg-white"        : "bg-[#1a1a25]";
  const border       = theme === "light" ? "border-gray-200"  : "border-white/10";
  const textPrimary  = theme === "light" ? "text-gray-900"   : "text-white";
  const textSecondary= theme === "light" ? "text-gray-500"   : "text-gray-400";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard, href: "/admin/dashboard" },
    { id: "menu",      label: "Menu",          icon: Utensils,        href: "/admin/menu" },
    { id: "orders",    label: "Ordini",        icon: ShoppingCart,    href: "/admin/kitchen"   },
    { id: "tables",    label: "Tavoli",        icon: QrCode,          href: "/admin/tables" },
    { id: "analytics", label: "Analytics",    icon: BarChart3,       href: "/admin/analytics" },
    { id: "staff",     label: "Staff",        icon: Users,           href: "/admin/staff" },
    { id: "branding",  label: "Branding",     icon: Palette,         href: "/admin/branding" },
    { id: "settings",  label: "Impostazioni", icon: Settings,        href: "/admin/settings" },
  ];

  const bgSidebar   = theme === "dark" ? "bg-gray-900"     : "bg-white";
  const borderColor = theme === "dark" ? "border-white/10" : "border-gray-200";

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-gray-50 text-gray-900" : "bg-[#0a0a0f] text-white"} flex`}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={`${bgSidebar} border-r ${borderColor} flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "w-16" : "w-56"} shrink-0 sticky top-0 h-screen`}>
        <div className={`flex items-center gap-3 px-4 py-5 border-b ${borderColor}`}>
          <div className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5 text-green-400" />
          </div>
          {!isSidebarCollapsed && <span className="font-bold text-sm">TavolaRapida</span>}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                ${item.id === "dashboard"
                  ? "bg-green-500/15 text-green-400 border border-green-500/20"
                  : `${textSecondary} ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                ${isSidebarCollapsed ? "justify-center" : ""}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={`px-2 py-3 border-t ${borderColor} space-y-1`}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${textSecondary} ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"} transition-all ${isSidebarCollapsed ? "justify-center" : ""}`}
          >
            {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!isSidebarCollapsed && <span className="text-sm font-medium">{theme === "dark" ? "Tema Chiaro" : "Tema Scuro"}</span>}
          </button>
          <button
            onClick={() => setIsSidebarCollapsed(p => !p)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${textSecondary} ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"} transition-all ${isSidebarCollapsed ? "justify-center" : ""}`}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!isSidebarCollapsed && <span className="text-sm font-medium">Comprimi</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">

        {/* Header */}
        <header className={`sticky top-0 z-30 ${theme === "light" ? "bg-white/80 border-gray-200" : "bg-[#0a0a0f]/80 border-white/5"} backdrop-blur-xl border-b px-6 py-3 flex items-center justify-between`}>
          <h1 className={`text-xl font-bold ${textPrimary}`}>Dashboard</h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2 ${theme === "light" ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-white"} rounded-xl transition-all`}>
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button className={`p-2 ${theme === "light" ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-white"} rounded-xl transition-all relative`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Ordini Oggi",     value: "24",          icon: ShoppingCart, color: "green"  },
              { label: "Tavoli Occupati", value: "8/12",        icon: Table,        color: "blue"   },
              { label: "Fatturato",       value: "€1.240",      icon: BarChart3,    color: "purple" },
              { label: "Piatti Attivi",   value: activePiatti,  icon: Utensils,     color: "orange" },
            ].map((stat, i) => (
              <div key={i} className={`${bg} rounded-2xl p-6 border ${border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={textSecondary}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${textPrimary} mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}