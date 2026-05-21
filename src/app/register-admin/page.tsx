// src/app/register-admin/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { checkAdminExists, registerAdmin } from "@/lib/auth-service";

export default function RegisterAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<"checking" | "idle" | "submitting" | "success" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  // Verifica se esiste già un admin
  useEffect(() => {
    const check = async () => {
      try {
        const exists = await checkAdminExists();
        if (exists) {
          setError("Un admin esiste già. Questa pagina non è più accessibile.");
          setStatus("error");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("idle");
        }
      } catch {
        setError("Errore verifica admin");
        setStatus("error");
      }
    };
    check();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }

    if (formData.password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri");
      return;
    }

    setStatus("submitting");

    try {
      await registerAdmin({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setStatus("success");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Errore durante la registrazione");
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500">Verifica disponibilità...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Creato!</h2>
          <p className="text-gray-600">Reindirizzamento al login...</p>
        </div>
      </div>
    );
  }

  if (status === "error" && error?.includes("esiste già")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Accesso Negato</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/30 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Crea Admin</h2>
          <p className="text-gray-500 mt-2 text-sm">Pagina temporanea - Primo setup</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none bg-gray-50"
                placeholder="Mario"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cognome</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none bg-gray-50"
                placeholder="Rossi"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none bg-gray-50"
                placeholder="admin@ristorante.it"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none bg-gray-50"
                placeholder="Minimo 8 caratteri"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Conferma Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none bg-gray-50"
                placeholder="Ripeti password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-gray-900 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creazione...
              </>
            ) : (
              "Crea Account Admin"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600">
            <ArrowLeft className="w-4 h-4" />
            Torna al Login
          </Link>
        </div>
      </div>
    </div>
  );
}