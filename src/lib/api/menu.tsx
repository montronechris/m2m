// src/lib/api/menu.ts
import { createClient } from '@/lib/supabase/client';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
};

export type OptionGroup = {
  option_id: string;
  option_name: string;
  is_required: boolean;
  choices: { choice_id: string; choice_name: string }[];
};

// Recupera tutti i prodotti disponibili
export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Recupera opzioni e scelte per un prodotto specifico
export async function getProductOptions(itemId: string): Promise<OptionGroup[]> {
  const supabase = createClient();
  
  // Nota: Se usi menu_item_option_map come ponte many-to-many, 
  // cambia la query per unire quella tabella. Qui uso la relazione diretta item_id.
  const { data, error } = await supabase
    .from('menu_item_options')
    .select(`
      id,
      name,
      is_required,
      choices:menu_item_option_choices(id, name)
    `)
    .eq('item_id', itemId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  
  // Normalizza la struttura per il frontend
  return (data || []).map((opt: any) => ({
    option_id: opt.id,
    option_name: opt.name,
    is_required: opt.is_required,
    choices: opt.choices?.map((c: any) => ({
      choice_id: c.id,
      choice_name: c.name,
    })) || [],
  }));
}