import { PowerOff, ChevronDown, Settings, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/userContext";

const Header = () => {
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left - App Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                {appName}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Digital Portal
              </span>
            </div>
          </Link>

          {/* Center - School Info */}
          {schoolName && (
            <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60">
              <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
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

          {/* Right - User Profile */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full p-1.5 sm:px-3 hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {user.email || "No email set"}
                    </p>
                    <div className="mt-2.5 inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 text-[11px] font-semibold uppercase tracking-wider">
                      {user.role || "Member"}
                    </div>
                  </div>

                  <div className="py-1.5">
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                      Settings
                    </Link>
                  </div>

                  <div className="py-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
    </header>
  );
};

export default Header;