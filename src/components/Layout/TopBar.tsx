import { useUserProfile } from "../../hooks/useUserProfile";
import { getLevelTier } from "../../constants/levels";
import { NavLink } from "react-router";

export default function TopBar() {
  const { profile, loading } = useUserProfile();
  const points = profile?.points || 0;

  const currentTier = getLevelTier(points);

  return (
    <header className="w-full flex justify-between py-3 px-4 sticky top-0 border-b border-base-300 bg-base-100 shadow-lg">
      <div className="flex flex-col justify-center">
        <h1 className="font-bold text-sm">{currentTier.name}</h1>
        <p className="text-xs text-base-content/60">
          {loading ? "..." : `${points} points`}
        </p>
      </div>
      <NavLink to="/profile">
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
          </div>
        </div>
      </NavLink>
    </header>
  );
}
