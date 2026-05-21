// src/components/client/cart/SuccessState.tsx

"use client";

import { CheckCircle } from "lucide-react";

export function SuccessState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Ordine Confermato! 🎉
        </h2>
        <p className="text-gray-600">
          La cucina ha ricevuto la tua comanda. Tra poco arriverà al tuo tavolo.
        </p>
        <p className="text-sm text-gray-400">Reindirizzamento in corso...</p>
      </div>
    </div>
  );
}