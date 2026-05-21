// src/lib/auth-service.ts

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getSupabase = () => createBrowserClient(supabaseUrl, supabaseKey);

export type UserRole = "admin" | "manager" | "staff";

export interface UserProfile {
  id: string;
  restaurant_id: string | null;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
}

export interface RegisterAdminData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// === AUTH ===

export const signInWithPassword = async (email: string, password: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const signOut = async () => {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// === PROFILE ===

export const getUserProfile = async (): Promise<UserProfile> => {
  const supabase = getSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Utente non autenticato");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, restaurant_id, role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) throw new Error("Profilo non trovato");

  return {
    ...profile,
    role: (profile.role as UserRole) || "staff",
  };
};

// === REGISTRAZIONE ADMIN ===

export const checkAdminExists = async (): Promise<boolean> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("check_admin_exists");
  if (error) throw error;
  return data;
};

export const registerAdmin = async (data: RegisterAdminData) => {
  const supabase = getSupabase();

  const exists = await checkAdminExists();
  if (exists) {
    throw new Error("Un admin esiste già.");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: "admin",
        first_name: data.firstName,
        last_name: data.lastName,
      },
    },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Registrazione fallita");

  // ✅ Crea ristorante e aggiorna profilo
  const { data: restaurant, error: restError } = await supabase
    .from("restaurants")
    .insert({ name: "Il Mio Ristorante", status: "open" })
    .select("id")
    .single();

  if (restError) throw new Error("Errore creazione ristorante");

  await supabase
    .from("profiles")
    .update({ restaurant_id: restaurant.id })
    .eq("id", authData.user.id);

  return authData;
};