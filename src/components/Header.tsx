import {
  PowerOff,
  ChevronDown,
  Settings,
  ShieldCheck,
  Sparkles,
  Building2,
  Menu,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/userContext";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const initial = user?.name?.charAt(0).toUpperCase() || "U";
  const appName = import.meta.env.VITE_APP_NAME || "Attendance Portal";
  const schoolName = import.meta.env.VITE_SCHOOL_NAME;
  const schoolAddress = import.meta.env.VITE_SCHOOL_ADDRESS;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex h-20 items-center justify-between gap-6 sm:gap-8">
          {/* Left - Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-4 shrink-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="lg:hidden flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  {appName}
                </span>
              </Link>
            </div>

            {/* Desktop Institution / Digital Portal Pill */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100">
                <ShieldCheck className="w-3.5 h-3.5" /> Institutional Portal
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* School Info Badge */}
            {schoolName && (
              <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100/80 border border-slate-200/60">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {schoolName}
                  </p>
                  {schoolAddress && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {schoolAddress}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* User Profile */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center gap-3.5 rounded-2xl p-1.5 sm:px-3.5 sm:py-2 hover:bg-slate-100/80 border border-transparent hover:border-slate-200/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {initial}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  </div>

                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-slate-900 line-clamp-1 max-w-[140px]">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize line-clamp-1">
                      {user.role || "User"}
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {user.email || "No email set"}
                      </p>
                      <div className="mt-2.5 inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-semibold uppercase tracking-wider">
                        {user.role || "Member"}
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link
                        to="/settings"
                        className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                        Settings
                      </Link>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <PowerOff className="mr-3 h-4 w-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
