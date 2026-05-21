// src/components/client/cart/EmptyCart.tsx

"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyCartProps {
  menuHref: string;
}

export function EmptyCart({ menuHref }: EmptyCartProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Il carrello è vuoto
        </h2>
        <p className="text-gray-600">
          Aggiungi qualche piatto dal menu per procedere con l'ordine.
        </p>
        <Link href={menuHref}>
          <Button className="w-full mt-2 bg-gray-900 hover:bg-green-600 transition-colors">
            Torna al Menu
          </Button>
        </Link>
      </div>
    </div>
  );
}