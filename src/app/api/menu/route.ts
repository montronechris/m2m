// src/app/api/menu/route.ts (POST)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Controlla se c'è una sessione attiva
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 2. Se non c'è sessione, blocca la richiesta
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // 3. Controlla il ruolo dal profilo (più sicuro di controllare l'email)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || !["admin", "manager", "titolare"].includes(profile.role)) {
    return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
  }

  // 4. Procedi con l'inserimento nel DB
  const body = await request.json();
  const { error } = await supabase.from("menu_items").insert(body);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}