// src/app/register/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Key, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { registerStaff } from "@/lib/auth-service";

export default function RegisterStaffPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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

    if (!formData.inviteCode.trim()) {
      setError("Il codice invito è obbligatorio");
      return;
    }

    setStatus("submitting");

    try {
      await registerStaff({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        inviteCode: formData.inviteCode.trim(),
      });

      setStatus("success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Errore durante la registrazione");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/30 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Registrazione Completata!</h2>
          <p className="text-gray-600">
            Account staff creato con successo. Reindirizzamento al login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/30 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Registra Staff</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Inserisci il codice invito fornito dal Titolare
          </p>
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
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-gray-50"
                placeholder="Luigi"
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
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-gray-50"
                placeholder="Bianchi"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Codice Invito</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="inviteCode"
                required
                value={formData.inviteCode}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-gray-50 uppercase tracking-wider"
                placeholder="ABC123XY"
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
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-gray-50"
                placeholder="staff@ristorante.it"
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
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-gray-50"
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
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-gray-50"
                placeholder="Ripeti password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registrazione...
              </>
            ) : (
              "Crea Account Staff"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  );
}