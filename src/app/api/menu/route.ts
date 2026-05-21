// Esempio: src/app/api/menu/route.ts (POST)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // 1. Controlla se c'è una sessione attiva
  const { data: { session } } = await supabase.auth.getSession();

  // 2. Se non c'è sessione, blocca la richiesta
  if (!session) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  // 3. Opzionale: Controlla se l'email è quella dell'admin specifico
  if (session.user.email !== 'admin@tavolarapida.it') {
     return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
  }

  // 4. Se tutto ok, procedi con l'inserimento nel DB
  const body = await request.json();
  // ... logica di inserimento supabase.from('menu_items').insert(...) ...
  
  return NextResponse.json({ success: true });
}