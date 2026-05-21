// src/components/auth/LoginForm.tsx

"use client";

import Link from "next/link";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { LoginError } from "./LoginError";

interface LoginFormProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  status: "idle" | "submitting" | "success" | "error";
  error: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClearError?: () => void;
}

export function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  status,
  error,
  onSubmit,
  onClearError,
}: LoginFormProps) {
  const isLoading = status === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/30 px-4 py-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Admin Login
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Accedi al pannello di gestione
          </p>
        </div>

        {/* Errore */}
        {error && <LoginError error={error} onClear={onClearError} />}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50"
                placeholder="admin@tavolarapida.it"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Accesso in corso...</span>
              </>
            ) : (
              <span>Accedi</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna alla Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}