// src/app/api/session/[sessionId]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Trova la sessione QR tramite id
    const { data: session, error: sessionError } = await supabase
      .from("qr_sessions")
      .select("id, token, restaurant_id, table_number")
      .eq("id", sessionId)
      .maybeSingle(); // maybeSingle non lancia errore se 0 righe

    if (sessionError || !session) {
      console.error("[session route] qr_sessions not found:", sessionId, sessionError);
      return NextResponse.json(
        { error: "Sessione non valida o scaduta." },
        { status: 404 }
      );
    }

    // 2. Trova il tableId in table_qr_sessions tramite token
    const { data: tableRow, error: tableError } = await supabase
      .from("table_qr_sessions")
      .select("id, table_number")
      .eq("token", session.token)
      .eq("restaurant_id", session.restaurant_id)
      .eq("is_active", true)
      .maybeSingle();

    // Log per debug — rimuovere dopo aver verificato
    console.log("[session route]", {
      sessionToken: session.token,
      restaurantId: session.restaurant_id,
      tableRow,
      tableError,
    });

    return NextResponse.json({
      tableNumber: tableRow?.table_number ?? session.table_number ?? null,
      restaurantId: session.restaurant_id,
      tableId: tableRow?.id ?? null,
    });
  } catch (err: any) {
    console.error("[session route] unexpected error:", err);
    return NextResponse.json(
      { error: "Errore interno del server", details: err.message },
      { status: 500 }
    );
  }
}