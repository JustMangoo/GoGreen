import ProgressCard from "../components/Tools/ProgressCard";
import { TrendingUp, Award, BookOpen, Heart } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { useSavedMethods } from "../hooks/useSavedMethods";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  getUserAchievements,
  getCompletedMethodsCount,
} from "../services/achievementOperations";
import { Achievements } from "../constants/achievements";
import type { Method } from "../services/methods";
import { getLevelTier } from "../constants/levels";
import { getThumbnailUrl, getLQIPUrl } from "../utils/imageHelpers";

export default function Home() {
  // 1. Separate Loading States to prevent "All-or-Nothing" blocking
  const [savedMethods, setSavedMethods] = useState<Method[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);

  const [statsLoading, setStatsLoading] = useState(true);
  const [achievementsEarned, setAchievementsEarned] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalMethods, setTotalMethods] = useState(0);

  const { savedIds } = useSavedMethods();
  const { profile, userId } = useUserProfile();

  const achievementsTotal = Achievements.length;
  const navigate = useNavigate();
  const points = profile?.points || 0;
  const levelTier = useMemo(() => getLevelTier(points), [points]);

  // OPTIMIZATION 1: Fetch Stats independently (Fast)
  useEffect(() => {
    let abort = false;
    
    // Don't reset loading to true here on re-renders to avoid UI flashing
    // Only if we truly need to reload. For now, we keep the existing data visible.

    const loadStats = async () => {
      try {
        // HEAD request is super fast
        const countPromise = supabase
          .from("methods")
          .select("id", { count: "exact", head: true });

        // User stats
        const userStatsPromise = userId 
          ? Promise.all([
              getUserAchievements(userId),
              getCompletedMethodsCount(userId),
            ])
          : Promise.resolve([[], 0] as const);

        // Run these parallel
        const [countRes, [earnedIds, completed]] = await Promise.all([
          countPromise,
          userStatsPromise
        ]);

        if (abort) return;

        setTotalMethods(countRes.count || 0);
        setAchievementsEarned(earnedIds.length);
        setCompletedCount(completed);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        if (!abort) setStatsLoading(false);
      }
    };

    loadStats();
    return () => { abort = true; };
  }, [userId]);

  // OPTIMIZATION 2: Fetch Saved Methods independently (Slower)
  useEffect(() => {
    let abort = false;
    
    // Only set loading if we actually have IDs to fetch
    if (savedIds.size > 0) {
      setMethodsLoading(true);
    } else {
      setSavedMethods([]);
      setMethodsLoading(false);
      return;
    }

    const loadSavedMethods = async () => {
      try {
        const { data, error } = await supabase
          .from("methods")
          .select("id,title,category,image_url,description,duration")
          .in("id", Array.from(savedIds).map(Number));

        if (error) throw error;
        if (!abort) setSavedMethods(data || []);
      } catch (error) {
        console.error("Error loading saved methods:", error);
      } finally {
        if (!abort) setMethodsLoading(false);
      }
    };

    loadSavedMethods();
    return () => { abort = true; };
  }, [savedIds]);

  const deferredSavedMethods = useDeferredValue(savedMethods);

  const savedMethodsContent = useMemo(() => {
    // 1. Loading State (Skeleton)
    if (methodsLoading) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="card h-24 bg-base-100 shadow-none border border-base-200 overflow-hidden">
               <div className="skeleton w-full h-24 rounded-none"></div>
            </div>
          ))}
        </div>
      );
    }

    // 2. Empty State
    if (deferredSavedMethods.length === 0) {
      return (
        <p className="text-sm text-base-content/60 text-center py-4">
          No saved methods yet. Start saving methods to see them here!
        </p>
      );
    }

    // 3. Data State
    return (
      <div className="grid grid-cols-2 gap-3" style={{ contain: 'layout' }}>
        {deferredSavedMethods.map((method, index) => (
          <button
            key={method.id}
            onClick={() => navigate(`/method-details?id=${method.id}`)}
            className="cursor-pointer card h-24 hover:shadow-lg transition-shadow text-left group relative overflow-hidden bg-base-100"
            style={{
              backgroundImage: `url('${getLQIPUrl(method.image_url, { width: 20, height: 9 })}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <img
              src={getThumbnailUrl(method.image_url, {
                width: 220,
                height: 96,
                quality: 25,
              })}
              srcSet={[
                `${getThumbnailUrl(method.image_url, { width: 180, height: 96, quality: 22 })} 180w`,
                `${getThumbnailUrl(method.image_url, { width: 220, height: 96, quality: 25 })} 220w`,
                `${getThumbnailUrl(method.image_url, { width: 320, height: 144, quality: 35 })} 320w`,
                `${getThumbnailUrl(method.image_url, { width: 400, height: 192, quality: 60 })} 400w`,
              ].join(", ")}
              sizes="(max-width: 480px) 44vw, (max-width: 1024px) 185px, 255px"
              alt={method.title}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index < 2 ? "high" : "auto"}
              width={220}
              height={96}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
              <p className="font-semibold text-sm line-clamp-1 text-white shadow-sm">
                {method.title}
              </p>
              <span className="text-[10px] text-gray-200">{method.category}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }, [deferredSavedMethods, methodsLoading, navigate]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-base-100 p-4 gap-4">
      {/* Level Card - Always renders fast thanks to default 0 points */}
      <ProgressCard
        icon={TrendingUp}
        heading="Level"
        subheading={levelTier.name}
        progressLabel="Next Level"
        progressCurrent={points}
        progressMax={levelTier.maxPoints}
        showProgressBar={true}
      />

      {/* Stats Cards - With dedicated loading skeleton */}
      <div className="w-full flex flex-col gap-4">
        {statsLoading ? (
          <>
            <div className="w-full h-32 skeleton rounded-box opacity-40"></div>
            <div className="w-full h-32 skeleton rounded-box opacity-40"></div>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/methods")}
              className="w-full cursor-pointer"
            >
              <ProgressCard
                icon={BookOpen}
                heading="Mastered Methods"
                subheading="Master More →"
                progressLabel="Completed"
                progressCurrent={completedCount}
                progressMax={Math.max(totalMethods, 1)}
                showProgressBar={true}
              />
            </button>

            <button
              onClick={() => navigate("/achievements")}
              className="w-full cursor-pointer"
            >
              <ProgressCard
                icon={Award}
                heading="Achievements"
                subheading="View All →"
                progressLabel="Unlocked"
                progressCurrent={achievementsEarned}
                progressMax={achievementsTotal}
                showProgressBar={true}
              />
            </button>
          </>
        )}
      </div>

      {/* Saved Methods List */}
      <div className="card card-border border-base-300 bg-base-200 w-full max-w-md p-3 gap-4" style={{ contentVisibility: 'auto' }}>
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center border-base-300 border-2 bg-base-100 text-primary rounded-box w-12 h-12">
            <Heart size={20} />
          </div>
          <h2 className="font-semibold text-lg">Saved Methods</h2>
        </div>
        {savedMethodsContent}
      </div>
    </div>
  );
}