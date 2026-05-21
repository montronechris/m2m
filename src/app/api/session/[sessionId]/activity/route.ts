// src/app/api/session/[sessionId]/activity/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  await supabase
    .from("qr_sessions")
    .update({ last_activity: new Date().toISOString() })
    .eq("id", sessionId);
  return NextResponse.json({ ok: true });
}