import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Achievements,
  checkEarneAchievements,
} from "../constants/achievements";
import { ArrowLeft, Trophy, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getUserAchievements,
  getCompletedMethodsCount,
  getCompletedCategories,
  hasLearnedAllMethods,
  awardAchievement,
} from "../services/achievementOperations";
import { useSavedMethods } from "../hooks/useSavedMethods";

interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  points: number;
  earned: boolean;
  progress: number; // 0-100
  currentValue: number;
  maxValue: number;
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { savedIds } = useSavedMethods();

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setLoading(false);
          return;
        }

        const userId = userData.user.id;

        // Get earned achievements
        const earnedIds = await getUserAchievements(userId);
        const earnedSet = new Set(earnedIds);

        // Get progress data
        const savedCount = savedIds.size;
        const completedCount = await getCompletedMethodsCount(userId);
        const completedCategories = await getCompletedCategories(userId);
        const hasLearned = await hasLearnedAllMethods(userId);

        // Check which achievements should be earned based on current progress
        const shouldEarn = checkEarneAchievements({
          savedMethods: savedCount,
          completedMethods: completedCount,
          completedCategoryCount: completedCategories.length >= 1 ? 1 : 0,
          completedCategories,
          learnedAllMethods: hasLearned,
          totalMethods:
            (await supabase.from("methods").select("id")).data?.length || 0,
        });

        // Award any newly earned achievements
        for (const achievement of shouldEarn) {
          if (!earnedSet.has(achievement.id)) {
            try {
              await awardAchievement(
                userId,
                achievement.id,
                achievement.pointsReward
              );
              earnedSet.add(achievement.id);
            } catch (error) {
              console.error(
                `Failed to award achievement ${achievement.id}:`,
                error
              );
            }
          }
        }

        // Build achievement progress list
        const progressList: AchievementProgress[] = Achievements.map(
          (achievement) => {
            let currentValue = 0;
            let maxValue = 0;
            let progress = 0;

            switch (achievement.id) {
              case "first-save":
                currentValue = Math.min(savedCount, 1);
                maxValue = 1;
                progress =
                  currentValue >= maxValue
                    ? 100
                    : (currentValue / maxValue) * 100;
                break;
              case "save-collector":
                currentValue = savedCount;
                maxValue = 10;
                progress = (currentValue / maxValue) * 100;
                break;
              case "first-completion":
                currentValue = Math.min(completedCount, 1);
                maxValue = 1;
                progress =
                  currentValue >= maxValue
                    ? 100
                    : (currentValue / maxValue) * 100;
                break;
              case "category-master":
                currentValue = completedCategories.length >= 1 ? 1 : 0;
                maxValue = 1;
                progress = currentValue >= maxValue ? 100 : 0;
                break;
              case "multi-category":
                currentValue = completedCategories.length;
                maxValue = 3;
                progress = (currentValue / maxValue) * 100;
                break;
              case "master-preserver":
                currentValue = hasLearned ? 1 : 0;
                maxValue = 1;
                progress = currentValue >= maxValue ? 100 : 0;
                break;
            }

            return {
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              points: achievement.pointsReward,
              earned: earnedSet.has(achievement.id),
              progress: Math.min(progress, 100),
              currentValue,
              maxValue,
            };
          }
        );

        setAchievements(progressList);
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [savedIds]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalPoints = achievements
    .filter((a) => a.earned)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 gap-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm self-start"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Header Card */}
      <div className="w-full card card-bordered p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy size={24} className="text-warning" />
          <h1 className="font-bold text-2xl">Achievements</h1>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <p className="text-sm text-base-content/60">Unlocked</p>
            <p className="font-bold text-lg">
              {earnedCount} / {achievements.length}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-base-content/60">Points Earned</p>
            <p className="font-bold text-lg">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="w-full space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`card card-bordered p-4 space-y-3 ${
              achievement.earned ? "bg-base-100" : "bg-base-200/50 opacity-75"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {achievement.earned ? (
                    <Trophy size={20} className="text-warning" />
                  ) : (
                    <Lock size={20} className="text-base-content/40" />
                  )}
                  <h3 className="font-bold text-lg">{achievement.name}</h3>
                </div>
                <p className="text-sm text-base-content/70 mt-1">
                  {achievement.description}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-bold text-lg text-primary">
                  +{achievement.points}
                </p>
                <p className="text-xs text-base-content/60">points</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>
                  {achievement.currentValue} / {achievement.maxValue}
                </span>
                <span className="text-base-content/60">
                  {Math.round(achievement.progress)}%
                </span>
              </div>
              <progress
                className={`progress w-full ${
                  achievement.earned ? "progress-primary" : "progress-base"
                }`}
                value={achievement.progress}
                max="100"
              ></progress>
            </div>

            {/* Status Badge */}
            {achievement.earned && (
              <div className="badge badge-success gap-1">
                <span>✓</span>
                Unlocked
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="h-4"></div>
    </div>
  );
}
