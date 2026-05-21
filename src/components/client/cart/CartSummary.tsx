// src/components/client/cart/CartSummary.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CartSummaryProps {
  totalCents: number;
  loading: boolean;
  onCheckout: () => void;
  formatPrice: (cents: number) => string;
}

export function CartSummary({
  totalCents,
  loading,
  onCheckout,
  formatPrice,
}: CartSummaryProps) {
  return (
    <Card className="border-0 shadow-lg bg-white mt-6">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-center text-gray-600">
          <span>Subtotale</span>
          <span className="font-medium">{formatPrice(totalCents)}€</span>
        </div>
        <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
          <span>Totale Ordine</span>
          <span className="text-green-700">{formatPrice(totalCents)}€</span>
        </div>
        <Button
          onClick={onCheckout}
          disabled={loading}
          className="w-full py-6 text-lg font-bold bg-gray-900 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-gray-900/10 hover:shadow-green-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
  );
}