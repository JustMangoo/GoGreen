import ProgressCard from "../components/Tools/ProgressCard";
import Popup from "../components/Tools/Popup";
import { TrendingUp, Award, BookOpen, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useSavedMethods } from "../hooks/useSavedMethods";
import { listMethods } from "../services/methods";
import { removeSavedMethod } from "../services/savedMethods";
import type { Method } from "../services/methods";

export default function Home() {
  const [savedMethods, setSavedMethods] = useState<Method[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [methodToRemove, setMethodToRemove] = useState<Method | null>(null);
  const [removing, setRemoving] = useState(false);
  const { savedIds } = useSavedMethods();

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

  const handleRemoveClick = (method: Method) => {
    setMethodToRemove(method);
    setPopupOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!methodToRemove) return;

    setRemoving(true);
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
      setRemoving(false);
      setPopupOpen(false);
      setMethodToRemove(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 gap-4">
      {/* Level Card */}
      <ProgressCard
        icon={TrendingUp}
        iconBgColor="bg-primary"
        heading="Level"
        subheading="Pickling Beginner"
        progressLabel="Next Level"
        progressCurrent={125}
        progressMax={250}
        showProgressBar={true}
      />

      {/* Learned Methods Card */}
      <ProgressCard
        icon={BookOpen}
        iconBgColor="bg-primary"
        heading="Mastered Methods"
        subheading="5 / 10"
        progressLabel="Progress"
        progressCurrent={5}
        progressMax={10}
        showProgressBar={true}
      />

      {/* Achievements Card */}
      <ProgressCard
        icon={Award}
        iconBgColor="bg-primary"
        heading="Achievements"
        subheading="2 / 3"
        progressLabel="Unlocked"
        progressCurrent={2}
        progressMax={3}
        showProgressBar={true}
      />

      {/* Saved Methods List */}
      <div className="card card-border p-3 w-full max-w-md space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex justify-center items-center bg-primary text-white rounded-box w-12 h-12`}
          >
            <Heart />
          </div>
          <h3 className="font-semibold text-lg">Saved Methods</h3>
        </div>
        {savedMethods.length === 0 ? (
          <p className="text-sm text-base-content/60 text-center py-4">
            No saved methods yet. Start saving methods to see them here!
          </p>
        ) : (
          <div className="space-y-2">
            {savedMethods.map((method) => (
              <div
                key={method.id}
                className="card bg-base-100  flex flex-row items-center gap-3 hover:bg-base-200 transition-colors cursor-pointer"
              >
                {method.image_url ? (
                  <img
                    src={method.image_url}
                    alt={method.title}
                    className="w-12 h-12 rounded-box object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-base-200 rounded-box flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{method.title}</p>
                  <p className="text-xs text-base-content/60">
                    {method.category}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveClick(method)}
                  className="btn btn-ghost btn-xs p-0 hover:text-error"
                >
                  <Heart className="text-neutral fill-neutral" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      <Popup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        heading="Remove Saved Method?"
        description={`Are you sure you want to remove "${methodToRemove?.title}" from your saved methods?`}
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
