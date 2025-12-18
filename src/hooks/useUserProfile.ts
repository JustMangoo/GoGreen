import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Profile } from "../services/profiles";
import { useAuth } from "./useAuth";

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { userId } = useAuth();

  // Load profile when userId changes or refresh is triggered
  useEffect(() => {
    let abort = false;

    const loadProfile = async () => {
      if (!userId) {
        if (!abort) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,points")
        .eq("id", userId)
        .limit(1)
        .maybeSingle();

      if (abort) return;
      if (error) {
        console.error("Error loading profile", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    loadProfile();
    return () => {
      abort = true;
    };
  }, [userId, refreshTrigger]);

  const refreshProfile = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return { profile, userId, loading, refreshProfile };
}
