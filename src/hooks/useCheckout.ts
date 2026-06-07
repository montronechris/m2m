// src/hooks/useCheckout.ts

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { getTableSession } from "@/lib/table-session";
import {
  getRestaurantBySlug,
  getTableByToken,
  getOrCreatePendingOrder,
  addItemToOrder,
} from "@/lib/api-service";

type CheckoutStatus = "idle" | "submitting" | "success" | "error";

export function useCheckout() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const totalCents = items.reduce((sum, item) => {
    const price = item.priceCents ?? 0;
    const qty = item.quantity ?? 1;
    return sum + price * qty;
  }, 0);

  const checkout = async () => {
    if (items.length === 0) {
      setError("Il carrello è vuoto.");
      return;
    }

    const session = getTableSession();
    const tableCode = session?.tableCode;
    const restaurantSlug = session?.restaurantSlug;

    if (!tableCode || !restaurantSlug) {
      setError("Sessione tavolo mancante. Scansiona di nuovo il QR.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      console.log("🚀 Checkout avviato", { tableCode, restaurantSlug, itemsCount: items.length });

      // 1. Trova ristorante
      const restaurant = await getRestaurantBySlug(restaurantSlug);
      if (!restaurant?.id) throw new Error("Ristorante non trovato");

      // 2. Trova tavolo
      const table = await getTableByToken(restaurant.id, tableCode);
      if (!table?.id) throw new Error("Tavolo non trovato o non attivo");

      // 3. Crea o recupera ordine pending
      const order = await getOrCreatePendingOrder(table.id, restaurant.id);
      if (!order?.id) throw new Error("Ordine non creato");

      // 4. Aggiungi ogni item all'ordine
      await Promise.all(
        items.map((item) =>
          addItemToOrder(order.id, {
            menuItemId: item.menuItemId,
            name: item.name,
            priceCents: item.priceCents ?? 0,
            quantity: item.quantity ?? 1,
            customizations: item.customizations ?? [],
          })
        )
      );

      console.log("✅ Ordine creato con successo", order.id);
      setStatus("success");
      clearCart();
      setTimeout(() => router.push(`/scan/${tableCode}`), 2500);
    } catch (err: any) {
      console.error("❌ Checkout fallito:", err);
      setError(err.message || "Errore durante l'invio dell'ordine.");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
  };

  return { status, error, totalCents, checkout, reset };
}