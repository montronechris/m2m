// src/app/(client)/order/[sessionId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useOrderSession } from "@/hooks/useOrderSession";
import { OrderHeader } from "@/components/client/order/OrderHeader";
import { RestaurantTitle } from "@/components/client/order/RestaurantTitle";
import { CategoryFilter } from "@/components/client/order/CategoryFilter";
import { MenuItemCard } from "@/components/client/order/MenuItemCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AlertCircle, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMenuItemOptions, type ModalOption, type CartCustomization } from "@/lib/api-service";
import { useCartExpiry } from "@/hooks/useCartExpiry";
import CustomizationModal from "@/components/client/cart/CustomizationModal";

export default function OrderPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const sessionId    = params.sessionId as string;
  const initialSlug  = searchParams.get("slug") || "cucinadalaghetti";

  const initFromDB = useCartStore((s) => s.initFromDB);
  const addItem    = useCartStore((s) => s.addItem);
  const cartCount  = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));

  const { restaurant, tableNumber, categories, items, loading, error, tableId, restaurantId } =
    useOrderSession(sessionId, initialSlug);

  useEffect(() => {
    if (!tableId || !restaurantId) return;
    initFromDB(tableId, restaurantId, initialSlug, sessionId);
  }, [tableId, restaurantId, initialSlug, sessionId, initFromDB]);

  const router = useRouter();

  const [expired,           setExpired]           = useState(false);
  const [activeCat,         setActiveCat]         = useState("all");
  const [isDark,            setIsDark]            = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentItem,       setCurrentItem]       = useState<any>(null);
  const [itemOptions,       setItemOptions]       = useState<ModalOption[]>([]);
  const [loadingOptionsId,  setLoadingOptionsId]  = useState<string | null>(null);

  useEffect(() => {
    const saved       = localStorage.getItem("order-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(saved ? saved === "dark" : prefersDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("order-theme", next ? "dark" : "light");
  };

  const { isWarning, secondsLeft } = useCartExpiry(() => setExpired(true));

  const cartHref = `/cart/${sessionId}?slug=${searchParams.get("slug")}&table=${searchParams.get("table")}`;

  // ── Palette ───────────────────────────────────────────────────────────────
  const T = {
    bg:        isDark ? "#07100d" : "#daf0e7",
    text:      isDark ? "#d1fae5" : "#052e1c",
    textMuted: isDark ? "#6ee7b7" : "#065f35",
    border:    isDark ? "rgba(52,211,153,0.18)" : "rgba(5,150,105,0.2)",
    bgCard:    isDark ? "rgba(15,35,25,0.9)"    : "rgba(255,255,255,0.82)",
    grid:      isDark ? "rgba(52,211,153,0.06)" : "rgba(5,150,105,0.10)",
  };

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const handleAddToCart = async (item: any) => {
    setLoadingOptionsId(item.id);
    try {
      const options = await getMenuItemOptions(item.id);
      if (options.length > 0) {
        setCurrentItem(item);
        setItemOptions(options);
        setShowCustomization(true);
        return;
      }
    } catch (err) {
      console.warn("[OrderPage] Opzioni non disponibili:", err);
    } finally {
      setLoadingOptionsId(null);
    }
    await addItem({ menuItemId: item.id, name: item.name, basePriceCents: item.price_cents, customizations: [] });
  };

  const handleCustomizationConfirm = async (customizations: CartCustomization[]) => {
    if (!currentItem) return;
    await addItem({ menuItemId: currentItem.id, name: currentItem.name, basePriceCents: currentItem.price_cents, customizations });
    setCurrentItem(null);
    setItemOptions([]);
  };

  const handleCloseModal = () => {
    setShowCustomization(false);
    setCurrentItem(null);
    setItemOptions([]);
  };

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: T.textMuted, fontWeight: 500 }}>Caricamento menu...</p>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 400, width: "100%", textAlign: "center", backdropFilter: "blur(12px)" }}>
          <AlertCircle style={{ width: 48, height: 48, color: "#ef4444", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 8 }}>Accesso Non Consentito</h2>
          <p style={{ color: T.textMuted, marginBottom: 8 }}>{error}</p>
          <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Per ordinare, devi scansionare il QR Code presente sul tuo tavolo.</p>
          <Link href="/scan/TAV1-X9Z2">
            <Button style={{ width: "100%", background: "#064e3b", color: "#fff" }}>Simula Scansione Tavolo 1</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = activeCat === "all" ? items : items.filter((i) => i.category_id === activeCat);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui, sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.06); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,35px) scale(1.04); } }
        @keyframes floatC { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.08); } }
      `}</style>

      {/* ── Griglia ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${T.grid} 1px, transparent 1px), linear-gradient(90deg, ${T.grid} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      {/* ── Blob 1: alto-sinistra, grande, animato ── */}
      <div style={{
        position: "fixed", zIndex: 0, pointerEvents: "none",
        top: -180, left: -200, width: 750, height: 750,
        borderRadius: "50%", filter: "blur(60px)",
        animation: "floatA 12s ease-in-out infinite",
        background: isDark
          ? "radial-gradient(circle, rgba(6,95,70,0.75) 0%, rgba(4,60,44,0.3) 55%, transparent 100%)"
          : "radial-gradient(circle, rgba(34,197,94,0.38) 0%, rgba(16,185,129,0.18) 55%, transparent 100%)",
      }} />

      {/* ── Blob 2: basso-destra, animato ── */}
      <div style={{
        position: "fixed", zIndex: 0, pointerEvents: "none",
        bottom: -150, right: -150, width: 650, height: 650,
        borderRadius: "50%", filter: "blur(55px)",
        animation: "floatB 15s ease-in-out infinite",
        background: isDark
          ? "radial-gradient(circle, rgba(5,150,105,0.55) 0%, rgba(4,120,87,0.2) 55%, transparent 100%)"
          : "radial-gradient(circle, rgba(5,150,105,0.35) 0%, rgba(16,185,129,0.12) 55%, transparent 100%)",
      }} />

      {/* ── Blob 3: centro, più saturo ── */}
      <div style={{
        position: "fixed", zIndex: 0, pointerEvents: "none",
        top: "42%", left: "50%", transform: "translate(-50%,-50%)",
        width: 800, height: 500,
        borderRadius: "50%", filter: "blur(80px)",
        animation: "floatC 18s ease-in-out infinite",
        background: isDark
          ? "radial-gradient(ellipse, rgba(6,78,59,0.5) 0%, transparent 70%)"
          : "radial-gradient(ellipse, rgba(134,239,172,0.45) 0%, transparent 70%)",
      }} />

      {/* ── Blob 4: alto-destra, piccolo accentuato ── */}
      <div style={{
        position: "fixed", zIndex: 0, pointerEvents: "none",
        top: "5%", right: "-80px", width: 400, height: 400,
        borderRadius: "50%", filter: "blur(50px)",
        background: isDark
          ? "radial-gradient(circle, rgba(4,120,87,0.4) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)",
      }} />

      {/* ── Vignette bordi (dà profondità) ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: isDark
          ? "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)"
          : "radial-gradient(ellipse at center, transparent 40%, rgba(3,70,40,0.18) 100%)",
      }} />

      {/* ── Cerchi decorativi ── */}
      {[
        { top: "8%",  right: "4%",  size: 360, opacity: isDark ? 0.10 : 0.13, stroke: 2 },
        { top: "11%", right: "7%",  size: 230, opacity: isDark ? 0.07 : 0.09, stroke: 1 },
        { bottom: "13%", left: "2%", size: 300, opacity: isDark ? 0.09 : 0.12, stroke: 2 },
        { bottom: "16%", left: "5%", size: 170, opacity: isDark ? 0.06 : 0.08, stroke: 1 },
      ].map((c, i) => (
        <div key={i} style={{
          position: "fixed", zIndex: 0, pointerEvents: "none",
          top: c.top, bottom: c.bottom, right: c.right, left: c.left,
          width: c.size, height: c.size, borderRadius: "50%",
          border: `${c.stroke}px solid ${isDark ? `rgba(52,211,153,${c.opacity})` : `rgba(5,150,105,${c.opacity})`}`,
        }} />
      ))}

      {/* ── NAVBAR ── */}
      <Navbar tableNumber={tableNumber} sessionId={sessionId} />

      {/* ── Toggle dark mode ── */}
      <button
        onClick={toggleTheme}
        aria-label="Cambia tema"
        style={{
          position: "fixed", top: 22, right: 80, zIndex: 60,
          width: 36, height: 36, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isDark ? "rgba(6,78,59,0.8)" : "rgba(187,247,208,0.9)",
          border: `1px solid ${T.border}`, cursor: "pointer",
          backdropFilter: "blur(8px)", transition: "all 0.3s ease",
          boxShadow: isDark ? "0 2px 12px rgba(52,211,153,0.2)" : "0 2px 12px rgba(5,150,105,0.2)",
        }}
      >
        {isDark
          ? <Sun  style={{ width: 16, height: 16, color: "#6ee7b7" }} />
          : <Moon style={{ width: 16, height: 16, color: "#047857" }} />
        }
      </button>

      {/* ── CONTENUTO ── */}
      <div style={{ position: "relative", zIndex: 10, paddingTop: 80 }}>
        <OrderHeader cartCount={cartCount} cartHref={cartHref} />
        <RestaurantTitle name={restaurant?.name || "Ristorante"} tableNumber={tableNumber} />

        <main style={{ maxWidth: 896, margin: "0 auto", padding: "0 16px 48px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 560, margin: "0 auto", color: T.textMuted }}>
              Scegli tra i nostri piatti preparati con passione. Ingredienti freschi, ricette
              tradizionali e servizio veloce direttamente al tuo tavolo.
            </p>
          </div>

          <CategoryFilter categories={categories} activeCat={activeCat} onCategoryChange={setActiveCat} />

          <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAdd={handleAddToCart}
                isLoadingOptions={loadingOptionsId === item.id}
              />
            ))}
            {filteredItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: T.textMuted }}>
                <p style={{ fontSize: 18 }}>Nessun piatto disponibile in questa categoria.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* ── Overlay sessione scaduta ── */}
      {expired && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", padding: 16 }}>
          <div style={{ background: T.bgCard, borderRadius: 24, backdropFilter: "blur(16px)", border: `1px solid ${T.border}`, maxWidth: 360, width: "100%", textAlign: "center", padding: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: isDark ? "rgba(239,68,68,0.15)" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: 28 }}>⏱</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>Sessione scaduta</h2>
            <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Il carrello è stato eliminato per inattività.<br />
              Scansiona di nuovo il QR Code per ordinare.
            </p>
            <button onClick={() => router.push("/")} style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "#064e3b", color: "#fff", fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer" }}>
              Torna alla home
            </button>
          </div>
        </div>
      )}

      {/* ── Warning scadenza ── */}
      {isWarning && !expired && (
        <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", zIndex: 50, pointerEvents: "none" }}>
          <div style={{ background: "#f97316", color: "#fff", padding: "12px 20px", borderRadius: 16, boxShadow: "0 8px 32px rgba(249,115,22,0.4)", display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 500 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span>
              Sessione in scadenza —{" "}
              <span style={{ fontWeight: 700 }}>
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ── Modal personalizzazione ── */}
      <CustomizationModal
        isOpen={showCustomization}
        itemName={currentItem?.name ?? ""}
        options={itemOptions}
        onClose={handleCloseModal}
        onConfirm={handleCustomizationConfirm}
      />
    </div>
  );
}
