// src/app/admin/kitchen/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Clock, ChefHat, CheckCircle, AlertCircle,
  Loader2, Trash2, StickyNote, Utensils, Bell,
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── TYPES ────────────────────────────────────────────────────────────────────

type CartCustomization = {
  optionId:           string;
  optionName:         string;
  choiceId:           string;
  choiceName:         string;
  priceModifierCents: number;
};

type OrderItem = {
  id:             string;
  name:           string;
  quantity:       number;
  note:           string;
  customizations: CartCustomization[];
};

type Order = {
  id:            string;
  table_id:      string | null;
  status:        "pending" | "cooking" | "ready" | "completed";
  total_cents:   number;
  notes:         string | null;
  created_at:    string;
  updated_at:    string;
  confirmed_at:  string | null;
  _displayTime?: string;
  table_number:  string | null;
  items:         OrderItem[];
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatElapsed = (dateStr: string) => {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1)  return "Adesso";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const formatElapsedNum = (dateStr: string) =>
  Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);

const formatPrice = (cents: number) =>
  (cents / 100).toFixed(2).replace(".", ",");

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function KitchenDashboard() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0); // forza re-render ogni minuto per elapsed

  // ── FETCH ───────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      // 1. Ordini attivi — più vecchi prima
      const { data: ordersData, error: ordErr } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["confirmed", "cooking", "ready"])
        .order("created_at", { ascending: true }); // vecchi → nuovi
      if (ordErr) throw ordErr;
      console.log("ordersData:", ordersData?.length, ordersData?.map(o => o.status));
      if (!ordersData?.length) { setOrders([]); return; }

      // 2. Items degli ordini
      const orderIds = ordersData.map((o) => o.id);
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      // 3. Nomi piatti dal menu (fallback su name/name_snapshot già salvati)
      const menuItemIds = [...new Set((itemsData || []).map((i) => i.menu_item_id).filter(Boolean))];
      let nameMap: Record<string, string> = {};
      if (menuItemIds.length) {
        const { data: menuItems } = await supabase
          .from("menu_items").select("id, name").in("id", menuItemIds);
        (menuItems || []).forEach((m) => { nameMap[m.id] = m.name; });
      }

      // 4. Numeri tavolo da table_qr_sessions (tabella reale del progetto)
      const tableIds = [...new Set(ordersData.map((o) => o.table_id).filter(Boolean))];
      let tableMap: Record<string, string> = {};
      if (tableIds.length) {
        const { data: tables } = await supabase
          .from("table_qr_sessions").select("id, table_number").in("id", tableIds);
        (tables || []).forEach((t) => {
          tableMap[t.id] = String(t.table_number ?? "?");
        });
      }

      // 5. Merge
      const formatted: Order[] = ordersData.map((order) => {
        const orderItems = (itemsData || []).filter((i) => i.order_id === order.id);
        // base_price nel DB è in EURO (es. 16.50) → converti in centesimi
        const computedTotalCents = orderItems.reduce(
          (sum, i) => sum + Math.round((i.base_price ?? 0) * 100) * (i.quantity ?? 1), 0
        );
        return {
          ...order,
          // Usa updated_at per ordini confirmed (= momento invio), created_at per gli altri
          // confirmed_at = timestamp esatto dell'invio dal cliente
          _displayTime: order.confirmed_at || order.updated_at || order.created_at,
          total_cents: computedTotalCents > 0 ? computedTotalCents : (order.total_cents ?? 0),
          table_number: order.table_id ? (tableMap[order.table_id] ?? null) : null,
          items: orderItems.map((i): OrderItem => ({
            id:       i.id,
            name:     nameMap[i.menu_item_id] || i.name_snapshot || i.name || "Prodotto",
            quantity: i.quantity ?? 1,
            note:     i.note ?? "",
            customizations: Array.isArray(i.customizations) ? i.customizations : [],
          })),
        };
      });

      setOrders(formatted);
      setError(null);
    } catch (err: any) {
      console.error("[Kitchen] fetchOrders:", JSON.stringify(err), err?.message, err?.code, err?.details);
      setError(err?.message || JSON.stringify(err) || "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── REALTIME + TICK ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();

    // Realtime su orders e order_items
    const channel = supabase
      .channel("kitchen_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" },     fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, fetchOrders)
      .subscribe((status) => {
        console.log("[Kitchen] realtime status:", status);
      });

    // Aggiorna elapsed ogni 60s
    const tickInterval = setInterval(() => setTick((t) => t + 1), 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(tickInterval);
    };
  }, [fetchOrders]);

  // ── STATUS UPDATE ───────────────────────────────────────────────────────────
  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) setError(`Aggiornamento fallito: ${error.message}`);
    setUpdating(null);
  };

  // ── DELETE ──────────────────────────────────────────────────────────────────
  const deleteOrder = async (orderId: string) => {
    if (!confirm("Eliminare questo ordine?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) { alert(`Errore: ${error.message}`); return; }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // ── PARTIALS ────────────────────────────────────────────────────────────────
  const pending = orders.filter((o) => o.status === "confirmed");
  const cooking = orders.filter((o) => o.status === "cooking");
  const ready   = orders.filter((o) => o.status === "ready");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-green-400 mx-auto" />
          <p className="text-gray-400 text-sm">Caricamento cucina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Cucina Live</h1>
            <p className="text-xs text-gray-500">Ordini più vecchi in cima</p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-3">
          <StatPill color="yellow" count={pending.length} label="Attesa" />
          <StatPill color="blue"   count={cooking.length} label="Cucina" />
          <StatPill color="green"  count={ready.length}   label="Pronti" />
          <button
            onClick={fetchOrders}
            className="ml-2 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Aggiorna"
          >
            <Loader2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── ERROR ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-6 mt-4 bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── COLUMNS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-0 lg:divide-x divide-white/10 p-0">

        <Column
          title="In Attesa"
          count={pending.length}
          colorClass="text-yellow-400"
          icon={<Clock className="w-4 h-4" />}
          emptyText="Nessun ordine in attesa"
          bgAccent="border-yellow-500/20"
        >
          {pending.map((o) => (
            <OrderCard
              key={o.id} order={o}
              isUpdating={updating === o.id}
              onUpdate={updateStatus}
              onDelete={deleteOrder}
              tick={tick}
            />
          ))}
        </Column>

        <Column
          title="In Cucina"
          count={cooking.length}
          colorClass="text-blue-400"
          icon={<ChefHat className="w-4 h-4" />}
          emptyText="Nessun ordine in preparazione"
          bgAccent="border-blue-500/20"
        >
          {cooking.map((o) => (
            <OrderCard
              key={o.id} order={o}
              isUpdating={updating === o.id}
              onUpdate={updateStatus}
              onDelete={deleteOrder}
              tick={tick}
            />
          ))}
        </Column>

        <Column
          title="Pronti"
          count={ready.length}
          colorClass="text-green-400"
          icon={<CheckCircle className="w-4 h-4" />}
          emptyText="Nessun ordine pronto"
          bgAccent="border-green-500/20"
        >
          {ready.map((o) => (
            <OrderCard
              key={o.id} order={o}
              isUpdating={updating === o.id}
              onUpdate={updateStatus}
              onDelete={deleteOrder}
              tick={tick}
            />
          ))}
        </Column>

      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function StatPill({ color, count, label }: { color: "yellow"|"blue"|"green"; count: number; label: string }) {
  const colors = {
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    blue:   "bg-blue-500/15   text-blue-400   border-blue-500/20",
    green:  "bg-green-500/15  text-green-400  border-green-500/20",
  };
  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${colors[color]}`}>
      <span className="text-base font-bold tabular-nums">{count}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

function Column({
  title, count, colorClass, icon, emptyText, bgAccent, children,
}: {
  title: string; count: number; colorClass: string; icon: React.ReactNode;
  emptyText: string; bgAccent: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-73px)]">
      {/* Column header */}
      <div className={`px-5 py-4 border-b border-white/10 flex items-center gap-2`}>
        <span className={colorClass}>{icon}</span>
        <span className={`text-sm font-semibold uppercase tracking-wider ${colorClass}`}>
          {title}
        </span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${bgAccent} ${colorClass}`}>
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {count === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Utensils className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{emptyText}</p>
          </div>
        ) : children}
      </div>
    </div>
  );
}

