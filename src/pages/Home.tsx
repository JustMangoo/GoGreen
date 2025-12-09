import ProgressCard from "../components/Tools/ProgressCard";
import { TrendingUp, Award, BookOpen, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { useSavedMethods } from "../hooks/useSavedMethods";
import { useUserProfile } from "../hooks/useUserProfile";
import { listMethods } from "../services/methods";
import {
  getUserAchievements,
  getCompletedMethodsCount,
} from "../services/achievementOperations";
import { Achievements } from "../constants/achievements";
import type { Method } from "../services/methods";
import { getLevelTier } from "../constants/levels";

export default function Home() {
  const [savedMethods, setSavedMethods] = useState<Method[]>([]);
  const [achievementsEarned, setAchievementsEarned] = useState(0);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [completedLoading, setCompletedLoading] = useState(true);
  const [totalMethods, setTotalMethods] = useState(0);
  const { savedIds } = useSavedMethods();
  const { profile } = useUserProfile();

  const achievementsTotal = Achievements.length;

  const navigate = useNavigate();
  const points = profile?.points || 0;

  useEffect(() => {
    let abort = false;

    const loadSavedMethods = async () => {
      try {
        const allMethods = await listMethods();
        if (abort) return;

        setTotalMethods(allMethods.length);

        // Filter to only saved methods
        const saved = allMethods.filter((method) =>
          savedIds.has(String(method.id))
        );
        setSavedMethods(saved);
      } catch (error) {
        console.error("Error loading saved methods:", error);
      }
    };

    if (savedIds.size > 0) {
      loadSavedMethods();
    } else {
      setSavedMethods([]);
    }
  }, [savedIds]);

  useEffect(() => {
    let abort = false;

    const loadAchievements = async () => {
      setAchievementsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const earnedIds = await getUserAchievements(userData.user.id);
        if (!abort) {
          setAchievementsEarned(earnedIds.length);
        }
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        if (!abort) setAchievementsLoading(false);
      }
    };

    loadAchievements();

    return () => {
      abort = true;
    };
  }, []);

  useEffect(() => {
    let abort = false;

    const loadCompleted = async () => {
      setCompletedLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const count = await getCompletedMethodsCount(userData.user.id);
        if (!abort) {
          setCompletedCount(count);
        }
      } catch (error) {
        console.error("Error loading completed methods:", error);
      } finally {
        if (!abort) setCompletedLoading(false);
      }
    };

    loadCompleted();

    return () => {
      abort = true;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-base-100 p-4 gap-4">
      {/* Level Card */}
      <ProgressCard
        icon={TrendingUp}
        heading="Level"
        subheading={getLevelTier(points).name}
        progressLabel="Next Level"
        progressCurrent={points}
        progressMax={getLevelTier(points).maxPoints}
        showProgressBar={true}
      />

      {/* Learned Methods Card */}
      <button onClick={() => navigate("/methods")} className="w-full">
        <ProgressCard
          icon={BookOpen}
          heading="Mastered Methods"
          subheading={
            completedLoading
              ? "Loading..."
              : `${completedCount} / ${totalMethods}`
          }
          progressLabel="Completed"
          progressCurrent={completedCount}
          progressMax={Math.max(totalMethods, 1)}
          showProgressBar={true}
        />
      </button>

      {/* Achievements Card */}
      <button onClick={() => navigate("/achievements")} className="w-full">
        <ProgressCard
          icon={Award}
          heading="Achievements"
          subheading={
            achievementsLoading
              ? "Loading..."
              : `${achievementsEarned} / ${achievementsTotal}`
          }
          progressLabel="Unlocked"
          progressCurrent={achievementsEarned}
          progressMax={achievementsTotal}
          showProgressBar={true}
        />
      </button>

      {/* Saved Methods List */}
      <div className=" card card-border border-base-300 bg-base-200 w-full max-w-md p-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center border-base-300 border-2 bg-base-100 text-primary rounded-box w-12 h-12">
            <Heart size={20} />
          </div>
          <h3 className="font-semibold text-lg">Saved Methods</h3>
        </div>
        {savedMethods.length === 0 ? (
          <p className="text-sm text-base-content/60 text-center py-4">
            No saved methods yet. Start saving methods to see them here!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => navigate(`/method-details?id=${method.id}`)}
                className="card image-full h-24 hover:shadow-lg transition-shadow text-left group relative overflow-hidden"
                style={{
                  backgroundImage: `url(${
                    method.image_url || "https://placehold.co/400x300"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="bg-black/40 w-full h-full flex flex-col justify-between p-3">
                  <p className="font-semibold text-sm line-clamp-2 text-white">
                    {method.title}
                  </p>
                  <div className="bg-base-100 rounded-box px-2 py-1 w-fit">
                    <p className="text-xs text-neutral">{method.category}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
