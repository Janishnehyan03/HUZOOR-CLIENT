import { PowerOff, ChevronDown, Settings } from "lucide-react";
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

  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left - App Name */}
          <Link to="/" className="flex items-center">
            <div className="mr-2 h-8 w-2 rounded-full bg-blue-600 sm:mr-3"></div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              {import.meta.env.VITE_APP_NAME}
            </h1>
          </Link>

          {/* Center - School Info */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                {import.meta.env.VITE_SCHOOL_NAME}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {import.meta.env.VITE_SCHOOL_ADDRESS}
              </p>
            </div>
          </div>

          {/* Right - User Profile */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full p-1 sm:p-2 hover:bg-gray-100 transition-colors"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[150px]">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 line-clamp-1">
                    {user.email}
                  </span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform sm:ml-2 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 divide-y divide-gray-100">
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4 text-gray-500" />
                      Settings
                    </Link>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <PowerOff className="mr-3 h-4 w-4 text-gray-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
             
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;