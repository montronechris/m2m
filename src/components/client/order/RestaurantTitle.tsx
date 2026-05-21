"use client";

import { ChefHat } from "lucide-react";

interface RestaurantTitleProps {
  name: string;
  tableNumber?: string | null;
}

export function RestaurantTitle({ name, tableNumber }: RestaurantTitleProps) {
  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 🔧 FIX: Centrato con flex justify-center */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
            Ristorante Partner
          </span>
        </div>
        
        {/* 🔧 FIX: Titolo centrato */}
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
          {name}
        </h1>
        
        {tableNumber && (
          <p className="text-gray-500 text-sm font-medium">
            Tavolo {tableNumber} • Buon appetito! 🍽️
          </p>
        )}
      </div>
    </div>
  );
}