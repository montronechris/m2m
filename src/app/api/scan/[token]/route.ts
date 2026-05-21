// src/app/api/scan/[token]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { token } = await params;

    // 1. Trova la sessione nella tabella qr_sessions
    const { data: session, error: sessionError } = await supabase
      .from('qr_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Tavolo/Sessione non trovata' }, { status: 404 });
    }

    if (!session.restaurant_id) {
      return NextResponse.json({ error: 'Errore configurazione sessione' }, { status: 500 });
    }

    const restaurantId = session.restaurant_id;

    // 2. Recupera lo slug reale del ristorante dal DB
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('slug')
      .eq('id', restaurantId)
      .single();

    if (restError || !restaurant) {
      return NextResponse.json({ error: 'Ristorante non configurato' }, { status: 500 });
    }

    // 3. Recupera le categorie del ristorante
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true });

    if (catError) throw catError;

    // 4. Recupera i piatti tramite le categorie
    const categoryIds = categories?.map(c => c.id) || [];
    let items = [];

    if (categoryIds.length > 0) {
      const { data: menuItems, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_available', true);

      if (itemError) throw itemError;
      items = menuItems || [];
    }

    return NextResponse.json({
      sessionId: session.id,
      restaurantSlug: restaurant.slug, // ✅ slug reale dal DB
      tableNumber: session.token,
      categories,
      items
    });

  } catch (error: any) {
    console.error('Errore Critico API Scan:', error);
    return NextResponse.json(
      { error: 'Errore interno del server', details: error.message },
      { status: 500 }
    );
  }
}