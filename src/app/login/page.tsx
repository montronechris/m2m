// src/app/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowLeft, Shield, User, Loader2, AlertCircle } from "lucide-react";
import { signInWithPassword, getUserProfile, signOut } from "@/lib/auth-service";

type LoginMode = "staff" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<LoginMode>("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Se già autenticato, redirect in base al ruolo
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getUserProfile();
        if (profile.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/staff");
        }
      } catch {
        // Non autenticato, mostra form
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      // 1. Login Supabase
      await signInWithPassword(email, password);

      // 2. Recupera profilo e ruolo
      const profile = await getUserProfile();

      // 3. Verifica ruolo in base alla modalità
      if (mode === "admin" && profile.role !== "admin") {
        await signOut();
        throw new Error("Accesso non autorizzato. Ruolo admin richiesto.");
      }

      if (mode === "staff" && profile.role === "admin") {
        // Admin può accedere a tutto, ma se seleziona staff mode, redirect a admin
        // Oppure blocca? Implementiamo redirect automatico a /admin
        router.push("/admin");
        return;
      }

      if (mode === "staff" && profile.role !== "staff" && profile.role !== "manager") {
        await signOut();
        throw new Error("Accesso non autorizzato. Ruolo staff richiesto.");
      }

      // 4. Redirect basato sul ruolo
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/staff");
      }

      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Errore durante l'accesso.");
    }
  };

  const isLight = mode === "staff";

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isLight ? "bg-gradient-to-br from-gray-50 via-white to-green-50/30" : "bg-gradient-to-br from-gray-900 via-gray-800 to-black"} p-4`}>
      <div className={`p-8 rounded-3xl shadow-xl w-full max-w-md border transition-colors duration-300 ${isLight ? "bg-white border-gray-100" : "bg-gray-800 border-gray-700"}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300 ${isLight ? "bg-gradient-to-br from-green-600 to-emerald-600" : "bg-gradient-to-br from-purple-600 to-indigo-600"}`}>
            {isLight ? <User className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
          </div>
          <h2 className={`text-3xl font-black tracking-tight transition-colors duration-300 ${isLight ? "text-gray-900" : "text-white"}`}>
            {isLight ? "Login Staff" : "Login Admin"}
          </h2>
          <p className={`mt-2 text-sm transition-colors duration-300 ${isLight ? "text-gray-500" : "text-gray-400"}`}>
            {isLight ? "Accedi all'area operativa" : "Accedi al pannello di gestione"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setMode(mode === "staff" ? "admin" : "staff")}
            className={`text-sm font-medium transition-colors duration-300 ${isLight ? "text-gray-500 hover:text-purple-600" : "text-gray-400 hover:text-green-400"}`}
          >
            {isLight ? "Continua come Admin →" : "← Continua come Staff"}
          </button>
        </div>

        {/* Errore */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-xs font-bold uppercase mb-2 tracking-wide transition-colors duration-300 ${isLight ? "text-gray-700" : "text-gray-300"}`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isLight ? "text-gray-400" : "text-gray-500"}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "submitting"}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  isLight
                    ? "border-gray-200 focus:border-green-500 bg-gray-50 text-gray-900"
                    : "border-gray-600 focus:border-purple-500 bg-gray-700 text-white placeholder-gray-400"
                }`}
                placeholder={isLight ? "staff@ristorante.it" : "admin@ristorante.it"}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase mb-2 tracking-wide transition-colors duration-300 ${isLight ? "text-gray-700" : "text-gray-300"}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isLight ? "text-gray-400" : "text-gray-500"}`} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === "submitting"}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  isLight
                    ? "border-gray-200 focus:border-green-500 bg-gray-50 text-gray-900"
                    : "border-gray-600 focus:border-purple-500 bg-gray-700 text-white placeholder-gray-400"
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className={`w-full font-bold py-4 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 ${
              isLight
                ? "bg-gray-900 hover:bg-green-600 text-white hover:shadow-green-500/25"
                : "bg-gray-700 hover:bg-purple-600 text-white hover:shadow-purple-500/25"
            }`}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Accesso...
              </>
            ) : (
              <span>Accedi</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm transition-colors duration-300 ${isLight ? "text-gray-500 hover:text-green-600" : "text-gray-400 hover:text-purple-400"}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  );
}