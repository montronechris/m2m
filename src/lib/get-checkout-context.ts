const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getCheckoutContext(token: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/qr_sessions?token=eq.${token}`,
    {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Errore fetch qr_sessions");
  }

  const data = await res.json();

  if (!data.length) {
    throw new Error("QR session non trovata");
  }

  return {
    tableNumber: data[0].table_number,
    restaurantId: data[0].restaurant_id,
  };
}