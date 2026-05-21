// src/lib/actions/order-actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    // 🔒 Verifica auth (opzionale ma consigliato)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non autorizzato" };

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/admin/kitchen");
    return { success: true };
  } catch (err) {
    console.error("Errore updateOrderStatus:", err);
    return { success: false, error: "Errore interno" };
  }
}