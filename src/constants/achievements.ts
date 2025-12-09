export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsReward: number;
  requirement: string;
}

export const Achievements: Achievement[] = [
  {
    id: "first-save",
    name: "Quick Save",
    description: "Save your first method",
    icon: "heart",
    pointsReward: 10,
    requirement: "savedMethods >= 1",
  },
  {
    id: "save-collector",
    name: "Collection Builder",
    description: "Save 10 methods",
    icon: "heart",
    pointsReward: 50,
    requirement: "savedMethods >= 10",
  },
  {
    id: "first-completion",
    name: "First Success",
    description: "Complete your first method",
    icon: "checkCircle",
    pointsReward: 25,
    requirement: "completedMethods >= 1",
  },
  {
    id: "category-master",
    name: "Category Champion",
    description: "Complete all methods in one category",
    icon: "trophy",
    pointsReward: 75,
    requirement: "completedCategory >= 1",
  },
  {
    id: "multi-category",
    name: "Preservation Specialist",
    description: "Complete all methods in 3 different categories",
    icon: "star",
    pointsReward: 150,
    requirement: "completedCategories >= 3",
  },
  {
    id: "master-preserver",
    name: "Master Preserver",
    description: "Learn all preservation methods",
    icon: "award",
    pointsReward: 250,
    requirement: "learnedAllMethods",
  },
];

export interface UserAchievementProgress {
  savedMethods: number;
  completedMethods: number;
  completedCategoryCount: number;
  completedCategories: string[];
  learnedAllMethods: boolean;
  totalMethods: number;
}

/**
 * Check which achievements the user has earned
 */
export function checkEarneAchievements(
  progress: UserAchievementProgress
): Achievement[] {
  const earned: Achievement[] = [];

  // First save
  if (progress.savedMethods >= 1) {
    earned.push(Achievements.find((a) => a.id === "first-save")!);
  }

  // Save collector (10 methods)
  if (progress.savedMethods >= 10) {
    earned.push(Achievements.find((a) => a.id === "save-collector")!);
  }

  // First completion
  if (progress.completedMethods >= 1) {
    earned.push(Achievements.find((a) => a.id === "first-completion")!);
  }

  // Category master (complete all in one category)
  if (progress.completedCategoryCount >= 1) {
    earned.push(Achievements.find((a) => a.id === "category-master")!);
  }

  // Multi-category (3 categories completed)
  if (progress.completedCategories.length >= 3) {
    earned.push(Achievements.find((a) => a.id === "multi-category")!);
  }

  // Master preserver (all methods)
  if (progress.learnedAllMethods) {
    earned.push(Achievements.find((a) => a.id === "master-preserver")!);
  }

  return earned;
}

/**
 * Get the next achievement to work towards
 */
export function getNextAchievement(
  progress: UserAchievementProgress
): Achievement | null {
  const earned = checkEarneAchievements(progress);
  const earnedIds = earned.map((a) => a.id);

  return (
    Achievements.find((achievement) => !earnedIds.includes(achievement.id)) ||
    null
  );
}

/**
 * Get progress towards a specific achievement
 */
export function getAchievementProgress(
  achievement: Achievement,
  progress: UserAchievementProgress
): number {
  switch (achievement.id) {
    case "first-save":
      return Math.min((progress.savedMethods / 1) * 100, 100);
    case "save-collector":
      return Math.min((progress.savedMethods / 10) * 100, 100);
    case "first-completion":
      return Math.min((progress.completedMethods / 1) * 100, 100);
    case "category-master":
      return progress.completedCategoryCount >= 1 ? 100 : 0;
    case "multi-category":
      return Math.min((progress.completedCategories.length / 3) * 100, 100);
    case "master-preserver":
      return progress.learnedAllMethods
        ? 100
        : (progress.savedMethods / progress.totalMethods) * 100;
    default:
      return 0;
  }
}
