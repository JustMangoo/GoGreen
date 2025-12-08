import { supabase } from "../lib/supabaseClient";

/**
 * Fetches the list of method IDs that the user has saved.
 */
export async function getSavedMethodIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("saved_methods")
    .select("method_id")
    .eq("user_id", userId);

  if (error) throw error;

  // Map the numeric IDs from DB to strings for the frontend
  return (data || []).map((row) => String(row.method_id));
}

/**
 * Saves a method for a user (Upsert - insert or update if exists).
 */
export async function addSavedMethod(
  userId: string,
  methodId: number
): Promise<void> {
  const { error } = await supabase
    .from("saved_methods")
    .upsert([{ user_id: userId, method_id: methodId }], {
      onConflict: "user_id,method_id",
    });

  if (error) throw error;
}

/**
 * Removes a saved method for a user (Delete).
 */
export async function removeSavedMethod(
  userId: string,
  methodId: number
): Promise<void> {
  const { error } = await supabase
    .from("saved_methods")
    .delete()
    .eq("user_id", userId)
    .eq("method_id", methodId);

  if (error) throw error;
}
