// src/app/(client)/cart/page.tsx
"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { getTableSession } from "@/lib/table-session";
import { getMenuItemOptions, type ModalOption, type CartCustomization } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Settings,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import CustomizationModal from "@/components/client/cart/CustomizationModal";
import NoteModal from "@/components/client/cart/NoteModal";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseHeaders = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
} as const;

const formatPrice = (cents: number): string => {
  if (typeof cents !== "number" || isNaN(cents)) return "0,00";
  return (cents / 100).toFixed(2).replace(".", ",");
};

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents());
  const clearCart = useCartStore((s) => s.clearCart);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateNote     = useCartStore((s) => s.updateNote);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof getTableSession>>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Stato modal personalizzazioni
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<{
    menuItemId: string;
    name: string;
    basePriceCents: number;
    customizationsKey: string;
  } | null>(null);
  const [itemOptions, setItemOptions] = useState<ModalOption[]>([]);

  // Stato modal nota
  const [showNoteModal, setShowNoteModal]     = useState(false);
  const [noteItem, setNoteItem]               = useState<{ orderItemId: string; name: string; note: string } | null>(null);

  useEffect(() => {
    const sess = getTableSession();
    setSession(sess);
    setSessionLoaded(true);
  }, []);

  // Fix 2: se il carrello è vuoto dopo il caricamento (es. F5 prima che initFromDB finisca)
  // aspettiamo un attimo — il redirect avviene solo se lo store rimane vuoto
  const storeLoading = useCartStore((s) => s.loading);
  const orderId = useCartStore((s) => s.orderId);

  useEffect(() => {
    if (!sessionLoaded || storeLoading) return;
    if (!session) return; // gestito già dalla schermata "sessione scaduta"
    const sessionId = session.sessionId;
    if (!sessionId) return;

    // Se lo store non è mai stato inizializzato (orderId null e items vuoti dopo il load),
    // redirect a /order con i parametri della sessione
    if (!storeLoading && orderId === null && items.length === 0) {
      const slug = session.restaurantSlug || "";
      const table = session.tableNumber || "";
      router.replace(`/order/${sessionId}?slug=${slug}&table=${table}`);
    }
  }, [sessionLoaded, storeLoading, orderId, items.length, session, router]);

  // Fix 3: timeout 15 minuti dall'ultima attività
  // Aggiorna last_activity su Supabase ad ogni azione utente,
  // e fa il redirect se l'utente è inattivo da 15 min
  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minuti
  const lastActivityRef = React.useRef<number>(Date.now());

  useEffect(() => {
    // Aggiorna il timestamp ad ogni interazione
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("click", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("touchstart", updateActivity);

    // Controlla ogni 30 secondi se il timeout è scaduto
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > TIMEOUT_MS) {
        clearInterval(interval);
        useCartStore.getState().clearCart();
        // Svuota anche l'ordine pending nel DB cambiando lo status
        const ordId = useCartStore.getState().orderId;
        if (ordId) {
          fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?id=eq.${ordId}`,
            {
              method: "PATCH",
              headers: {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify({ status: "expired" }),
            }
          );
        }
        router.replace("/");
      }
    }, 30_000);

    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      clearInterval(interval);
    };
  }, [router]);

  const sessionId = useMemo(() => session?.sessionId || null, [session]);
  const menuHref = sessionId ? `/order/${sessionId}` : "/";

  // ── APRI MODAL NOTA ──────────────────────────────────────────────────────
  const handleOpenNote = (orderItemId: string, name: string, currentNote: string) => {
    setNoteItem({ orderItemId, name, note: currentNote });
    setShowNoteModal(true);
  };

  const handleSaveNote = async (note: string) => {
    if (!noteItem) return;
    await updateNote(noteItem.orderItemId, note);
    setNoteItem(null);
  };

  // ── APRI MODAL PERSONALIZZAZIONI ─────────────────────────────────────────
  const handleOpenCustomization = async (menuItemId: string, customizationsKey: string) => {
    try {
      const options = await getMenuItemOptions(menuItemId);
      if (options.length === 0) {
        setError("Nessuna personalizzazione disponibile per questo piatto");
        return;
      }
      const item = items.find(
        (i) =>
          i.menuItemId === menuItemId &&
          JSON.stringify(i.customizations) === customizationsKey
      );
      if (!item) return;

      setCustomizingItem({
        menuItemId: item.menuItemId,
        name: item.name,
        basePriceCents: item.priceCents,
        customizationsKey,
      });
      setItemOptions(options);
      setShowCustomization(true);
    } catch (err) {
      console.warn("Opzioni non disponibili:", err);
      setError("Impossibile caricare le opzioni");
    }
  };

  // ── CONFERMA DAL MODAL (modifica personalizzazioni di un item esistente) ─
  const handleCustomizationConfirm = async (customizations: CartCustomization[]) => {
    if (!customizingItem) return;

    // Rimuovi il vecchio item e aggiungi quello aggiornato
    useCartStore.setState((state) => ({
      items: state.items.filter(
        (i) =>
          !(
            i.menuItemId === customizingItem.menuItemId &&
            JSON.stringify(i.customizations) === customizingItem.customizationsKey
          )
      ),
    }));

    // Aggiungi il nuovo item (scrive su DB)
    await addItem({
      menuItemId: customizingItem.menuItemId,
      name: customizingItem.name,
      basePriceCents: customizingItem.basePriceCents,
      customizations,
    });

    setShowCustomization(false);
    setCustomizingItem(null);
    setItemOptions([]);
  };

  // ── CHECKOUT ─────────────────────────────────────────────────────────────
  // L'ordine esiste già nel DB (creato da initFromDB con table_id corretto).
  // Il checkout aggiorna solo lo status da "pending" a "confirmed" e
  // aggiorna ordine + total_cents con i dati finali.
  const handleCheckout = async () => {
    if (items.length === 0) return;

    const currentSessionId = session?.sessionId;
    if (!currentSessionId) {
      setError("Sessione tavolo mancante. Scansiona di nuovo il QR.");
      return;
    }

    // Prendi l'orderId dallo store — è già stato creato con table_id corretto
    const activeOrderId = useCartStore.getState().orderId;
    if (!activeOrderId) {
      setError("Ordine non trovato. Ricarica la pagina e riprova.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Aggiorna l'ordine esistente: status → "pending" (visibile in cucina),
      // total_cents e campo ordine con i nomi dei piatti
      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${activeOrderId}`,
        {
          method: "PATCH",
          headers: { ...supabaseHeaders, Prefer: "return=minimal" },
          body: JSON.stringify({
            status: "confirmed",
            total_cents: totalCents,
            ordine: items.map((i) => `${i.quantity}x ${i.name}`).join(", "),
            confirmed_at: new Date().toISOString(), // timestamp esatto dell'invio
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!patchRes.ok) {
        const errText = await patchRes.text();
        throw new Error(`Errore conferma ordine: ${errText}`);
      }

      setSuccess(true);
      clearCart();
      // Reset orderId così il prossimo ordine creerà un nuovo record nel DB
      useCartStore.setState({ orderId: null });
      setTimeout(() => router.push(`/order/${currentSessionId}?slug=${session?.restaurantSlug || ""}`), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore durante l'invio.";
      console.error("Checkout fallito:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER STATI ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ordine Confermato! 🎉</h2>
          <p className="text-gray-600">
            La cucina ha ricevuto la tua comanda. Tra poco arriverà al tuo tavolo.
          </p>
          <p className="text-sm text-gray-400">Reindirizzamento in corso...</p>
        </div>
      </div>
    );
  }

  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Caricamento...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-5">
          <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Sessione scaduta</h2>
          <p className="text-gray-600 text-sm">Scansiona di nuovo il QR code al tavolo.</p>
          <Link href="/">
            <Button className="w-full bg-gray-900 hover:bg-green-600 transition-colors">
              Torna alla home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Il carrello è vuoto</h2>
          <p className="text-gray-600">
            Aggiungi qualche piatto dal menu per procedere con l'ordine.
          </p>
          <Link href={menuHref}>
            <Button className="w-full mt-2 bg-gray-900 hover:bg-green-600 transition-colors">
              Torna al Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── RENDER PRINCIPALE ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Il tuo Ordine
          </h1>
          <Link href={menuHref}>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-gray-600 hover:text-green-700 border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" /> Menu
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Errore</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => {
            const price = typeof item.priceCents === "number" ? item.priceCents : 0;
            const qty = typeof item.quantity === "number" ? item.quantity : 1;
            const lineTotal = price * qty;
            const customizationsKey = JSON.stringify(item.customizations);

            return (
              <Card
                key={`${item.orderItemId ?? item.menuItemId}-${customizationsKey}`}
                className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{formatPrice(price)} €</p>

                    {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                      <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-1">
                        <span className="font-medium">modifiche: </span>
                        {item.customizations.map((c, i) => (
                          <span key={i} className="bg-gray-100 rounded px-1 py-0.5">
                            {c.choiceName}
                            {c.priceModifierCents > 0 &&
                              ` (+${formatPrice(c.priceModifierCents)} €)`}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.note && (
                      <div className="mt-1.5 flex items-start gap-1 text-xs text-amber-600">
                        <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="italic line-clamp-2">{item.note}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-white hover:text-red-600 rounded-md"
                        onClick={() => updateQuantity(item.orderItemId!, -1)}
                        disabled={qty <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-gray-900 text-sm">{qty}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-white hover:text-green-600 rounded-md"
                        onClick={() => updateQuantity(item.orderItemId!, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs border-gray-300 hover:border-green-500 hover:text-green-600"
                      onClick={() => handleOpenCustomization(item.menuItemId, customizationsKey)}
                    >
                      <Settings className="w-3 h-3 mr-1" /> Personalizza
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-8 px-2 text-xs transition-colors ${
                        item.note
                          ? "border-amber-400 text-amber-600 hover:bg-amber-50"
                          : "border-gray-300 hover:border-amber-400 hover:text-amber-500"
                      }`}
                      onClick={() => handleOpenNote(item.orderItemId!, item.name, item.note ?? "")}
                    >
                      <StickyNote className="w-3 h-3 mr-1" />
                      {item.note ? "Modifica nota" : "Nota"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <p className="font-bold text-gray-900 min-w-[60px] text-right">
                      {formatPrice(lineTotal)} €
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => removeItem(item.orderItemId!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-lg bg-white mt-6">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center text-gray-600">
              <span>Subtotale</span>
              <span className="font-medium">{formatPrice(totalCents)} €</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
              <span>Totale Ordine</span>
              <span className="text-green-700">{formatPrice(totalCents)} €</span>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="w-full py-6 text-lg font-bold bg-gray-900 hover:bg-green-600 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Invio in corso...
                </span>
              ) : (
                "Conferma e Invia Ordine 🚀"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal Nota */}
      <NoteModal
        isOpen={showNoteModal}
        itemName={noteItem?.name ?? ""}
        initialNote={noteItem?.note ?? ""}
        onClose={() => { setShowNoteModal(false); setNoteItem(null); }}
        onSave={handleSaveNote}
      />

      {/* Modal Personalizzazioni */}
      <CustomizationModal
        isOpen={showCustomization}
        options={itemOptions}
        onClose={() => {
          setShowCustomization(false);
          setCustomizingItem(null);
          setItemOptions([]);
        }}
        onConfirm={handleCustomizationConfirm}
      />
    </div>
  );
}