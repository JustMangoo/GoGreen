import { useState, useEffect } from "react";
import {
  getSavedMethodIds,
  addSavedMethod,
  removeSavedMethod,
} from "../services/savedMethods";
import { useAuth } from "./useAuth";
import { checkAndAwardAchievements } from "../services/achievements";

export function useSavedMethods(addPoints?: (amount: number) => void) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const [newAchievements, setNewAchievements] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      pointsReward: number;
    }>
  >([]);

  // 2. Load saved methods whenever userId changes
  useEffect(() => {
    let abort = false;

    const loadSaved = async (uid: string) => {
      try {
        const ids = await getSavedMethodIds(uid);
        if (!abort) {
          setSavedIds(new Set(ids));
        }
      } catch (err) {
        if (!abort) {
          console.error("Error fetching saved methods:", err);
        }
      }
    };

    if (userId) {
      loadSaved(userId);
    }

    return () => {
      abort = true;
    };
  }, [userId]);

  // 3. The Toggle Action
  const toggleSave = async (methodId: string) => {
    setError(null);
    setSavingId(methodId);

    try {
      if (!userId) throw new Error("You must be logged in to save methods.");

      const methodIdValue = Number(methodId);
      if (Number.isNaN(methodIdValue)) throw new Error("Invalid method ID");

      if (savedIds.has(methodId)) {
        await removeSavedMethod(userId, methodIdValue);

        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(methodId);
          return next;
        });
      } else {
        await addSavedMethod(userId, methodIdValue);

        // Compute next saved count without side-effects in setState
        const nextSize = savedIds.size + 1;

        setSavedIds((prev) => {
          const next = new Set(prev);
          next.add(methodId);
          return next;
        });

        // Award achievements and update points once
        const earned = await checkAndAwardAchievements(userId, nextSize);
        if (earned.length > 0) {
          setNewAchievements((prev) => [...prev, ...earned]);
          if (addPoints) {
            const totalPoints = earned.reduce(
              (sum, a) => sum + a.pointsReward,
              0
            );
            addPoints(totalPoints);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const clearAchievement = () => {
    setNewAchievements((prev) => prev.slice(1));
  };

  return {
    savedIds,
    savingId,
    toggleSave,
    error,
    newAchievements,
    clearAchievement,
  };
}