function OrderCard({
  order, isUpdating, onUpdate, onDelete, tick,
}: {
  order: Order;
  isUpdating: boolean;
  onUpdate: (id: string, status: string) => void;
  onDelete:  (id: string) => void;
  tick: number; // unused value, just triggers re-render
}) {
  const displayTime = order._displayTime || order.created_at;
  const elapsed  = formatElapsedNum(displayTime);
  const isUrgent = elapsed >= 10; // ≥10 minuti → bordo rosso

  return (
    <div className={`bg-gray-900 rounded-2xl border overflow-hidden transition-all ${
      isUrgent ? "border-red-500/50 shadow-red-500/10 shadow-lg" : "border-white/10"
    }`}>

      {/* Card header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-white/10 ${
        order.status === "pending" ? "bg-yellow-500/10"
        : order.status === "cooking" ? "bg-blue-500/10"
        : "bg-green-500/10"
      }`}>
        <div className="flex items-center gap-2">
          {/* Numero tavolo */}
          <span className="bg-white/15 text-white font-bold px-3 py-1 rounded-lg text-sm tracking-wide">
            {order.table_number ? `TAV ${order.table_number}` : "TAV —"}
          </span>
          {/* Elapsed — rosso se urgente */}
          <span className={`text-xs font-semibold flex items-center gap-1 ${isUrgent ? "text-red-400" : "text-gray-400"}`}>
            <Clock className="w-3 h-3" />
            {formatElapsed(displayTime)}
            {isUrgent && " ⚠"}
          </span>
        </div>

        {/* Prezzo totale */}
        <span className="text-sm font-bold text-white/70">€{formatPrice(order.total_cents)}</span>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-3">
        {order.items.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Nessun prodotto</p>
        ) : (
          order.items.map((item) => (
            <div key={item.id} className="space-y-1.5">
              {/* Nome + quantità */}
              <div className="flex items-baseline gap-2">
                <span className="text-green-400 font-bold text-sm tabular-nums min-w-[24px]">
                  {item.quantity}×
                </span>
                <span className="text-white font-semibold text-sm">{item.name}</span>
              </div>

              {/* Customizations */}
              {item.customizations.length > 0 && (
                <div className="ml-7 flex flex-wrap gap-1.5">
                  {item.customizations.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs bg-orange-500/15 border border-orange-500/25 text-orange-300 px-2 py-0.5 rounded-md"
                    >
                      <span className="text-orange-400/60 font-medium">{c.optionName}:</span>
                      {c.choiceName}
                      {c.priceModifierCents > 0 && (
                        <span className="text-orange-400/70 ml-0.5">
                          +€{formatPrice(c.priceModifierCents)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Nota libera */}
              {item.note && (
                <div className="ml-7 flex items-start gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                  <StickyNote className="w-3 h-3 shrink-0 mt-0.5" />
                  <span className="italic">{item.note}</span>
                </div>
              )}
            </div>
          ))
        )}

        {/* Note ordine (campo globale) */}
        {order.notes && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
            <Bell className="w-3 h-3 shrink-0 mt-0.5 text-gray-500" />
            <span className="italic">{order.notes}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        {order.status === "pending" && (
          <>
            <button
              onClick={() => onUpdate(order.id, "cooking")}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChefHat className="w-4 h-4" />}
              Inizia Cottura
            </button>
            <button
              onClick={() => onDelete(order.id)}
              className="px-3 py-2.5 bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all"
              title="Elimina ordine"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        {order.status === "cooking" && (
          <>
            <button
              onClick={() => onUpdate(order.id, "ready")}
              disabled={isUpdating}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Segna Pronto
            </button>
            <button
              onClick={() => onDelete(order.id)}
              className="px-3 py-2.5 bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        {order.status === "ready" && (
          <button
            onClick={() => onUpdate(order.id, "completed")}
            disabled={isUpdating}
            className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-gray-300 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Completato — Consegnato
          </button>
        )}
      </div>
    </div>
  );
}