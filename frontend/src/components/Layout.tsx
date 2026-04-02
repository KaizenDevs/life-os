// Shell for all authenticated pages
// Mobile: sticky header + bottom nav bar
// Desktop: sticky header + nav links inline

import { NavLink, Outlet } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">Life OS</span>
          {/* Desktop nav links */}
          <nav className="hidden md:flex gap-4">
            <NavLink
              to="/groups"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`
              }
            >
              Groups
            </NavLink>
          </nav>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </button>
      </header>

      {/* Page content — extra bottom padding on mobile so content isn't hidden behind bottom nav */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex">
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-1 text-xs ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`
            }
          >
            <Building2 size={20} />
            Groups
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
