// src/components/auth/LoginError.tsx

"use client";

import { AlertCircle } from "lucide-react";

interface LoginErrorProps {
  error: string;
  onClear?: () => void;
}

export function LoginError({ error, onClear }: LoginErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-start gap-2">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">{error}</div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-red-400 hover:text-red-600 text-lg leading-none"
          aria-label="Chiudi errore"
        >
          ×
        </button>
      )}
    </div>
  );
}