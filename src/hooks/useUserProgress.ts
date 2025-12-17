import { useEffect, useMemo, useState } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { getLevelTier } from "../constants/levels";
import {
  getUserPointsCache,
  setUserPointsCache,
  getUserLevelTitleCache,
  setUserLevelTitleCache,
} from "../services/statsCache";

export function useUserProgress() {
  const { profile, userId } = useUserProfile();
  const [points, setPoints] = useState(0);
  const [levelTitle, setLevelTitle] = useState("");

  // Compute level from points
  const levelTier = useMemo(() => getLevelTier(points), [points]);

  // Load cached values as soon as we know userId
  useEffect(() => {
    if (!userId) {
      setPoints(0);
      setLevelTitle("");
      return;
    }
    const cachedPoints = getUserPointsCache(userId);
    if (cachedPoints !== null) setPoints(cachedPoints);

    const cachedTitle = getUserLevelTitleCache(userId);
    if (cachedTitle !== null) setLevelTitle(cachedTitle);
  }, [userId]);

  // Sync points from profile and cache
  useEffect(() => {
    if (userId && typeof profile?.points === "number") {
      setPoints(profile.points);
      setUserPointsCache(userId, profile.points);
    }
  }, [userId, profile?.points]);

  // Sync level title whenever computed level changes
  useEffect(() => {
    if (userId && levelTier?.name) {
      setLevelTitle(levelTier.name);
      setUserLevelTitleCache(userId, levelTier.name);
    }
  }, [userId, levelTier?.name]);

  return { points, levelTitle, levelTier };
}