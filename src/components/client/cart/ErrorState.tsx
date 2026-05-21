// src/components/client/cart/ErrorState.tsx

"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold">Errore nell'invio</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  );
}