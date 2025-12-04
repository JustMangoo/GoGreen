import { supabase } from "../lib/supabaseClient";

export async function createMethod(method) {
  const { data, error } = await supabase
    .from("Methods")
    .insert([{ ...method }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listMethods(userId) {
  let query = supabase
    .from("Methods")
    .select("*")
    .order("created_at", { ascending: false });

  /*   if (userId) {
    query = query.eq("user_id", userId);
  } */

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
