import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Single source of truth for auth state
 */
export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;

    // Get initial session
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (abort) return;
      const uid = sessionData.session?.user.id ?? null;
      setUserId(uid);
    });

    // Listen for auth changes (single listener)
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

  return { userId };
}
