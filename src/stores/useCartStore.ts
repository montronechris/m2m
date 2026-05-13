// src/stores/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
  customizations?: any;
};

type CartState = {
  items: CartItem[];
  tableId: string | null;
  restaurantSlug: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void; // Delta può essere +1 o -1
  clearCart: () => void;
  setContext: (tableId: string, restaurantSlug: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      restaurantSlug: null,

      // Getter per il totale calcolato dinamicamente
      get totalCents() {
        return get().items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
      },

      setContext: (tableId, restaurantSlug) => set({ 
        tableId: String(tableId), 
        restaurantSlug: String(restaurantSlug) 
      }),

      addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex(i => i.menuItemId === newItem.menuItemId);
        
        if (existingIndex >= 0) {
          // Se esiste già, aumenta la quantità
          const newItems = [...state.items];
          newItems[existingIndex].quantity += newItem.quantity;
          return { items: newItems };
        }
        
        // Altrimenti aggiungi nuovo
        return { items: [...state.items, newItem] };
      }),

      removeItem: (menuItemId) => set((state) => ({
        items: state.items.filter(i => i.menuItemId !== menuItemId)
      })),

      updateQuantity: (menuItemId, delta) => set((state) => {
        return {
          items: state.items.map(item => {
            if (item.menuItemId === menuItemId) {
              // Calcola nuova quantità, minimo 1
              const newQty = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQty };
            }
            return item;
          })
        };
      }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'tavolarapida-cart-v2', // Cambiato nome versione per pulire cache vecchia
      partialize: (state) => ({ items: state.items }), // Salva solo gli items
    }
  )
);