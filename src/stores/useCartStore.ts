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
  updateQuantity: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  setContext: (tableId: string, restaurantSlug: string) => void;
  // Aggiungi getTotal qui se vuoi usarlo
  getTotal: () => number; 
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      restaurantSlug: null,

      // Implementazione di getTotal
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
      },

      setContext: (tableId, restaurantSlug) => set({ 
        tableId: String(tableId), 
        restaurantSlug: String(restaurantSlug) 
      }),

      addItem: (newItem) => set((state) => {
        const existing = state.items.find(i => i.menuItemId === newItem.menuItemId);
        if (existing) {
          return {
            items: state.items.map(i => 
              i.menuItemId === newItem.menuItemId 
                ? { ...i, quantity: i.quantity + newItem.quantity } 
                : i
            )
          };
        }
        return { items: [...state.items, newItem] };
      }),

      removeItem: (menuItemId) => set((state) => ({
        items: state.items.filter(i => i.menuItemId !== menuItemId)
      })),

      updateQuantity: (menuItemId, delta) => set((state) => ({
        items: state.items.map(item => {
          if (item.menuItemId === menuItemId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
      })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'tavolarapida-cart-v2',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
