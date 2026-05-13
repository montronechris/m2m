// src/app/(client)/menu/[restaurantSlug]/[tableId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import type { MenuItem, MenuCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Info, Clock, MapPin, Instagram, Facebook, Globe, ChefHat } from "lucide-react";
import Link from "next/link";

const SUPABASE_URL = "https://ylzuyhmtzfqnoyqkwiqx.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsenV5aG10emZxbm95cWt3aXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDMxNzEsImV4cCI6MjA5NDE3OTE3MX0.eNksInG0OeM_CHnWnCNfrHOy1oYHL6_QMHI0M-2VAkw";

export default function MenuPage() {
  const params = useParams();
  const restaurantSlug = (params.restaurantSlug as string) || "cucinadalaghetti";
  const tableId = (params.tableId as string) || "1";

  const setContext = useCartStore(s => s.setContext);
  const addItem = useCartStore(s => s.addItem);
  const cartCount = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));

  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseFetch = async (table: string, query: string = '') => {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    if (!response.ok) throw new Error(`Errore DB: ${response.status}`);
    return await response.json();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔍 Caricamento dati per:", restaurantSlug);

        // 1. Carica Ristorante
        const rests = await supabaseFetch('restaurants', `?slug=eq.${restaurantSlug}`);
        if (!rests || rests.length === 0) throw new Error(`Ristorante "${restaurantSlug}" non trovato.`);
        const rest = rests[0];
        setRestaurant(rest);

        // 2. Carica Tavolo
        const tables = await supabaseFetch('tables', `?restaurant_id=eq.${rest.id}&table_number=eq.${tableId}&is_active=eq.true`);
        if (!tables || tables.length === 0) throw new Error(`Tavolo ${tableId} non attivo.`);
        setContext(tables[0].id, restaurantSlug);

        // 3. Carica Categorie
        const cats = await supabaseFetch('menu_categories', `?restaurant_id=eq.${rest.id}&is_visible=eq.true&order=sort_order.asc`);
        setCategories(cats || []);

        // 4. Carica Piatti
        let menuItems: any[] = [];
        if (cats && cats.length > 0) {
          const catIds = cats.map((c: any) => c.id).join(',');
           const allItems = await supabaseFetch('menu_items', `?is_available=eq.true`);
           menuItems = (allItems || []).filter((item: any) => catIds.includes(item.category_id));
        }

        setItems(menuItems.map((item: any) => ({
          ...item,
          allergens: item.allergens || [],
          options: [],
          is_vegetarian: item.is_vegetarian ?? false,
          is_gluten_free: item.is_gluten_free ?? false
        })));

      } catch (err: any) {
        console.error("💥 Errore:", err);
        setError(err.message || "Errore di caricamento.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantSlug, tableId, setContext]);

  const filtered = activeCat === "all" ? items : items.filter(i => i.category_id === activeCat);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center space-y-4">
          <Info className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Qualcosa è andato storto</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Riprova</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-sans selection:bg-green-200 selection:text-green-900">
      
      {/* SFONDO DECORATIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-20 bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-600/20 group-hover:shadow-green-600/40 group-hover:scale-105 transition-all duration-300">
                <ChefHat className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-green-700 text-[9px] font-black rounded-full flex items-center justify-center border-2 border-green-600">TR</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-gray-900 tracking-tight leading-none group-hover:text-green-700 transition-colors">TavolaRapida</span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-0.5">Menu Digitale</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sei al</span>
                <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">Tavolo {tableId}</span>
              </div>
              <Link href="/cart" className="relative group">
                <span className="absolute -inset-1 bg-green-400/20 rounded-full blur-md group-hover:bg-green-400/40 transition-opacity"></span>
                <div className="relative flex items-center gap-2 bg-gray-900 hover:bg-green-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-gray-900/20 hover:shadow-green-600/30 transition-all duration-300 transform hover:-translate-y-0.5">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm font-bold hidden xs:block">Ordine</span>
                  {cartCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-gray-900 animate-bounce-short">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 py-10 px-4 text-center border-b border-gray-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto space-y-2">
          <h3 className="text-xl md:text-2xl font-black text-green-600 uppercase tracking-[0.2em] mb-2">
            Menu Digitale
          </h3>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Gusta l'autenticità <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
              direttamente al tavolo
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mt-4">
            Scegli tra i nostri piatti preparati con passione. Ingredienti freschi, ricette tradizionali e servizio veloce.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 space-y-8">
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant={activeCat === "all" ? "default" : "outline"} onClick={() => setActiveCat("all")} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 shadow-sm ${activeCat === "all" ? "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105" : "bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50"}`}>Tutti i Piatti</Button>
          {categories.map(cat => (
            <Button key={cat.id} variant={activeCat === cat.id ? "default" : "outline"} onClick={() => setActiveCat(cat.id)} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 shadow-sm ${activeCat === cat.id ? "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105" : "bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50"}`}>{cat.name}</Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white/50 rounded-3xl border border-white/60 backdrop-blur-sm">
              <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun piatto disponibile in questa categoria.</p>
            </div>
          ) : (
            filtered.map(item => (
              <Card key={item.id} className="group relative border-0 shadow-lg hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col hover:-translate-y-1">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden rounded-t-3xl">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">🍝</div>
                    )}
                    <div className="absolute bottom-4 right-4">
                       <Badge className="bg-white text-gray-900 font-bold text-base px-4 py-1.5 rounded-full shadow-lg border-0">
                         {(item.price_cents / 100).toFixed(2)}€
                       </Badge>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{item.description}</p>
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200/60">
                      <div className="flex gap-2">
                        {item.is_vegetarian && <Badge variant="secondary" className="bg-green-100/50 text-green-800 border-green-200 text-xs px-2 py-0.5 rounded-md">🌿 Veg</Badge>}
                        {item.is_gluten_free && <Badge variant="secondary" className="bg-orange-100/50 text-orange-800 border-orange-200 text-xs px-2 py-0.5 rounded-md">🌾 GF</Badge>}
                      </div>
                      <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-gray-900 hover:bg-green-600 text-white transition-all shadow-lg hover:shadow-green-600/30 hover:scale-110" onClick={() => addItem({ menuItemId: item.id, name: item.name, priceCents: item.price_cents, quantity: 1, customizations: { selectedChoices: [], notes: "" } })}><Plus className="w-5 h-5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-gray-900 text-white py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center justify-center md:justify-start gap-2 text-green-400"><Info className="w-5 h-5" /> Il Ristorante</h4>
            <p className="text-gray-400 text-sm"><strong className="text-white">{restaurant?.name}</strong> offre cucina autentica. Ordina dal tavolo per velocità.</p>
          </div>
          <div className="space-y-3 border-l-0 md:border-l md:border-r border-gray-800 px-0 md:px-6">
            <h4 className="font-bold text-lg flex items-center justify-center gap-2 text-white">⚡ Powered by TavolaRapida</h4>
            <p className="text-gray-400 text-sm">Tecnologia semplice per ristoranti moderni. Niente app, solo QR Code.</p>
            <Link href="/" className="text-green-400 text-sm font-semibold hover:text-green-300">Scopri di più →</Link>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center justify-center md:justify-end gap-2 text-white">Social <Globe className="w-5 h-5 text-blue-400" /></h4>
            <div className="flex justify-center md:justify-end gap-4 text-gray-500"><a href="#" className="hover:text-white"><Instagram className="w-5 h-5" /></a><a href="#" className="hover:text-white"><Facebook className="w-5 h-5" /></a></div>
            <p className="text-xs text-gray-600 pt-2">&copy; 2026 TavolaRapida. <Link href="#" className="underline">Privacy</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
