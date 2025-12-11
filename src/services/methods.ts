import { supabase } from "../lib/supabaseClient";

export interface Step {
  order: number;
  title: string;
  description: string;
}

export interface Method {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  image_url?: string;
  steps?: Step[];
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

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching methods:", error);
    throw error;
  }

  return data;
}

export async function updateMethod(
  id: string | number,
  method: Partial<Method>
): Promise<Method> {
  const { data, error } = await supabase
    .from("methods")
    .update(method)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
