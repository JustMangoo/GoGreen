import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Profile } from "../services/profiles";

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen to auth state changes for instant updates
  useEffect(() => {
    let abort = false;

    // Get initial session
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (abort) return;
      const uid = sessionData.session?.user.id ?? null;
      setUserId(uid);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (abort) return;
      setUserId(session?.user.id ?? null);
    });

    return () => {
      abort = true;
      subscription.unsubscribe();
    };
  }, []);

  // Load profile when userId changes
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
  }, [userId]);

  return { profile, userId, loading };
}
