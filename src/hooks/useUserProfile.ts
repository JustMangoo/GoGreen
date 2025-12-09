import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface UserProfile {
  points: number;
}

export function useUserProfile(refetchTrigger?: number) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", userData.user.id)
          .single();

        if (profileData) {
          setProfile(profileData as UserProfile);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchProfile();
  }, [refetchTrigger]);

  // Also set up a polling interval to check for updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchProfile();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { profile, loading, refetchProfile };
}
