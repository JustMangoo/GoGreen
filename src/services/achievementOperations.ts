import { supabase } from "../lib/supabaseClient";

/**
 * Get user's earned achievements
 */
export async function getUserAchievements(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  if (error) throw error;
  return (data || []).map((row: any) => row.achievement_id);
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(
  userId: string,
  achievementId: string,
  pointsReward: number
): Promise<void> {
  // Insert achievement
  const { error: insertError } = await supabase
    .from("user_achievements")
    .insert([{ user_id: userId, achievement_id: achievementId }]);

  if (insertError && insertError.code !== "23505") {
    // 23505 is unique constraint violation (already earned)
    throw insertError;
  }

  // Add points to profile
  const { error: updateError } = await supabase
    .rpc("add_user_points", {
      user_id: userId,
      points: pointsReward,
    });

  if (updateError) throw updateError;
}

/**
 * Mark a method as completed
 */
export async function completeMethod(
  userId: string,
  methodId: number,
  notes?: string,
  rating?: number
): Promise<void> {
  const { error } = await supabase.from("completed_methods").upsert(
    [
      {
        user_id: userId,
        method_id: methodId,
        notes,
        rating,
      },
    ],
    {
      onConflict: "user_id,method_id",
    }
  );

  if (error) throw error;
}

/**
 * Get count of completed methods for a user
 */
export async function getCompletedMethodsCount(
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("completed_methods")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count || 0;
}

/**
 * Get categories where user completed all methods
 */
export async function getCompletedCategories(
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase.rpc(
    "get_completed_categories",
    { user_id_param: userId }
  );

  if (error) throw error;
  return (data || []).map((row: any) => row.category);
}

/**
 * Check if user has saved/completed all methods
 */
export async function hasLearnedAllMethods(userId: string): Promise<boolean> {
  const { data: methods } = await supabase
    .from("methods")
    .select("id", { count: "exact" });

  const totalMethods = methods?.length || 0;

  const { data } = await supabase.rpc("get_learned_methods_count", {
    user_id_param: userId,
  });

  const learnedCount = data?.[0]?.count || 0;

  return learnedCount >= totalMethods;
}
