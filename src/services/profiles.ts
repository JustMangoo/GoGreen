import { supabase } from "../lib/supabaseClient";

export type CompletedMethod = {
  user_id: string;
  method_id: number;
  notes: string | null;
  rating: number | null;
  completed_at: string;
};

export async function markMethodCompleted(
  userId: string,
  methodId: number,
  notes?: string,
  rating?: number
): Promise<void> {
  const { error } = await supabase.from("completed_methods").upsert(
    {
      user_id: userId,
      method_id: methodId,
      notes: notes || null,
      rating: rating || null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,method_id" }
  );
  if (error) throw error;
}

export async function getCompletedMethods(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("completed_methods")
    .select("id")
    .eq("user_id", userId);
  if (error) throw error;
  return data?.length || 0;
}

export async function getMethodCompletion(
  userId: string,
  methodId: number
): Promise<CompletedMethod | null> {
  const { data, error } = await supabase
    .from("completed_methods")
    .select("*")
    .eq("user_id", userId)
    .eq("method_id", methodId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function deleteCompletedMethod(
  userId: string,
  methodId: number
): Promise<void> {
  const { error } = await supabase
    .from("completed_methods")
    .delete()
    .eq("user_id", userId)
    .eq("method_id", methodId);
  if (error) throw error;
}
