// src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Mantiene solo il check di autenticazione
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router, supabase]);

  // ✅ Rimuove Sidebar, Navbar, stili e rende solo children
  return <>{children}</>;
}