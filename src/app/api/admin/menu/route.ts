// src/app/api/admin/menu/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId mancante" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [catRes, itemsRes] = await Promise.all([
      supabase.from("menu_categories").select("*").eq("restaurant_id", restaurantId).order("sort_order"),
      supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId).order("name")
    ]);

    if (catRes.error) throw catRes.error;
    if (itemsRes.error) throw itemsRes.error;

    return NextResponse.json({
      categories: catRes.data || [],
      items: itemsRes.data || []
    });
  } catch (error: any) {
    console.error("API /admin/menu GET error:", error);
    return NextResponse.json({ error: error.message || "Errore server interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await supabase.from("menu_items").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}