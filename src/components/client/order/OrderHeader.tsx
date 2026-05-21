"use client";

import Link from "next/link";
import { ShoppingCart, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderHeaderProps {
  cartCount: number;
  cartHref: string;
}

export function OrderHeader({ cartCount, cartHref }: OrderHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 🔧 FIX: Link alla home */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 group-hover:scale-105 transition-all duration-300">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 tracking-tight leading-none group-hover:text-green-700 transition-colors">
              TavolaRapida
            </span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Menu Digitale
            </span>
          </div>
        </Link>

        {/* CARRELLO */}
        <Link href={cartHref}>
          <Button
            variant="outline"
            className="relative flex items-center gap-2 border-gray-200 hover:border-green-500 hover:text-green-600 bg-white/50 backdrop-blur-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium text-sm">Carrello</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}