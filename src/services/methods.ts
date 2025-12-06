import { supabase } from "../lib/supabaseClient";

export interface Method {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  image_url?: string;
  created_at?: string;
  [key: string]: any;
}

export async function createMethod(method: Partial<Method>): Promise<Method> {
  const { data, error } = await supabase
    .from("methods")
    .insert([{ ...method }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listMethods(userId?: string): Promise<Method[]> {
  let query = supabase
    .from("methods")
    .select("*")
    .order("created_at", { ascending: false });

  /*   if (userId) {
    query = query.eq("user_id", userId);
  } */

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching methods:", error);
    throw error;
  }
  console.log("Fetched methods:", data);
  return data;
}
