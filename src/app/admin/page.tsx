// src/app/admin/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/auth-service";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const profile = await getUserProfile();
        
        if (profile.role !== "admin") {
          // ❌ Non admin → redirect a login
          router.push("/login");
        } else {
          // ✅ Admin → redirect a dashboard
          router.push("/admin/dashboard");
        }
      } catch {
        // Errore o non autenticato → redirect a login
        router.push("/login");
      }
    };

    check();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p>Caricamento admin...</p>
    </div>
  );
}