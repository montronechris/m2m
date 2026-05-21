// src/components/client/cart/CartItemCard.tsx

"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CartItem {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
  customizations?: Record<string, string>;
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  formatPrice: (cents: number) => string;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  formatPrice,
}: CartItemCardProps) {
  const price = typeof item.priceCents === "number" ? item.priceCents : 0;
  const qty = typeof item.quantity === "number" ? item.quantity : 1;
  const lineTotal = price * qty;
  const renderKey = `${item.menuItemId}-${JSON.stringify(
    item.customizations ?? {}
  )}`;

  return (
    <Card
      key={renderKey}
      className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatPrice(price)}€ cad.
          </p>
          {item.customizations &&
            Object.keys(item.customizations).length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {Object.entries(item.customizations)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
              </p>
            )}
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1.5 border border-gray-200 self-start sm:self-center">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-white hover:text-red-600 rounded-md"
            onClick={() => onUpdateQuantity(item.menuItemId, -1)}
            disabled={qty <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center font-bold text-gray-900 text-sm">
            {qty}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-white hover:text-green-600 rounded-md"
            onClick={() => onUpdateQuantity(item.menuItemId, 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <p className="font-bold text-gray-900 min-w-[60px] text-right">
            {formatPrice(lineTotal)}€
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
            onClick={() => onRemove(item.menuItemId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}