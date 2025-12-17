import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { TrendingUp, Award, BookOpen, Heart } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

import ProgressCard from "../components/Tools/ProgressCard";

import { useSavedMethods } from "../hooks/useSavedMethods";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserProgress } from "../hooks/useUserProgress";

import { getUserAchievements } from "../services/achievements";
import { getCompletedMethodsCount } from "../services/methods";
import { getStatsCache, setStatsCache } from "../services/statsCache";
import { getThumbnailUrl, getLQIPUrl } from "../utils/imageHelpers";
import { Achievements } from "../constants/achievements";

import type { Method } from "../services/methods";

export default function Home() {
  const { savedIds } = useSavedMethods();
  const { userId, profile } = useUserProfile();
  const { points, levelTitle, levelTier } = useUserProgress();
  
  // Keep loading until profile is actually loaded to prevent cached title flash
  const isLevelLoading = !levelTitle || !profile;
  const achievementsTotal = Achievements.length;

  // --- State Initialization (Cache-First) ---

  const cachedStats = getStatsCache();
  
  const [totalMethods, setTotalMethods] = useState(cachedStats.totalMethods);
  const [achievementsEarned, setAchievementsEarned] = useState(cachedStats.achievementsEarned);
  const [completedCount, setCompletedCount] = useState(cachedStats.completedMethods);
  const [savedMethods, setSavedMethods] = useState<Method[]>([]);

  // Only show stats skeleton if cache is completely empty
  const [statsLoading, setStatsLoading] = useState(() => 
    cachedStats.achievementsEarned === 0 && 
    cachedStats.completedMethods === 0 && 
    cachedStats.totalMethods === 0
  );

  // Trust cache for saved methods to prevent "Empty -> Data" flash
  // Start with loading=true unless cache explicitly says 0 AND we're logged in
  const [methodsLoading, setMethodsLoading] = useState(() => {
    const { savedMethodsCount } = getStatsCache();
    // Only show empty immediately if cache says 0 AND user is already known
    return savedMethodsCount !== 0 || !userId;
  });

  const [skeletonCount] = useState(() => {
    const { savedMethodsCount } = getStatsCache();
    return Math.min(savedMethodsCount || 4, 6);
  });

  // --- Effects ---

  // 1. Load Dashboard Stats
  useEffect(() => {
    let abort = false;

    const loadStats = async () => {
      try {
        const countPromise = supabase
          .from("methods")
          .select("id", { count: "exact", head: true });

        const userStatsPromise = userId 
          ? Promise.all([
              getUserAchievements(userId),
              getCompletedMethodsCount(userId),
            ])
          : Promise.resolve([[], 0] as const);

        const [countRes, [earnedIds, completed]] = await Promise.all([
          countPromise,
          userStatsPromise
        ]);

        if (abort) return;

        const methodsCount = countRes.count || 0;
        const earnedCount = earnedIds.length;

        setTotalMethods(methodsCount);
        setAchievementsEarned(earnedCount);
        setCompletedCount(completed);

        setStatsCache({
          totalMethods: methodsCount,
          achievementsEarned: earnedCount,
          completedMethods: completed,
          achievementsTotal: Achievements.length,
        });

      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        if (!abort) setStatsLoading(false);
      }
    };

    loadStats();
    return () => { abort = true; };
  }, [userId]);

  // 2. Load Saved Methods
  useEffect(() => {
    let abort = false;
    
    if (savedIds.size > 0) {
      setMethodsLoading(true);
    } 
    // Only confirm "Empty" if we have a userId (auth loaded) and truly 0 IDs
    else if (savedIds.size === 0 && userId) {
      setSavedMethods([]);
      setMethodsLoading(false);
      setStatsCache({ savedMethodsCount: 0 });
      return;
    }

    const loadSavedMethods = async () => {
      if (savedIds.size === 0) return;

      try {
        const { data, error } = await supabase
          .from("methods")
          .select("id,title,category,image_url,description,duration")
          .in("id", Array.from(savedIds).map(Number));

        if (error) throw error;
        
        if (!abort) {
          const methods = data || [];
          setSavedMethods(methods);
          setStatsCache({ savedMethodsCount: methods.length });
        }
      } catch (error) {
        console.error("Error loading saved methods:", error);
      } finally {
        if (!abort) setMethodsLoading(false);
      }
    };

    loadSavedMethods();
    return () => { abort = true; };
  }, [savedIds, userId]);

  // --- Render Helpers ---

  const deferredSavedMethods = useDeferredValue(savedMethods);

  const savedMethodsContent = useMemo(() => {
    if (methodsLoading) {
      return (
        <div className="grid grid-cols-2 gap-3" style={{ minHeight: '120px' }}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="card h-24 bg-base-100 shadow-none border border-base-200 p-0 overflow-hidden">
              <div className="skeleton w-full h-full rounded-none"></div>
            </div>
          ))}
        </div>
      );
    }

    if (deferredSavedMethods.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center min-h-[120px]">
          <p className="text-sm text-base-content/60">No saved methods yet.</p>
          <Link to="/methods" className="link link-primary text-xs mt-1">
            Start exploring
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {deferredSavedMethods.map((method, index) => (
          <Link
            key={method.id}
            to={`/method-details?id=${method.id}`}
            // @ts-ignore
            prefetch="intent"
            aria-label={`View details for ${method.title}`}
            className="cursor-pointer card h-24 bg-base-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden block"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity"
              style={{ backgroundImage: `url('${getLQIPUrl(method.image_url, { width: 20, height: 9 })}')` }}
            />
            <img
              src={getThumbnailUrl(method.image_url, { width: 220, height: 96, quality: 25 })}
              srcSet={`
                ${getThumbnailUrl(method.image_url, { width: 180, height: 96, quality: 22 })} 180w,
                ${getThumbnailUrl(method.image_url, { width: 220, height: 96, quality: 25 })} 220w,
                ${getThumbnailUrl(method.image_url, { width: 400, height: 192, quality: 60 })} 400w
              `}
              sizes="(max-width: 480px) 44vw, 220px"
              alt={method.title}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index < 2 ? "high" : "auto"}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
              <p className="font-semibold text-sm line-clamp-1 text-white shadow-sm">{method.title}</p>
              <span className="text-[10px] text-gray-200">{method.category}</span>
            </div>
          </Link>
        ))}
      </div>
    );
  }, [deferredSavedMethods, methodsLoading, skeletonCount]);

  // --- Main Render ---

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-base-100 p-4 gap-4">
      
      {/* Level Progress */}
      <section aria-labelledby="level-heading" className="w-full">
        <ProgressCard
          icon={TrendingUp}
          heading="Level"
          subheading={levelTitle}
          progressLabel="Next Level"
          progressCurrent={points}
          progressMax={levelTier.maxPoints}
          showProgressBar={true}
          loading={isLevelLoading}
        />
      </section>

      {/* Statistics */}
      <section aria-label="Statistics" className="w-full flex flex-col gap-4">
        {statsLoading ? (
          <>
            <div className="skeleton w-full h-32 rounded-2xl"></div>
            <div className="skeleton w-full h-32 rounded-2xl"></div>
          </>
        ) : (
          <>
            <Link to="/methods" prefetch="intent" className="block w-full" aria-label="View mastered methods">
              <ProgressCard
                icon={BookOpen}
                heading="Mastered Methods"
                subheading="Master More →"
                progressLabel="Completed"
                progressCurrent={completedCount}
                progressMax={Math.max(totalMethods, 1)}
                showProgressBar={true}
              />
            </Link>

            <Link to="/achievements" prefetch="intent" className="block w-full" aria-label="View achievements">
              <ProgressCard
                icon={Award}
                heading="Achievements"
                subheading="View All →"
                progressLabel="Unlocked"
                progressCurrent={achievementsEarned}
                progressMax={achievementsTotal}
                showProgressBar={true}
              />
            </Link>
          </>
        )}
      </section>

      {/* Saved Methods */}
      <section 
        aria-labelledby="saved-methods-heading" 
        className="card card-border border-base-200 bg-base-200/50 w-full max-w-md p-3 gap-4"
        style={{ contentVisibility: 'auto' }}
      >
        <div className="flex items-center gap-2 px-1">
          <div className="flex justify-center items-center bg-base-100 text-primary rounded-xl w-10 h-10 shadow-sm border border-base-200">
            <Heart size={20} />
          </div>
          <h2 id="saved-methods-heading" className="font-semibold text-lg">Saved Methods</h2>
        </div>
        
        {savedMethodsContent}
      </section>
    </main>
  );
}