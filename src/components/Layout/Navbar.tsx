import { NavLink } from "react-router";
import { Home, LayoutList, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="navbar sticky bottom-0 border-t border-base-300 bg-base-100 shadow-lg">
      <div className="navbar-center flex w-full justify-around">
        <NavLink
          to="/"
          className={({ isActive }: { isActive: boolean }) =>
            `btn btn-ghost flex-col gap-0 ${isActive ? "text-primary" : ""}`
          }
        >
          <Home size={32} />
          <span className="text-xs">Home</span>
        </NavLink>

        <NavLink
          to="/methods"
          className={({ isActive }: { isActive: boolean }) =>
            `btn btn-ghost flex-col gap-0 ${isActive ? "text-primary" : ""}`
          }
        >
          <LayoutList size={32} />
          <span className="text-xs">Methods</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }: { isActive: boolean }) =>
            `btn btn-ghost flex-col gap-0 ${isActive ? "text-primary" : ""}`
          }
        >
          <User size={32} />
          <span className="text-xs">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
