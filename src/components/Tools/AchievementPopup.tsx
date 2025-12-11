import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface AchievementPopupProps {
  achievement: {
    name: string;
    description: string;
    pointsReward: number;
  } | null;
  onClose: () => void;
}

export default function AchievementPopup({
  achievement,
  onClose,
}: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="card bg-base-100 text-warning-content shadow-2xl max-w-sm">
        <div className="card-body p-4 flex-row items-center gap-3">
          <div className="shrink-0">
            <div className="bg-warning-content/20 rounded-full p-3">
              <Trophy size={32} className="text-warning-content" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm uppercase tracking-wide mb-1">
              Achievement Unlocked!
            </div>
            <h3 className="font-bold text-lg">{achievement.name}</h3>
            <p className="text-sm text-warning-content/90">
              {achievement.description}
            </p>
            <div className="mt-2 badge badge-sm bg-warning-content/20 border-0 text-warning-content">
              +{achievement.pointsReward} points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
