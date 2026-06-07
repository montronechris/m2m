// src/app/(client)/status/[sessionId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Clock, Loader2, ChefHat, CheckCircle, Utensils } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

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
  status:        "confirmed" | "pending" | "cooking" | "ready" | "completed";
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
  if (mins < 60) return `${mins}m fa`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m fa`;
};

const formatPrice = (cents: number) =>
  (cents / 100).toFixed(2).replace(".", ",");

const shortId = (id: string) => id.slice(-4).toUpperCase();

// ─── COMANDA CARD ─────────────────────────────────────────────────────────────

function Comanda({ order, tick, isDark }: { order: Order; tick: number; isDark: boolean }) {
  const displayTime = order._displayTime || order.created_at;
  const isPending = order.status === "confirmed" || order.status === "pending";
  const isCooking = order.status === "cooking";
  const isReady   = order.status === "ready";

  const cardBg = isDark ? "#1c1917" : "#fafaf7";
  const cardBorder = isDark ? "#3d3834" : "#d6d3c4";
  const headBorder = isDark ? "#3d3834" : "#e0ddd0";
  const dotBorder = isDark ? "#3d3834" : "#c8c4b0";
  const dotBg = isDark ? "#0c0a09" : "#ffffff";
  const perfBg = isDark ? "#141210" : "#f0ede0";
  const perfDash = isDark ? "#3d3834" : "#c8c4b0";
  const rowDot = isDark ? "#3d3834" : "#d6d3c4";
  const footDash = isDark ? "#3d3834" : "#d6d3c4";
  const nameColor = isDark ? "#f5f5f4" : "#1c1917";
  const timeColor = isDark ? "#a8a29e" : "#78716c";
  const totalColor = isDark ? "#e7e5e4" : "#1c1917";
  const idColor = isDark ? "#78716c" : "#a8a29e";
  const customColor = isDark ? "#a8a29e" : "#78716c";
  const customBg = isDark ? "#292524" : "#f5f0d8";
  const customBorder = isDark ? "#44403c" : "#d6ceaa";
  const noteColor = isDark ? "#fbbf24" : "#92400e";

  const statusBg    = isPending ? (isDark ? "#422006" : "#fef9c3")
                    : isCooking ? (isDark ? "#1e3a5f" : "#dbeafe")
                    : (isDark ? "#14532d" : "#dcfce7");
  const statusColor = isPending ? (isDark ? "#fbbf24" : "#a16207")
                    : isCooking ? (isDark ? "#93c5fd" : "#1d4ed8")
                    : (isDark ? "#86efac" : "#15803d");
  const statusText  = isPending ? "★  in attesa  ★"
                    : isCooking ? "▶  in cucina  ▶"
                    : "✓  pronto  ✓";

  const qtyColor = isPending ? (isDark ? "#fbbf24" : "#ca8a04")
                 : isCooking ? (isDark ? "#60a5fa" : "#2563eb")
                 : (isDark ? "#4ade80" : "#16a34a");

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      borderRadius: "3px",
      fontFamily: "'Courier New', Courier, monospace",
      position: "relative",
      boxShadow: isDark ? "0 2px 6px rgba(0,0,0,0.4)" : "2px 2px 0 #e8e4c0",
      overflow: "hidden",
    }}>
      {/* Perforazione */}
      <div style={{
        height: "20px",
        background: `repeating-linear-gradient(90deg, transparent, transparent 5px, ${perfBg} 5px, ${perfBg} 6px)`,
        borderBottom: `1px dashed ${perfDash}`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "60px",
      }}>
        {[0,1].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            background: dotBg, border: `1px solid ${dotBorder}`,
          }} />
        ))}
      </div>

      {/* Timbro status */}
      <div style={{
        background: statusBg,
        color: statusColor,
        textAlign: "center",
        fontSize: "18px",
        fontWeight: 700,
        letterSpacing: "0.15em",
        padding: "6px 0",
        borderBottom: `1px solid ${headBorder}`,
      }}>
        {statusText}
      </div>

      {/* Header tavolo + ora */}
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: `1px solid ${headBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "0.05em", color: nameColor }}>
          TAV {order.table_number ?? "—"}
        </span>
        <span style={{ fontSize: 18, color: timeColor, letterSpacing: "0.03em" }}>
          {formatElapsed(displayTime)}
        </span>
      </div>

      {/* Righe piatti */}
      <div style={{ padding: "10px 14px" }}>
        {order.items.length === 0 ? (
          <p style={{ fontSize: 20, color: timeColor, fontStyle: "italic" }}>Nessun prodotto</p>
        ) : order.items.map((item) => (
          <div key={item.id} style={{
            paddingBottom: 8,
            marginBottom: 6,
            borderBottom: `1px dotted ${rowDot}`,
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: qtyColor, minWidth: 32 }}>
                {item.quantity}×
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: nameColor, lineHeight: 1.3 }}>
                  {item.name}
                </div>
                {item.customizations.length > 0 && item.customizations.map((c, i) => (
                  <div key={i} style={{
                    fontSize: 18,
                    color: customColor,
                    background: customBg,
                    border: `1px solid ${customBorder}`,
                    borderRadius: 3,
                    padding: "1px 7px",
                    display: "inline-block",
                    marginTop: 3,
                    marginRight: 3,
                  }}>
                    {c.optionName}: {c.choiceName}
                    {c.priceModifierCents > 0 && ` +€${formatPrice(c.priceModifierCents)}`}
                  </div>
                ))}
                {item.note && (
                  <div style={{ fontSize: 18, color: noteColor, fontStyle: "italic", marginTop: 3 }}>
                    ⚑ {item.note}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {order.notes && (
          <div style={{ fontSize: 18, color: noteColor, fontStyle: "italic", marginTop: 4 }}>
            ⚑ {order.notes}
          </div>
        )}
      </div>

      {/* Footer totale */}
      <div style={{
        padding: "6px 14px 12px",
        borderTop: `1px dashed ${footDash}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 11, color: idColor }}>#{shortId(order.id)}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: totalColor }}>€ {formatPrice(order.total_cents)}</span>
      </div>
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────

function SectionLabel({ icon, label, count, color, isDark }: {
  icon: React.ReactNode; label: string; count: number; color: string; isDark: boolean;
}) {
  const badgeBg = isDark ? `${color}22` : `${color}18`;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 20, letterSpacing: "0.12em", textTransform: "uppercase",
      color: isDark ? "#a8a29e" : "#78716c",
      marginBottom: 14,
    }}>
      <span style={{ color }}>{icon}</span>
      <span>{label}</span>
      <span style={{
        marginLeft: 4, fontSize: 20, fontWeight: 700,
        padding: "1px 9px", borderRadius: 20,
        background: badgeBg, color,
        border: `1px solid ${color}44`,
      }}>{count}</span>
      <span style={{ flex: 1, height: 1, background: isDark ? "#292524" : "#e0ddd0" }} />
    </div>
  );
}

// ─── EMPTY COLUMN ─────────────────────────────────────────────────────────────

function EmptyCol({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <div style={{
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 16,
      color: isDark ? "#44403c" : "#c8c4b0",
      letterSpacing: "0.08em",
      textAlign: "center",
      padding: "24px 0",
      borderTop: `1px dashed ${isDark ? "#292524" : "#d6d3c4"}`,
    }}>
      {label}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const params    = useParams();
  const sessionId = params?.sessionId as string;

  const [orders,      setOrders]      = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [tick,        setTick]        = useState(0);
  const [theme,       setTheme]       = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("client-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  const isDark = theme === "dark";
  const bg     = isDark ? "#0c0a09" : "#f5f3ec";
  const textPrim = isDark ? "#f5f5f4" : "#1c1917";
  const textSec  = isDark ? "#a8a29e" : "#78716c";

  useEffect(() => {
    if (!sessionId) return;
    supabase.from("table_qr_sessions").select("table_number")
      .eq("id", sessionId).maybeSingle()
      .then(({ data }) => { if (data?.table_number) setTableNumber(String(data.table_number)); });
  }, [sessionId]);

  const fetchOrders = useCallback(async () => {
    if (!sessionId) return;
    try {
      const { data: qrSession } = await supabase
        .from("qr_sessions").select("restaurant_id, table_number")
        .eq("id", sessionId).maybeSingle();
      if (!qrSession) { setOrders([]); setLoading(false); return; }
      if (qrSession.table_number) setTableNumber(String(qrSession.table_number));

      const { data: tableQr } = await supabase
        .from("table_qr_sessions").select("id")
        .eq("restaurant_id", qrSession.restaurant_id)
        .eq("table_number", qrSession.table_number).maybeSingle();
      if (!tableQr) { setOrders([]); setLoading(false); return; }

      const { data: ordersData, error: ordErr } = await supabase
        .from("orders").select("*")
        .eq("table_id", tableQr.id)
        .in("status", ["confirmed", "pending", "cooking", "ready"])
        .order("created_at", { ascending: true });
      if (ordErr) throw ordErr;
      if (!ordersData?.length) { setOrders([]); setLoading(false); return; }

      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData } = await supabase
        .from("order_items").select("*").in("order_id", orderIds);

      const menuItemIds = [...new Set((itemsData || []).map(i => i.menu_item_id).filter(Boolean))];
      let nameMap: Record<string, string> = {};
      if (menuItemIds.length) {
        const { data: menuItems } = await supabase
          .from("menu_items").select("id, name").in("id", menuItemIds);
        (menuItems || []).forEach(m => { nameMap[m.id] = m.name; });
      }

      const formatted: Order[] = ordersData.map(order => {
        const orderItems = (itemsData || []).filter(i => i.order_id === order.id);
        const computedTotalCents = orderItems.reduce(
          (sum, i) => sum + Math.round((i.base_price ?? 0) * 100) * (i.quantity ?? 1), 0
        );
        return {
          ...order,
          _displayTime: order.confirmed_at || order.updated_at || order.created_at,
          total_cents: computedTotalCents > 0 ? computedTotalCents : (order.total_cents ?? 0),
          table_number: tableNumber,
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
    } catch (err: any) {
      console.error("[StatusPage] fetchOrders:", err?.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, tableNumber]);

  useEffect(() => {
    if (!sessionId) return;
    fetchOrders();
    const channel = supabase.channel(`status_realtime_${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" },      fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, fetchOrders)
      .subscribe();
    const tickInterval = setInterval(() => setTick(t => t + 1), 60_000);
    return () => { supabase.removeChannel(channel); clearInterval(tickInterval); };
  }, [sessionId, fetchOrders]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", fontFamily: "'Courier New', monospace" }}>
          <Loader2 style={{ width: 48, height: 48, color: "#22c55e", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: textSec, fontSize: 22, letterSpacing: "0.1em" }}>CARICAMENTO...</p>
        </div>
      </div>
    );
  }

  const pending = orders.filter(o => o.status === "confirmed" || o.status === "pending");
  const cooking = orders.filter(o => o.status === "cooking");
  const ready   = orders.filter(o => o.status === "ready");

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textPrim, paddingTop: 80 }}>

      {/* ── HEADER ── */}
      <Navbar tableNumber={tableNumber} sessionId={sessionId} />

      {/* ── CONTENT ── */}
      {orders.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "60vh", gap: 16,
          fontFamily: "'Courier New', monospace", textAlign: "center", padding: 24,
        }}>
          <Utensils style={{ width: 56, height: 56, color: textSec, opacity: 0.4 }} />
          <p style={{ fontSize: 22, color: textSec, letterSpacing: "0.1em" }}>NESSUN ORDINE ATTIVO</p>
          <Link
            href={`/order/${sessionId}`}
            style={{
              fontSize: 20, fontWeight: 700, color: "#22c55e",
              padding: "10px 20px", borderRadius: 8,
              border: "1px solid #22c55e",
              background: "#22c55e15",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            VAI AL MENU
          </Link>
        </div>
      ) : (
        <main style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "start" }}>

            {/* IN ATTESA */}
            <section>
              <SectionLabel icon={<Clock style={{ width: 20, height: 20 }} />} label="In attesa" count={pending.length} color="#f59e0b" isDark={isDark} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {pending.length === 0
                  ? <EmptyCol label="Nessun ordine in attesa" isDark={isDark} />
                  : pending.map(o => <Comanda key={o.id} order={o} tick={tick} isDark={isDark} />)
                }
              </div>
            </section>

            {/* IN CUCINA */}
            <section>
              <SectionLabel icon={<ChefHat style={{ width: 20, height: 20 }} />} label="In cucina" count={cooking.length} color="#3b82f6" isDark={isDark} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {cooking.length === 0
                  ? <EmptyCol label="Nessun ordine in cucina" isDark={isDark} />
                  : cooking.map(o => <Comanda key={o.id} order={o} tick={tick} isDark={isDark} />)
                }
              </div>
            </section>

            {/* PRONTI */}
            <section>
              <SectionLabel icon={<CheckCircle style={{ width: 20, height: 20 }} />} label="Pronti" count={ready.length} color="#22c55e" isDark={isDark} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ready.length === 0
                  ? <EmptyCol label="Nessun ordine pronto" isDark={isDark} />
                  : ready.map(o => <Comanda key={o.id} order={o} tick={tick} isDark={isDark} />)
                }
              </div>
            </section>

          </div>
        </main>
      )}
      <Footer />
    </div>
  );
}