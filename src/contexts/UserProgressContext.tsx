import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserProgress as useUserProgressHook } from "../hooks/useUserProgress";

interface UserProgressContextType {
  points: number;
  levelTitle: string;
  levelTier: any;
  addPoints: (amount: number) => void;
  refreshProfile: () => void;
  userId: string | null;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(
  undefined
);

export function UserProgressProvider({ children }: { children: ReactNode }) {
  const { refreshProfile } = useUserProfile();
  const { points: hookPoints, levelTitle, levelTier } = useUserProgressHook();
  const { userId } = useUserProfile();
  
  // Local state for optimistic points updates
  const [localPoints, setLocalPoints] = useState(hookPoints);

  // Sync local points when hook points change (from DB)
  useEffect(() => {
    setLocalPoints(hookPoints);
  }, [hookPoints]);

  // Optimistically add points immediately
  const addPoints = (amount: number) => {
    setLocalPoints((prev) => {
      const newTotal = prev + amount;
      console.log(`[addPoints] Adding ${amount} points. Total: ${prev} -> ${newTotal}`);
      return newTotal;
    });
    // Don't refresh here - the DB will sync naturally, and we keep local optimistic value
  };

  return (
    <UserProgressContext.Provider
      value={{ points: localPoints, levelTitle, levelTier, addPoints, refreshProfile, userId }}
    >
      {children}
    </UserProgressContext.Provider>
  );
}

export function useUserProgressContext() {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error(
      "useUserProgressContext must be used within a UserProgressProvider"
    );
  }
  return context;
}
