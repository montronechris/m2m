// src/lib/supabase-client.ts

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseHeaders = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
} as const;

export const supabaseFetch = async (table: string, query: string = "") => {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const response = await fetch(url, {
    method: "GET",
    headers: supabaseHeaders,
  });
  if (!response.ok) throw new Error(`Errore DB: ${response.status}`);
  return await response.json();
};

export const supabasePost = async (table: string, body: any) => {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const response = await fetch(url, {
    method: "POST",
    headers: supabaseHeaders,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Errore ${table}: ${errText}`);
  }
  return await response.json();
};