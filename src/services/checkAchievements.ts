import { supabase } from "../lib/supabaseClient";
import {
  getUserAchievements,
  getCompletedMethodsCount,
  getCompletedCategories,
  hasLearnedAllMethods,
  awardAchievement,
} from "./achievementOperations";
import { checkEarneAchievements } from "../constants/achievements";

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
