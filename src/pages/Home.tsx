import ProgressCard from "../components/Tools/ProgressCard";
import Popup from "../components/Tools/Popup";
import { TrendingUp, Award, BookOpen, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { useSavedMethods } from "../hooks/useSavedMethods";
import { useUserProfile } from "../hooks/useUserProfile";
import { listMethods } from "../services/methods";
import { removeSavedMethod } from "../services/savedMethods";
import { getUserAchievements } from "../services/achievementOperations";
import { Achievements } from "../constants/achievements";
import type { Method } from "../services/methods";
import { getLevelTier, getNextLevelTier } from "../constants/levels";

export default function Home() {
  const [savedMethods, setSavedMethods] = useState<Method[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [methodToRemove, setMethodToRemove] = useState<Method | null>(null);
  const [achievementsEarned, setAchievementsEarned] = useState(0);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
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

  const handleRemoveClick = (method: Method) => {
    setMethodToRemove(method);
    setPopupOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!methodToRemove) return;

    try {
      const user = (
        await import("../lib/supabaseClient")
      ).supabase.auth.getUser();
      const { data: userData } = await user;
      if (userData.user) {
        await removeSavedMethod(userData.user.id, Number(methodToRemove.id));
        setSavedMethods(savedMethods.filter((m) => m.id !== methodToRemove.id));
      }
    } catch (error) {
      console.error("Error removing saved method:", error);
    } finally {
      setPopupOpen(false);
      setMethodToRemove(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 gap-4">
      {/* Level Card */}
      <ProgressCard
        icon={TrendingUp}
        heading="Level"
        subheading={getLevelTier(points).name}
        progressLabel="Next Level"
        progressCurrent={points}
        progressMax={getNextLevelTier(points)?.maxPoints}
        showProgressBar={true}
      />

      {/* Learned Methods Card */}
      <ProgressCard
        icon={BookOpen}
        heading="Mastered Methods"
        subheading="5 / 10"
        progressLabel="Progress"
        progressCurrent={5}
        progressMax={10}
        showProgressBar={true}
      />

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
      <div className=" card card-border bg-base-100 w-full max-w-md p-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center bg-base-200 text-primary rounded-box w-12 h-12">
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
                  <div className="bg-base-200 rounded-box px-2 py-1 w-fit">
                    <p className="text-xs text-neutral">{method.category}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick(method);
                  }}
                  className="btn btn-ghost btn-xs p-0 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="text-error fill-error" size={16} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      <Popup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        heading="Remove Saved Method?"
        body={`Are you sure you want to remove "${methodToRemove?.title}" from your saved methods?`}
        primaryAction={{
          label: "Remove",
          onClick: handleConfirmRemove,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setPopupOpen(false),
        }}
        primaryButtonClass="btn-error"
      />
    </div>
  );
}
