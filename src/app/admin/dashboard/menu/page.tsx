// src/app/admin/dashboard/menu/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Trash2, Edit, Save, X, ToggleLeft, ToggleRight } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  category_id: string;
  is_available: boolean;
  image_url?: string;
};

type Category = {
  id: string;
  name: string;
  sort_order: number;
  restaurant_id: string;
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price_cents: 0,
    category_id: "",
    is_available: true
  });

  const [newCatName, setNewCatName] = useState("");
  const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  useEffect(() => {
    const fetchUserAndRestaurant = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) { setLoading(false); return; }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.restaurant_id) { setLoading(false); return; }

        setRestaurantId(profile.restaurant_id);
        fetchData(profile.restaurant_id);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchUserAndRestaurant();
  }, []);

  const fetchData = async (restId: string) => {
    if (!restId) return;
    try {
      setLoading(true);
      
      const { data: cats, error: catErr } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restId)
        .order('sort_order', { ascending: true });
      
      if (catErr) throw catErr;
      setCategories(cats || []);

      const categoryIds = (cats || []).map(c => c.id);
      let itemsData: MenuItem[] = [];

      if (categoryIds.length > 0) {
        const { data: itms, error: itemErr } = await supabase
          .from('menu_items')
          .select('*')
          .in('category_id', categoryIds)
          .order('name', { ascending: true });
        if (itemErr) throw itemErr;
        itemsData = itms || [];
      }
      setItems(itemsData);
    } catch (err: any) {
      console.error("Errore:", err);
      alert(`Errore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!currentItem.name || !currentItem.category_id) {
      alert("Nome e Categoria sono obbligatori!");
      return;
    }
    if (!categories.find(c => c.id === currentItem.category_id)) {
      alert("Categoria non valida.");
      return;
    }

    setSaving(true);
    try {
      const itemData = {
        name: currentItem.name,
        description: currentItem.description,
        price_cents: currentItem.price_cents,
        category_id: currentItem.category_id,
        is_available: currentItem.is_available,
        image_url: currentItem.image_url || null
      };

      let error;
      if (currentItem.id) {
        const { error: err } = await supabase.from('menu_items').update(itemData).eq('id', currentItem.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('menu_items').insert([itemData]);
        error = err;
      }
      if (error) throw error;
      
      if (restaurantId) fetchData(restaurantId);
      setIsEditing(false);
      setCurrentItem({ name: "", description: "", price_cents: 0, category_id: "", is_available: true });
    } catch (err: any) {
      console.error(err);
      alert("Errore nel salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Eliminare questo piatto?")) return;
    try {
      await supabase.from('menu_items').delete().eq('id', id);
      if (restaurantId) fetchData(restaurantId);
    } catch {
      alert("Errore nell'eliminazione");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !restaurantId) return;
    try {
      await supabase.from('menu_categories').insert([{ 
        name: newCatName, 
        sort_order: categories.length + 1,
        restaurant_id: restaurantId 
      }]);
      setNewCatName("");
      if (restaurantId) fetchData(restaurantId);
    } catch {
      alert("Errore creazione categoria");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const itemsInCat = items.filter(i => i.category_id === categoryId);
    if (itemsInCat.length > 0 && !confirm(`⚠️ Ci sono ${itemsInCat.length} piatti in questa categoria. Procedere comunque?`)) return;
    if (itemsInCat.length === 0 && !confirm("Eliminare questa categoria?")) return;

    try {
      await supabase.from('menu_categories').delete().eq('id', categoryId).eq('restaurant_id', restaurantId);
      if (restaurantId) fetchData(restaurantId);
    } catch {
      alert("Errore eliminazione categoria");
    }
  };

  if (loading && !restaurantId) return <PageLoader text="Verifica accesso..." />;
  if (!restaurantId) return <PageError text="Nessun ristorante associato" />;
  if (loading) return <PageLoader text="Caricamento menu..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">TR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestione Menu</h1>
              <p className="text-xs text-gray-500">Organizza i tuoi piatti e categorie</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-500/20 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> Nuovo Piatto
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Form Inserimento/Modifica */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-slide-down">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {currentItem.id ? <Edit className="w-5 h-5 text-green-600" /> : <Plus className="w-5 h-5 text-green-600" />}
                {currentItem.id ? "Modifica Piatto" : "Aggiungi Nuovo Piatto"}
              </h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome Piatto *</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={currentItem.name} 
                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} 
                    placeholder="Es. Spaghetti alla Carbonara"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoria *</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={currentItem.category_id}
                    onChange={(e) => setCurrentItem({...currentItem, category_id: e.target.value})}
                  >
                    <option value="">Seleziona categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Descrizione</label>
                <textarea 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                  rows={3}
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  placeholder="Ingredienti, allergeni, note..."
                />
              </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">Prezzo (€)</label>
    <div className="flex items-center gap-2">
      {/* Pulsante -0.50 */}
      <button
        type="button"
        onClick={() => setCurrentItem(prev => ({
          ...prev,
          price_cents: Math.max(0, (prev.price_cents || 0) - 50) // -50 centesimi
        }))}
        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-lg transition-all active:scale-95"
        title="Diminuisci di €0,50"
      >
        −
      </button>
      
      {/* Input Prezzo (libero, nessun arrotondamento) */}
      <input 
        type="number" 
        step="0.01"
        min="0"
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-center"
        value={currentItem.price_cents ? (currentItem.price_cents / 100).toFixed(2) : ""} 
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setCurrentItem({
            ...currentItem, 
            price_cents: !isNaN(val) ? Math.round(val * 100) : 0
          });
        }}
      />
      
      {/* Pulsante +0.50 */}
      <button
        type="button"
        onClick={() => setCurrentItem(prev => ({
          ...prev,
          price_cents: (prev.price_cents || 0) + 50 // +50 centesimi
        }))}
        className="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-md hover:shadow-lg"
        title="Aumenta di €0,50"
      >
        +
      </button>
    </div>
    <p className="text-xs text-gray-400 text-center">Pulsanti: step di €0,50 | Input libero: accetta qualsiasi decimale</p>
  </div>
  
  <div className="md:col-span-2 flex items-end">
    <button 
      type="button"
      onClick={() => setCurrentItem({...currentItem, is_available: !currentItem.is_available})}
      className={`w-full px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:bg-green-500/20 ${
        currentItem.is_available 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      {currentItem.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
      {currentItem.is_available ? 'Disponibile' : 'Non Disponibile'}
    </button>
  </div>
</div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleSaveItem} 
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-green-500/20 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />} 
                  {saving ? "Salvataggio..." : "Salva Modifiche"}
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setCurrentItem({}); }} 
                  className="px-5 py-2.5 bg-gray-100 hover:bg-green-500/20 text-gray-700 rounded-xl flex items-center gap-2 font-medium transition-all"
                >
                  <X className="w-4 h-4" /> Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sezione Categorie */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Categorie
            </h3>
          </div>
          <div className="p-5 flex flex-wrap items-center gap-4">
            <input 
              type="text" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nuova categoria..."
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button 
              onClick={handleAddCategory}
              className="px-5 py-2 bg-gray-900 hover:bg-green-500/20 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              + Aggiungi
            </button>
            
            <div className="flex gap-2 flex-wrap ml-auto">
              {categories.length === 0 ? (
                <span className="text-sm text-gray-400 italic">Nessuna categoria</span>
              ) : categories.map(cat => (
                <span 
                  key={cat.id} 
                  className="px-4 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full text-sm font-medium text-green-700 flex items-center gap-2 group hover:shadow-md transition-all"
                >
                  {cat.name}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                    className="w-5 h-5 flex items-center justify-center rounded-full text-green-400 hover:text-red-500 hover:bg-green-500/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Elimina categoria"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Lista Piatti */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Piatti ({items.length})</h3>
            {items.length > 0 && (
              <span className="text-sm text-gray-500">
                {items.filter(i => i.is_available).length} disponibili
              </span>
            )}
          </div>
          
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-gray-500 font-medium">Nessun piatto nel menu</p>
              <p className="text-sm text-gray-400 mt-1">Clicca su "Nuovo Piatto" per iniziare</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Piatto</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prezzo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => {
                    const catName = categories.find(c => c.id === item.category_id)?.name || "—";
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                            {catName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-700">
                            €{(item.price_cents / 100).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            item.is_available 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {item.is_available ? 'Attivo' : 'Nascosto'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setCurrentItem(item); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                              className="p-2 text-blue-600 hover:bg-green-500/20 rounded-lg transition-all"
                              title="Modifica"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)} 
                              className="p-2 text-red-600 hover:bg-green-500/20 rounded-lg transition-all"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Componenti di supporto
function PageLoader({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-200 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-700 font-medium">{text}</span>
      </div>
    </div>
  );
}

function PageError({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-red-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-red-600" />
        </div>
        <span className="text-red-700 font-medium">{text}</span>
      </div>
    </div>
  );
}