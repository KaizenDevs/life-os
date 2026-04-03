// Shell for all authenticated pages
// Mobile: sticky header + bottom nav bar
// Desktop: sticky header + nav links inline

import { NavLink, Outlet } from "react-router-dom";
import { Toasts } from "./Toasts";
import { Home, Building2, Settings, Puzzle, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRef, useState, useEffect } from "react";

export function Layout() {
  const { signOut, currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            {currentUser?.system_role === "super_admin" && (<>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`
                }
              >
                Categories
              </NavLink>
              <NavLink
                to="/modules"
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`
                }
              >
                Modules
              </NavLink>
            </>)}
          </nav>
        </div>
        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold select-none">
                {currentUser.email[0].toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[160px] truncate">
                {currentUser.email}
              </span>
              <ChevronDown size={14} className={`hidden sm:block text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800 truncate">{currentUser.email}</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">
                    {currentUser.system_role?.replace(/_/g, " ")}
                  </p>
                </div>
                {/* Actions */}
                <button
                  onClick={() => { signOut(); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <Toasts />

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
          {currentUser?.system_role === "super_admin" && (<>
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
          </>)}
        </div>
      </nav>
    </div>
  );
}
