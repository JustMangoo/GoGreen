import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getLevelTier } from "../../constants/levels";

export default function TopBar() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("points")
            .eq("id", userData.user.id)
            .single();

          if (profile) {
            setPoints(profile.points || 0);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const currentTier = getLevelTier(points);

  return (
    <header className="w-full flex justify-between py-3 px-4 sticky top-0 border-b border-base-300 bg-base-100 shadow-lg">
      <div className="flex flex-col justify-center">
        <h1 className="font-bold text-sm">{currentTier.name}</h1>
        <p className="text-xs text-base-content/60">
          {loading ? "..." : `${points} points`}
        </p>
      </div>
      <div className="avatar">
        <div className="w-12 rounded-full">
          <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
        </div>
      </div>
    </header>
  );
}
