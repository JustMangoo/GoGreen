import { supabase } from "../lib/supabaseClient";
import { checkEarneAchievements } from "../constants/achievements";

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
  const { error: updateError } = await supabase.rpc("add_user_points", {
    p_user_id: userId,
    p_points: pointsReward,
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

  // Award 10 points for completing a method
  const { error: updateError } = await supabase.rpc("add_user_points", {
    p_user_id: userId,
    p_points: 10,
  });

  if (updateError) throw updateError;
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
  const { data, error } = await supabase.rpc("get_completed_categories", {
    p_user_id: userId,
  });

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
    p_user_id: userId,
  });

  const learnedCount = data?.[0]?.count || 0;

  return learnedCount >= totalMethods;
}

/**
 * Check if a specific method is completed by user
 */
export async function isMethodCompleted(
  userId: string,
  methodId: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("completed_methods")
    .select("id")
    .eq("user_id", userId)
    .eq("method_id", methodId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Check and award achievements for a user based on current progress
 * Returns newly earned achievements
 */
export async function checkAndAwardAchievements(
  userId: string,
  savedMethodsCount: number
): Promise<
  Array<{ id: string; name: string; description: string; pointsReward: number }>
> {
  try {
    // Get current earned achievements
    const earnedIds = await getUserAchievements(userId);
    const earnedSet = new Set(earnedIds);

    // Get progress data
    const completedCount = await getCompletedMethodsCount(userId);
    const completedCategories = await getCompletedCategories(userId);
    const hasLearned = await hasLearnedAllMethods(userId);

    // Get total methods count
    const { data: methods } = await supabase.from("methods").select("id");
    const totalMethods = methods?.length || 0;

    // Check which achievements should be earned
    const shouldEarn = checkEarneAchievements({
      savedMethods: savedMethodsCount,
      completedMethods: completedCount,
      completedCategoryCount: completedCategories.length >= 1 ? 1 : 0,
      completedCategories,
      learnedAllMethods: hasLearned,
      totalMethods,
    });

    // Award newly earned achievements
    const newlyEarned: Array<{
      id: string;
      name: string;
      description: string;
      pointsReward: number;
    }> = [];

    for (const achievement of shouldEarn) {
      if (!earnedSet.has(achievement.id)) {
        try {
          await awardAchievement(
            userId,
            achievement.id,
            achievement.pointsReward
          );
          newlyEarned.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            pointsReward: achievement.pointsReward,
          });
        } catch (error) {
          // Ignore duplicate key errors (achievement already earned in parallel)
          if ((error as any)?.code !== "23505") {
            console.error(
              `Failed to award achievement ${achievement.id}:`,
              error
            );
          }
        }
      }
    }

    return newlyEarned;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}
