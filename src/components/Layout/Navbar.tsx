import { NavLink } from "react-router";
import { Home, Search, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="menu menu-horizontal bg-base-200">
      <li>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "menu-active" : "")}
        >
          <Home size={20} />
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/methods"
          className={({ isActive }) => (isActive ? "menu-active" : "")}
        >
          <Search size={20} />
          Browse
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "menu-active" : "")}
        >
          <User size={20} />
          Profile
        </NavLink>
      </li>
    </nav>
  );
}
