import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  getSavedMethodIds,
  addSavedMethod,
  removeSavedMethod,
} from "../services/savedMethods";

export function useSavedMethods() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Listen for Auth Changes
  useEffect(() => {
    let abort = false;

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (abort) return;

      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
        setSavedIds(new Set());
      }
    });

    return () => {
      abort = true;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Load saved methods whenever userId changes
  useEffect(() => {
    let abort = false;

    const loadSaved = async (uid: string) => {
      try {
        const ids = await getSavedMethodIds(uid);
        if (!abort) {
          console.log("Loaded saved method IDs:", ids);
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
        // Use Service to Remove
        await removeSavedMethod(userId, methodIdValue);

        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(methodId);
          return next;
        });
      } else {
        // Use Service to Add
        await addSavedMethod(userId, methodIdValue);

        setSavedIds((prev) => new Set(prev).add(methodId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  return { savedIds, savingId, toggleSave, error };
}
