// src/components/client/order/MenuItemCard.tsx

"use client";

import { Plus, Info, Leaf, WheatOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  is_vegetarian?: boolean;
  is_gluten_free?: boolean;
}

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    // 🔧 BOX DEFINITO: Bordo spesso, ombra marcata, sfondo bianco solido
    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">
              {item.name}
            </h3>
            {item.is_vegetarian && (
              <Leaf className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
            {item.is_gluten_free && (
              <WheatOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {item.description}
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
              €{(item.price_cents / 100).toFixed(2)}
            </span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button
          onClick={() => onAdd(item)}
          className="bg-gray-900 text-white p-3 rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/30 flex-shrink-0 group-hover:scale-110"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}