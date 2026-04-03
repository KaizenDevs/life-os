// Shell for all authenticated pages
// Mobile: sticky header + bottom nav bar
// Desktop: sticky header + nav links inline

import { NavLink, Outlet } from "react-router-dom";
import { Home, Building2, Settings, Puzzle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { signOut, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="font-bold text-lg text-gray-900">Life OS</NavLink>
          {/* Desktop nav links */}
          <nav className="hidden md:flex gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/groups"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`
              }
            >
              Groups
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`
              }
            >
              Categories
            </NavLink>
            {currentUser?.system_role === "super_admin" && (
              <NavLink
                to="/modules"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`
                }
              >
                Modules
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-700">{currentUser.email}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser.system_role?.replace("_", " ")}</p>
            </div>
          )}
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-1 text-xs ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`
            }
          >
            <Home size={20} />
            Home
          </NavLink>
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
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-1 text-xs ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`
            }
          >
            <Settings size={20} />
            Categories
          </NavLink>
          {currentUser?.system_role === "super_admin" && (
            <NavLink
              to="/modules"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-1 text-xs ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`
              }
            >
              <Puzzle size={20} />
              Modules
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}
