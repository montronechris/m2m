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
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMenuItemOptions, type ModalOption, type CartCustomization } from "@/lib/api-service";
import { useCartExpiry } from "@/hooks/useCartExpiry";
import CustomizationModal from "@/components/client/cart/CustomizationModal";

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const initialSlug = searchParams.get("slug") || "cucinadalaghetti";

  const initFromDB   = useCartStore((s) => s.initFromDB);
  const addItem      = useCartStore((s) => s.addItem);
  const cartCount    = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));

  const { restaurant, tableNumber, categories, items, loading, error, tableId, restaurantId } =
    useOrderSession(sessionId, initialSlug);

  useEffect(() => {
    if (!tableId || !restaurantId) return;
    initFromDB(tableId, restaurantId, initialSlug, sessionId);
  }, [tableId, restaurantId, initialSlug, sessionId, initFromDB]);

  const router = useRouter();

  const [expired, setExpired]               = useState(false);
  const [activeCat, setActiveCat]           = useState("all");

  const { isWarning, secondsLeft, resetTimer } = useCartExpiry(() => {
    setExpired(true);
  });
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentItem, setCurrentItem]       = useState<any>(null);
  const [itemOptions, setItemOptions]       = useState<ModalOption[]>([]);
  // quale item sta caricando le opzioni (mostra spinner sul suo bottone "+")
  const [loadingOptionsId, setLoadingOptionsId] = useState<string | null>(null);

  const cartHref = `/cart/${sessionId}?slug=${searchParams.get("slug")}&table=${searchParams.get("table")}`;

  // ─── AGGIUNTA AL CARRELLO ────────────────────────────────────────────────

  const handleAddToCart = async (item: any) => {
    setLoadingOptionsId(item.id);
    try {
      const options = await getMenuItemOptions(item.id);
      if (options.length > 0) {
        setCurrentItem(item);
        setItemOptions(options);
        setShowCustomization(true);
        return; // il finally resetta lo spinner
      }
    } catch (err) {
      console.warn("[OrderPage] Opzioni non disponibili, aggiungo direttamente:", err);
    } finally {
      setLoadingOptionsId(null);
    }

    // Nessuna opzione → aggiunta diretta senza personalizzazioni
    await addItem({
      menuItemId: item.id,
      name: item.name,
      basePriceCents: item.price_cents,
      customizations: [],
    });
  };

  // ─── CONFERMA DAL MODAL ──────────────────────────────────────────────────

  const handleCustomizationConfirm = async (customizations: CartCustomization[]) => {
    if (!currentItem) return;
    await addItem({
      menuItemId:    currentItem.id,
      name:          currentItem.name,
      basePriceCents: currentItem.price_cents,  // centesimi base dal DB
      customizations,                            // CartCustomization[] con priceModifierCents
    });
    setCurrentItem(null);
    setItemOptions([]);
  };

  const handleCloseModal = () => {
    setShowCustomization(false);
    setCurrentItem(null);
    setItemOptions([]);
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/40 via-white to-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Caricamento menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/40 via-white to-white p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-5 border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Accesso Non Consentito</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-400">Per ordinare, devi scansionare il QR Code presente sul tuo tavolo.</p>
          <Link href="/scan/TAV1-X9Z2">
            <Button className="w-full bg-gray-900 hover:bg-green-600">Simula Scansione Tavolo 1</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems =
    activeCat === "all" ? items : items.filter((i) => i.category_id === activeCat);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white font-sans text-gray-900 relative">
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-[100px] -z-0 pointer-events-none" />

      <div className="relative z-10">
        <OrderHeader cartCount={cartCount} cartHref={cartHref} />
        <RestaurantTitle name={restaurant?.name || "Ristorante"} tableNumber={tableNumber} />

        <main className="max-w-4xl mx-auto px-4 pb-12">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Scegli tra i nostri piatti preparati con passione. Ingredienti freschi, ricette
              tradizionali e servizio veloce direttamente al tuo tavolo.
            </p>
          </div>

          <CategoryFilter categories={categories} activeCat={activeCat} onCategoryChange={setActiveCat} />

          <div className="grid gap-4 mt-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAdd={handleAddToCart}
                isLoadingOptions={loadingOptionsId === item.id}
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">Nessun piatto disponibile in questa categoria.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* ── Overlay scadenza sessione ─────────────────────────────────── */}
      {expired && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full text-center p-8 space-y-5">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⏱</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Sessione scaduta</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Il carrello è stato eliminato per inattività.<br />
              Scansiona di nuovo il QR Code per ordinare.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-gray-900 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
            >
              Torna alla home
            </button>
          </div>
        </div>
      )}

      {/* ── Warning 2 minuti alla scadenza ──────────────────────────────── */}
      {isWarning && !expired && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-orange-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium">
            <span className="text-lg">⚠️</span>
            <span>
              Sessione in scadenza —{" "}
              <span className="font-bold tabular-nums">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Modal personalizzazione — itemName mostra il nome del piatto nell'header */}
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