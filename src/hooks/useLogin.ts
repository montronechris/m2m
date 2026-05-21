// src/hooks/useLogin.ts

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword } from "@/lib/auth-service";

type LoginStatus = "idle" | "submitting" | "success" | "error";

interface UseLoginReturn {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  status: LoginStatus;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("submitting");
      setError(null);

      try {
        await signInWithPassword(email, password);
        setStatus("success");
        
        // 🔧 MODIFICA: Redirect a /admin/staff invece di /admin/dashboard
        router.push("/admin/staff");
        router.refresh();
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Errore durante l'accesso.");
      }
    },
    [email, password, router]
  );

  return {
    email,
    password,
    setEmail,
    setPassword,
    status,
    error,
    handleSubmit,
    clearError,
  };
}