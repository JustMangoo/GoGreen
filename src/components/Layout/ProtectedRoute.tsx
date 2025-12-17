import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { supabase } from "../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let abort = false;

    // Check if user is logged in
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (!abort) {
          setSession(session);
          if (!session) {
            navigate("/auth");
          }
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (!abort) {
          setSession(session);
          if (!session) {
            navigate("/auth");
          }
        }
      }
    );

    return () => {
      abort = true;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    // Find the scrollable container and scroll to top
    const scrollContainer = document.querySelector(".flex-1.overflow-auto");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [location.pathname]);

 

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
