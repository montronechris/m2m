// src/app/(client)/cart/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore"; // ✅ Import corretto
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle, AlertCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";

// Costanti Supabase
const SUPABASE_URL = "https://ylzuyhmtzfqnoyqkwiqx.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsenV5aG10emZxbm95cWt3aXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDMxNzEsImV4cCI6MjA5NDE3OTE3MX0.eNksInG0OeM_CHnWnCNfrHOy1oYHL6_QMHI0M-2VAkw";

export default function CartPage() {
  const router = useRouter();
  // Usa lo store importato
  const { items, tableId, restaurantSlug, updateQuantity, removeItem, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calcola il totale direttamente qui (più semplice e reattivo)
  const totalCents = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!tableId || !restaurantSlug) {
      setError("Contesto mancante. Torna al menu e riprova.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Trova ID Ristorante
      const restRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?slug=eq.${restaurantSlug}`, {
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      if (!restRes.ok) throw new Error("Errore di connessione al database");
      const restaurants = await restRes.json();
      if (restaurants.length === 0) throw new Error("Ristorante non trovato");
      const restaurantId = restaurants[0].id;

      // 2️⃣ Trova ID Tavolo (UUID) dal numero
      const tableRes = await fetch(`${SUPABASE_URL}/rest/v1/tables?restaurant_id=eq.${restaurantId}&table_number=eq.${tableId}&is_active=eq.true`, {
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      if (!tableRes.ok) throw new Error("Errore nel recupero dati tavolo");
      const tables = await tableRes.json();
      if (tables.length === 0) throw new Error(`Tavolo n. ${tableId} non disponibile per questo ristorante`);
      const actualTableId = tables[0].id;

      // 3️⃣ Crea Ordine
      const orderPayload = {
        table_id: actualTableId,
        restaurant_id: restaurantId,
        total_cents: totalCents,
        status: 'pending',
        notes: ''
      };

      const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(`Errore creazione ordine: ${errText}`);
      }
      
      const createdOrder = await orderRes.json();
      const orderId = createdOrder[0].id;

      // 4️⃣ Crea Righe Ordine (Order Items)
      const orderItems = items.map(item => ({
        order_id: orderId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price_cents: item.priceCents,
        customizations: item.customizations || {}
      }));

      const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
        method: 'POST',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(orderItems)
      });

      if (!itemsRes.ok) {
        const errText = await itemsRes.text();
        throw new Error(`Errore salvataggio piatti: ${errText}`);
      }

      // ✅ Successo
      setSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push(`/menu/${restaurantSlug}/${tableId}?order=success`);
      }, 2500);

    } catch (err: any) {
      console.error("💥 Checkout fallito:", err);
      setError(err.message || "Si è verificato un errore durante l'invio.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Stato: Ordine Inviato con Successo
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ordine Confermato! 🎉</h2>
          <p className="text-gray-600">La cucina ha ricevuto la tua comanda. Tra poco arriverà al tuo tavolo.</p>
          <p className="text-sm text-gray-400">Reindirizzamento al menu in corso...</p>
        </div>
      </div>
    );
  }

  // 🟡 Stato: Carrello Vuoto
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Il carrello è vuoto</h2>
          <p className="text-gray-600">Aggiungi qualche piatto dal menu per procedere con l'ordine.</p>
          <Link href={`/menu/${restaurantSlug || 'cucinadalaghetti'}/${tableId || '1'}`}>
            <Button className="w-full mt-2 bg-gray-900 hover:bg-green-600 transition-colors">Torna al Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 🔵 Stato: Carrello Pieno
  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Carrello */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Il tuo Ordine</h1>
          <Link href={`/menu/${restaurantSlug}/${tableId}`}>
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 hover:text-green-700 border-gray-200">
              <ArrowLeft className="w-4 h-4" /> Menu
            </Button>
          </Link>
        </div>

        {/* Messaggio di Errore */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Errore nell'invio</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Lista Piatti */}
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.menuItemId} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                
                {/* Info Piatto */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{(item.priceCents / 100).toFixed(2)}€ cad.</p>
                </div>

                {/* Controlli Quantità */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200 self-start sm:self-center">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0 hover:bg-white hover:text-red-600 hover:border-red-200 rounded-md border-gray-200 bg-transparent shadow-none"
                    onClick={() => updateQuantity(item.menuItemId, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <span className="w-8 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0 hover:bg-white hover:text-green-600 hover:border-green-200 rounded-md border-gray-200 bg-transparent shadow-none"
                    onClick={() => updateQuantity(item.menuItemId, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Totale Riga & Rimuovi */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <p className="font-bold text-gray-900 min-w-[60px] text-right">
                    {((item.priceCents * item.quantity) / 100).toFixed(2)}€
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-full border-transparent bg-transparent shadow-none"
                    onClick={() => removeItem(item.menuItemId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Riepilogo & Checkout */}
        <Card className="border-0 shadow-lg bg-white mt-6">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center text-gray-600">
              <span>Subtotale</span>
              <span>{(totalCents / 100).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
              <span>Totale Ordine</span>
              <span className="text-green-700">{(totalCents / 100).toFixed(2)}€</span>
            </div>
            
            <Button 
              onClick={handleCheckout} 
              disabled={loading || items.length === 0}
              className="w-full py-6 text-lg font-bold bg-gray-900 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-gray-900/10 hover:shadow-green-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Invio in corso...
                </span>
              ) : (
                "Conferma e Invia Ordine 🚀"
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
