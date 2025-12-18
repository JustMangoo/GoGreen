import { Heart, ArrowLeft } from "lucide-react";
import { listMethods } from "../services/methods";
import { useEffect, useState, useMemo } from "react";
import type { Method } from "../services/methods";
import AddMethodForm from "../components/Tools/AddMethodForm";
import { useSavedMethods } from "../hooks/useSavedMethods";
import { useUserProgressContext } from "../contexts/UserProgressContext";
import { useSearchParams, useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import AchievementPopup from "../components/Tools/AchievementPopup";
import { getThumbnailUrl } from "../utils/imageHelpers";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function MethodList() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [methods, setMethods] = useState<Method[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [newAchievement, setNewAchievement] = useState<{
    name: string;
    description: string;
    pointsReward: number;
  } | null>(null);
  const { addPoints } = useUserProgressContext();
  const {
    savedIds,
    savingId,
    toggleSave,
    error: saveError,
    newAchievements,
    clearAchievement,
  } = useSavedMethods(addPoints);

  // Handle achievement popup from saved methods
  useEffect(() => {
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
      clearAchievement();
    }
  }, [newAchievements, clearAchievement]);

  useEffect(() => {
    // Get current user email
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    let abort = false;

    setLoading(true);
    setError(null);

    listMethods()
      .then((items) => {
        if (abort) return;
        setMethods(items);
      })
      .catch((fetchError) => {
        if (!abort) setError(fetchError.message);
      })
      .finally(() => {
        if (!abort) setLoading(false);
      });

    return () => {
      abort = true;
    };
  }, []);

  const filteredMethods = useMemo(() => {
    return methods.filter((method) => {
      const matchesCategory =
        !categoryParam || method.category === categoryParam;

      return matchesCategory;
    });
  }, [methods, categoryParam]);

  const hasMethods = useMemo(
    () => filteredMethods.length > 0,
    [filteredMethods]
  );

  const isAdmin = userEmail === ADMIN_EMAIL;

  return (
    <div className="flex flex-col gap-4 items-center justify-start min-h-screen bg-base-100 p-4 mb-16">
      {/* Achievement Popup */}
      <AchievementPopup
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />

      {isAdmin && (
        <button
          className="btn btn-primary w-full"
          type="button"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Close" : "Add Method"}
        </button>
      )}

      <AddMethodForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setLoading(true);
          listMethods()
            .then(setMethods)
            .catch((fetchError) => setError(fetchError.message))
            .finally(() => setLoading(false));
        }}
      />

      {loading && <div className="loading loading-spinner loading-lg"></div>}
      {(error || saveError) && (
        <div className="alert alert-error">{error || saveError}</div>
      )}
      {!loading && !hasMethods && (
        <div className="text-center text-lg opacity-60">
          {methods.length === 0
            ? "No methods found"
            : "No methods match your filters"}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm self-start"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <ul className="grid grid-cols-2 gap-3 p-0 bg-base-100 rounded-box w-full">
        {filteredMethods.map((method) => (
          <li key={method.id} className="p-0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/method-details?id=${method.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/method-details?id=${method.id}`);
                }
              }}
              className="card bg-base-100 image-full shadow-sm h-48 w-full cursor-pointer transition-shadow"
            >
              <figure>
                <img
                  src={getThumbnailUrl(method.image_url, {
                    width: 400,
                    height: 384,
                    quality: 75,
                  })}
                  alt={method.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body p-3 items-start ">
                <h2 className="card-title text-sm line-clamp-2">
                  {method.title}
                </h2>

                <div className="card-actions w-full items-baseline justify-between mt-auto">
                  <div className="bg-base-100 rounded-box px-2 py-1 w-fit">
                    <p className="text-xs text-neutral">{method.duration}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSave(String(method.id));
                    }}
                    className="btn btn-sm bg-base-100 btn-circle"
                    disabled={savingId === String(method.id)}
                  >
                    <Heart
                      size={18}
                      className={
                        savedIds.has(String(method.id)) ? "fill-current" : ""
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
