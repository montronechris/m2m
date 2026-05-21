// src/components/admin/MenuManager.tsx
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Plus, Trash2, Edit, Save, X, ToggleLeft, ToggleRight, 
  Utensils, AlertCircle, Loader2 
} from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category_id: string;
  is_available: boolean;
  image_url?: string | null;
};

type Category = {
  id: string;
  name: string;
  sort_order: number;
  restaurant_id: string;
};

interface MenuManagerProps {
  restaurantId: string;
  theme: "light" | "dark";
  onNotification: (message: string, type: "success" | "error") => void;
}

export default function MenuManager({ restaurantId, theme, onNotification }: MenuManagerProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price_cents: 0,
    category_id: "",
    is_available: true
  });
  const [newCatName, setNewCatName] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ===== FETCH DATI MENU =====
  const fetchData = async (restId: string) => {
    if (!restId) return;
    try {
      setLoading(true);
      
      // Fetch categorie con restaurant_id vincolato (fondamentale per RLS)
      const { data: cats, error: catErr } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restId)
        .order('sort_order', { ascending: true });
      
      if (catErr) throw catErr;
      setCategories(cats || []);

      // Fetch piatti solo se ci sono categorie
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
      console.error("❌ Errore fetch menu:", err);
      onNotification(`Errore caricamento: ${err.message || 'Controlla la console'}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchData(restaurantId);
  }, [restaurantId]);

  // ===== CRUD PIATTI =====
  const handleSaveItem = async () => {
    // Validazioni
    if (!currentItem.name?.trim()) {
      onNotification("Il nome del piatto è obbligatorio", "error");
      return;
    }
    if (!currentItem.category_id) {
      onNotification("Seleziona una categoria", "error");
      return;
    }
    if (!categories.find(c => c.id === currentItem.category_id)) {
      onNotification("Categoria non valida", "error");
      return;
    }

    setSaving(true);
    try {
      const itemData = {
        name: currentItem.name.trim(),
        description: currentItem.description?.trim() || null,
        price_cents: Math.round(Number(currentItem.price_cents) || 0),
        category_id: currentItem.category_id,
        is_available: !!currentItem.is_available,
        image_url: currentItem.image_url || null
      };

      let error;
      if (currentItem.id) {
        // UPDATE
        const { error: err } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', currentItem.id)
          .select()
          .single();
        error = err;
      } else {
        // INSERT
        const { error: err } = await supabase
          .from('menu_items')
          .insert([itemData])
          .select()
          .single();
        error = err;
      }
      
      if (error) throw error;
      
      // Refresh dati e reset form
      if (restaurantId) await fetchData(restaurantId);
      setIsEditing(false);
      setCurrentItem({ 
        name: "", description: "", price_cents: 0, 
        category_id: "", is_available: true 
      });
      onNotification(currentItem.id ? "Piatto aggiornato!" : "Piatto aggiunto!", "success");
      
    } catch (err: any) {
      console.error("❌ Errore salvataggio:", err);
      onNotification(`Errore: ${err.message || 'Controlla la console'}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Eliminare questo piatto?")) return;
    try {
      await supabase.from('menu_items').delete().eq('id', id);
      if (restaurantId) await fetchData(restaurantId);
      onNotification("Piatto eliminato", "success");
    } catch (err: any) {
      console.error("❌ Errore eliminazione:", err);
      onNotification(`Errore: ${err.message}`, "error");
    }
  };

  // ===== CRUD CATEGORIE =====
  const handleAddCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed || !restaurantId) {
      onNotification("Inserisci un nome valido", "error");
      return;
    }
    try {
      await supabase.from('menu_categories').insert([{
        name: trimmed,
        sort_order: categories.length + 1,
        restaurant_id: restaurantId
      }]);
      setNewCatName("");
      if (restaurantId) await fetchData(restaurantId);
      onNotification("Categoria aggiunta!", "success");
    } catch (err: any) {
      console.error("❌ Errore categoria:", err);
      onNotification(`Errore: ${err.message}`, "error");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const itemsInCat = items.filter(i => i.category_id === categoryId);
    if (itemsInCat.length > 0 && !confirm(`⚠️ ${itemsInCat.length} piatti in questa categoria. Procedere?`)) return;
    if (itemsInCat.length === 0 && !confirm("Eliminare questa categoria?")) return;
    
    try {
      await supabase
        .from('menu_categories')
        .delete()
        .eq('id', categoryId)
        .eq('restaurant_id', restaurantId);
      if (restaurantId) await fetchData(restaurantId);
      onNotification("Categoria eliminata", "success");
    } catch (err: any) {
      console.error("❌ Errore eliminazione categoria:", err);
      onNotification(`Errore: ${err.message}`, "error");
    }
  };

  // ===== STILI DINAMICI PER TEMA =====
  const bg = theme === "light" ? "bg-white" : "bg-[#1a1a25]";
  const bgSoft = theme === "light" ? "bg-gray-50" : "bg-white/5";
  const border = theme === "light" ? "border-gray-200" : "border-white/10";
  const textPrimary = theme === "light" ? "text-gray-900" : "text-white";
  const textSecondary = theme === "light" ? "text-gray-600" : "text-gray-400";
  const inputBg = theme === "light" ? "bg-gray-50 focus:bg-white" : "bg-[#0f0f18]";
  const inputBorder = theme === "light" ? "border-gray-300" : "border-white/10";
  const hoverRow = theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5";

  // ===== LOADING STATE =====
  if (loading && !categories.length && !items.length) {
    return (
      <div className={`rounded-2xl ${bg} border ${border} p-12 text-center`}>
        <Loader2 className={`w-8 h-8 mx-auto mb-4 animate-spin ${theme === "light" ? "text-green-600" : "text-green-400"}`} />
        <p className={textSecondary}>Caricamento menu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header sezione */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Gestione Menu</h2>
          <p className={`${textSecondary} text-sm`}>Organizza piatti e categorie</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" /> Nuovo Piatto
          </button>
        )}
      </div>

      {/* Form Inserimento/Modifica */}
      {isEditing && (
        <div className={`${bg} rounded-2xl border ${border} overflow-hidden shadow-lg`}>
          <div className={`px-6 py-4 border-b ${border} ${bgSoft}`}>
            <h3 className={`text-lg font-semibold ${textPrimary} flex items-center gap-2`}>
              {currentItem.id ? <Edit className="w-5 h-5 text-green-500"/> : <Plus className="w-5 h-5 text-green-500"/>}
              {currentItem.id ? "Modifica Piatto" : "Aggiungi Nuovo Piatto"}
            </h3>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${textSecondary}`}>Nome Piatto *</label>
                <input 
                  type="text"
                  className={`w-full px-4 py-2.5 ${inputBg} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${textPrimary} placeholder-gray-500 transition-all`}
                  value={currentItem.name || ""} 
                  onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} 
                  placeholder="Es. Spaghetti alla Carbonara"
                />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${textSecondary}`}>Categoria *</label>
                <select 
                  className={`w-full px-4 py-2.5 ${inputBg} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${textPrimary} transition-all`}
                  value={currentItem.category_id || ""}
                  onChange={(e) => setCurrentItem({...currentItem, category_id: e.target.value})}
                >
                  <option value="">Seleziona categoria</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${textSecondary}`}>Descrizione</label>
              <textarea 
                className={`w-full px-4 py-2.5 ${inputBg} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${textPrimary} placeholder-gray-500 resize-none transition-all`}
                rows={3}
                value={currentItem.description || ""}
                onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                placeholder="Ingredienti, allergeni, note..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${textSecondary}`}>Prezzo (€)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2.5 ${inputBg} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${textPrimary} transition-all`}
                  value={currentItem.price_cents ? (currentItem.price_cents / 100).toFixed(2) : ""} 
                  onChange={(e) => setCurrentItem({
                    ...currentItem, 
                    price_cents: Math.round(parseFloat(e.target.value || "0") * 100)
                  })} 
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button 
                  type="button"
                  onClick={() => setCurrentItem({...currentItem, is_available: !currentItem.is_available})}
                  className={`w-full px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    currentItem.is_available 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                  }`}
                >
                  {currentItem.is_available ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>}
                  {currentItem.is_available ? 'Disponibile' : 'Non Disponibile'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={handleSaveItem} 
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin"/>
                ) : (
                  <Save className="w-4 h-4"/>
                )} 
                {saving ? "Salvataggio..." : "Salva Modifiche"}
              </button>
              <button 
                onClick={() => { setIsEditing(false); setCurrentItem({}); }} 
                className={`px-5 py-2.5 ${bgSoft} hover:bg-white/10 ${textSecondary} rounded-xl flex items-center gap-2 font-medium transition-all`}
              >
                <X className="w-4 h-4"/> Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sezione Categorie */}
      <section className={`${bg} rounded-2xl border ${border} overflow-hidden shadow-lg`}>
        <div className={`px-6 py-4 border-b ${border} ${bgSoft}`}>
          <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
            <span className="w-2 h-2 bg-green-500 rounded-full"/> Categorie
          </h3>
        </div>
        <div className="p-5 flex flex-wrap items-center gap-4">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nuova categoria..."
            className={`flex-1 min-w-[200px] px-4 py-2 ${inputBg} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${textPrimary} placeholder-gray-500 transition-all`}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button 
            onClick={handleAddCategory}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            + Aggiungi
          </button>
          
          <div className="flex gap-2 flex-wrap ml-auto">
            {categories.length === 0 ? (
              <span className={`text-sm ${textSecondary} italic`}>Nessuna categoria</span>
            ) : categories.map(cat => (
              <span 
                key={cat.id} 
                className="px-4 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm font-medium text-green-400 flex items-center gap-2 group hover:bg-green-500/20 transition-all"
              >
                {cat.name}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-green-400 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                  title="Elimina categoria"
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Lista Piatti */}
      <section className={`${bg} rounded-2xl border ${border} overflow-hidden shadow-lg`}>
        <div className={`px-6 py-4 border-b ${border} ${bgSoft} flex items-center justify-between`}>
          <h3 className={`font-semibold ${textPrimary}`}>Piatti ({items.length})</h3>
          {items.length > 0 && (
            <span className={`text-sm ${textSecondary}`}>
              {items.filter(i => i.is_available).length} disponibili
            </span>
          )}
        </div>
        
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-16 h-16 ${bgSoft} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Utensils className={`w-8 h-8 ${textSecondary}`}/>
            </div>
            <p className={`${textSecondary} font-medium`}>Nessun piatto nel menu</p>
            <p className={`text-sm ${textSecondary} mt-1 opacity-70`}>Clicca su "Nuovo Piatto" per iniziare</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={bgSoft}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Piatto</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Categoria</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Prezzo</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Stato</th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Azioni</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${border}`}>
                {items.map(item => {
                  const catName = categories.find(c => c.id === item.category_id)?.name || "—";
                  return (
                    <tr key={item.id} className={`${hoverRow} transition-colors group`}>
                      <td className="px-6 py-4">
                        <div className={`font-semibold ${textPrimary}`}>{item.name}</div>
                        {item.description && (
                          <div className={`text-sm ${textSecondary} mt-0.5 line-clamp-1`}>{item.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 ${bgSoft} ${textSecondary} rounded-lg text-xs font-medium`}>
                          {catName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-400">
                          €{(item.price_cents / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          item.is_available 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-gray-500'}`} />
                          {item.is_available ? 'Attivo' : 'Nascosto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setCurrentItem(item); setIsEditing(true); }} 
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Modifica"
                          >
                            <Edit className="w-4 h-4"/>
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)} 
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4"/>
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
    </div>
  );
}