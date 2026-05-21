// src/components/client/scan/ScanStatus.tsx

"use client";

import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface ScanStatusProps {
  status: "idle" | "verifying" | "success" | "error";
  message: string;
  error?: string | null;
}

export function ScanStatus({ status, message, error }: ScanStatusProps) {
  const isError = status === "error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div
        className={`bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6 animate-fade-in ${
          isError ? "border-2 border-red-200" : ""
        }`}
      >
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isError
              ? "bg-red-100 text-red-600"
              : status === "success"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {isError ? (
            <AlertCircle className="w-10 h-10" />
          ) : status === "success" ? (
            <CheckCircle className="w-10 h-10" />
          ) : (
            <Loader2 className="w-10 h-10 animate-spin" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Accesso Tavolo
          </h2>
          <p className="text-gray-600">{message}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}