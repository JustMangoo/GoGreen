export const LS_KEYS = {
  achievementsTotal: "achievements_total",
  achievementsEarned: "achievements_earned",
  totalMethods: "total_methods_count",
  completedMethods: "completed_methods_count",
  savedMethodsCount: "saved_methods_count",
  userPointsPrefix: "user_points_",
  userLevelTitlePrefix: "user_level_title_",
} as const;

// User points cache
export function getUserPointsCache(userId: string): number | null {
  const v = localStorage.getItem(`${LS_KEYS.userPointsPrefix}${userId}`);
  return v !== null ? Number(v) : null;
}
export function setUserPointsCache(userId: string, points: number): void {
  localStorage.setItem(`${LS_KEYS.userPointsPrefix}${userId}`, String(points));
}

// User level title cache
export function getUserLevelTitleCache(userId: string): string | null {
  return localStorage.getItem(`${LS_KEYS.userLevelTitlePrefix}${userId}`);
}
export function setUserLevelTitleCache(userId: string, title: string): void {
  localStorage.setItem(`${LS_KEYS.userLevelTitlePrefix}${userId}`, title);
}

// Stats cache (non-user specific)
export function getStatsCache() {
  return {
    achievementsTotal: Number(localStorage.getItem(LS_KEYS.achievementsTotal) || 0),
    achievementsEarned: Number(localStorage.getItem(LS_KEYS.achievementsEarned) || 0),
    totalMethods: Number(localStorage.getItem(LS_KEYS.totalMethods) || 0),
    completedMethods: Number(localStorage.getItem(LS_KEYS.completedMethods) || 0),
    savedMethodsCount: Number(localStorage.getItem(LS_KEYS.savedMethodsCount) || 0),
  };
}
export function setStatsCache(stats: {
  achievementsTotal?: number;
  achievementsEarned?: number;
  totalMethods?: number;
  completedMethods?: number;
  savedMethodsCount?: number;
}) {
  if (stats.achievementsTotal !== undefined) {
    localStorage.setItem(LS_KEYS.achievementsTotal, String(stats.achievementsTotal));
  }
  if (stats.achievementsEarned !== undefined) {
    localStorage.setItem(LS_KEYS.achievementsEarned, String(stats.achievementsEarned));
  }
  if (stats.totalMethods !== undefined) {
    localStorage.setItem(LS_KEYS.totalMethods, String(stats.totalMethods));
  }
  if (stats.completedMethods !== undefined) {
    localStorage.setItem(LS_KEYS.completedMethods, String(stats.completedMethods));
  }
  if (stats.savedMethodsCount !== undefined) {
    localStorage.setItem(LS_KEYS.savedMethodsCount, String(stats.savedMethodsCount));
  }
}