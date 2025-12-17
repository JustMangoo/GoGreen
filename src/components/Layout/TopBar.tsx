import { NavLink } from "react-router";
import { useUserProgress } from "../../hooks/useUserProgress";

export default function TopBar() {
  const { points, levelTitle } = useUserProgress();

  // Check if data is ready (assuming empty string means loading)
  const isLoading = !levelTitle;

  return (
    <header className="w-full flex justify-between items-center py-3 px-4 sticky top-0 border-b border-base-300 bg-base-100 shadow-lg shadow-neutral/5 z-40">
      
      {/* 1. TEXT FIX: Use a Skeleton to reserve space while loading */}
      <div className="flex flex-col justify-center gap-1 min-w-[140px]">
        {isLoading ? (
          <>
            {/* Skeleton bars prevent the layout from collapsing to 0px */}
            <div className="skeleton h-5 w-32 rounded"></div>
            <div className="skeleton h-3 w-16 rounded"></div>
          </>
        ) : (
          <>
            <h1 className="font-bold text-sm leading-tight">{levelTitle}</h1>
            <p className="text-xs text-base-content/60 leading-tight">
              {points} Points
            </p>
          </>
        )}
      </div>

      <NavLink to="/profile" className="flex-none">
        <div className="avatar">
          {/* 2. IMAGE FIX: Add explicit width/height attributes */}
          {/* Even though CSS sets the size, these attributes tell the browser the aspect ratio immediately */}
          <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img
              alt="Link to Profile"
              aria-label="Link to your profile"
              src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
              width="48"
              height="48"
              className="object-cover"
            />
          </div>
        </div>
      </NavLink>
    </header>
  );
}