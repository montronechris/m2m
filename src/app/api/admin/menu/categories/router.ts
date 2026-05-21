// src/app/api/admin/menu/categories/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.restaurant_id) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("menu_categories")
      .insert({
        name: body.name,
        restaurant_id: body.restaurant_id,
        sort_order: body.sort_order || 0
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error("Errore API POST categories:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}