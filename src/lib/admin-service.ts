// src/lib/admin-service.ts

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getSupabase = () => createBrowserClient(supabaseUrl, supabaseKey);

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "manager" | "staff";

export interface UserProfile {
  id: string;
  restaurant_id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
}

export interface RestaurantData {
  id: string;
  name: string;
  logo_url: string | null;
  status: string;
  userRole: UserRole;
  userName: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price_cents: number;
  customizations: any;
  menu_items?: {
    name: string;
    price_cents: number;
  };
}

export interface Order {
  id: string;
  table_id: string;
  restaurant_id: string;
  total_cents: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  notes: string;
  ordine: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
  is_available: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  qr_payload: string;
  is_active: boolean;
  status: "free" | "occupied" | "reserved" | "bill-requested";
  created_at: string;
}

// ─── Restaurant & Profile ────────────────────────────────────────────────────

/**
 * Recupera ristorante + profilo utente completo (ruolo, nome, cognome)
 */
export const getRestaurantByUser = async (): Promise<RestaurantData> => {
  const supabase = getSupabase();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Utente non autenticato");

  // Recupera profilo con ruolo, nome e cognome
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("restaurant_id, role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) throw new Error("Profilo non trovato");

  // Recupera ristorante
  const { data: restaurant, error: restError } = await supabase
    .from("restaurants")
    .select("id, name, logo_url, status")
    .eq("id", profile.restaurant_id)
    .single();

  if (restError || !restaurant) throw new Error("Ristorante non trovato");

  // Costruisci nome completo
  const userName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ") || "Utente";

  return {
    ...restaurant,
    userRole: (profile.role as UserRole) || "staff",
    userName,
  };
};

/**
 * ✅ Verifica se l'utente corrente è un Titolare/Admin
 */
export const checkTitolareAccess = async (): Promise<boolean> => {
  try {
    const data = await getRestaurantByUser();
    // Accetta sia 'admin' che 'titolare' per compatibilità
    return data.userRole === "admin" || data.userRole === "titolare";
  } catch {
    return false;
  }
};

/**
 * Aggiorna nome ristorante
 */
export const updateRestaurantName = async (restaurantId: string, name: string) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurants")
    .update({ name })
    .eq("id", restaurantId);
  if (error) throw error;
};

/**
 * Aggiorna URL logo ristorante
 */
export const updateRestaurantLogo = async (restaurantId: string, logoUrl: string) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurants")
    .update({ logo_url: logoUrl })
    .eq("id", restaurantId);
  if (error) throw error;
};

/**
 * Upload logo ristorante su Supabase Storage
 */
export const uploadRestaurantLogo = async (file: File, restaurantId: string): Promise<string> => {
  const supabase = getSupabase();
  const fileExt = file.name.split(".").pop();
  const fileName = `${restaurantId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("restaurant-logos")
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("restaurant-logos").getPublicUrl(fileName);
  return data.publicUrl;
};

/**
 * Aggiorna stato ristorante (open/closed)
 */
export const updateRestaurantStatus = async (restaurantId: string, status: "open" | "closed") => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurants")
    .update({ status })
    .eq("id", restaurantId);
  if (error) throw error;
};

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * Recupera ordini del ristorante con dettagli piatti
 */
export const getOrders = async (restaurantId: string): Promise<Order[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        menu_items (name, price_cents)
      )
    `)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

/**
 * Aggiorna stato ordine
 */
export const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
};

// ─── Menu Items ──────────────────────────────────────────────────────────────

/**
 * Recupera tutti i piatti del ristorante
 */
export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Toggle disponibilità piatto
 */
export const toggleMenuItemAvailability = async (itemId: string, available: boolean) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: available })
    .eq("id", itemId);
  if (error) throw error;
};

/**
 * Crea nuovo piatto
 */
export const createMenuItem = async (item: Omit<MenuItem, "id" | "created_at">) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("menu_items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Aggiorna piatto esistente
 */
export const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", itemId);
  if (error) throw error;
};

/**
 * Elimina piatto
 */
export const deleteMenuItem = async (itemId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
};

// ─── Tables ──────────────────────────────────────────────────────────────────

/**
 * Recupera tutti i tavoli del ristorante
 */
export const getTables = async (restaurantId: string): Promise<Table[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("table_number", { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Aggiorna stato tavolo
 */
export const updateTableStatus = async (tableId: string, status: Table["status"]) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tables")
    .update({ status })
    .eq("id", tableId);
  if (error) throw error;
};

/**
 * Crea nuovo tavolo
 */
export const createTable = async (table: Omit<Table, "id" | "created_at">) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tables")
    .insert(table)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Elimina tavolo
 */
export const deleteTable = async (tableId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("id", tableId);
  if (error) throw error;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Logout utente
 */
export const signOut = async () => {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};