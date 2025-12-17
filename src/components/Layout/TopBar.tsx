import { NavLink } from "react-router";
import { useUserProgress } from "../../hooks/useUserProgress";

export default function TopBar() {
  const { points, levelTitle } = useUserProgress();

  return (
    <header className="w-full flex justify-between py-3 px-4 sticky top-0 border-b border-base-300 bg-base-100 shadow-lg shadow-neutral/5">
      <div className="flex flex-col justify-center">
        <h1 className="font-bold text-sm">{levelTitle}</h1>
        <p className="text-xs text-base-content/60">
          {points}
        </p>
      </div>
      <NavLink to="/profile">
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img
              alt="Link to Profile"
              aria-label="Link to your profile"
              src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
            />
          </div>
        </div>
      </NavLink>
    </header>
  );
}
