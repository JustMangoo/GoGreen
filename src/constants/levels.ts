export interface LevelTier {
  minPoints: number;
  maxPoints: number;
  name: string;
  icon?: string;
  color?: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    minPoints: 0,
    maxPoints: 50,
    name: "Fresh Picker",
  },
  {
    minPoints: 51,
    maxPoints: 150,
    name: "Brine Beginner",
  },
  {
    minPoints: 151,
    maxPoints: 300,
    name: "Vinegar Vanguard",
  },
  {
    minPoints: 301,
    maxPoints: 500,
    name: "Salt Savant",
  },
  {
    minPoints: 501,
    maxPoints: 700,
    name: "Fermentation Fanatic",
  },
  {
    minPoints: 701,
    maxPoints: 850,
    name: "Curing Curator",
  },
  {
    minPoints: 851,
    maxPoints: Infinity,
    name: "Time Lord of the Pantry",
  },
];

/**
 * Get the current level tier based on points
 */
export function getLevelTier(points: number): LevelTier {
  return (
    LEVEL_TIERS.find(
      (tier) => points >= tier.minPoints && points <= tier.maxPoints
    ) || LEVEL_TIERS[0]
  );
}

/**
 * Get the next level tier
 */
export function getNextLevelTier(currentPoints: number): LevelTier | null {
  const currentTier = getLevelTier(currentPoints);
  const currentIndex = LEVEL_TIERS.indexOf(currentTier);

  if (currentIndex === LEVEL_TIERS.length - 1) {
    return null; // Already at max level
  }

  return LEVEL_TIERS[currentIndex + 1];
}

/**
 * Get progress percentage to next level
 */
export function getLevelProgress(points: number): {
  current: number;
  next: number;
  percentage: number;
} {
  const currentTier = getLevelTier(points);
  const nextTier = getNextLevelTier(points);

  if (!nextTier) {
    return {
      current: points,
      next: currentTier.maxPoints,
      percentage: 100,
    };
  }

  const pointsInCurrentTier = points - currentTier.minPoints;
  const tierRange = nextTier.minPoints - currentTier.minPoints;
  const percentage = (pointsInCurrentTier / tierRange) * 100;

  return {
    current: points,
    next: nextTier.minPoints,
    percentage: Math.min(Math.round(percentage), 100),
  };
}
