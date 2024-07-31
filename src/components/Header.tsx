import { PowerOff } from "lucide-react";
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <header className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center bg-gray-700 text-white">
      <Link to={"/"}>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full">
          <img src="/logo.png" alt="Darul Huda Logo" className="h-10" />
          <h1 className="font-bold text-gray-600 font-lato hover:text-gray-950 ">
            HUZOOR
          </h1>
        </div>
      </Link>
      <div className="relative inline-block" ref={dropdownRef}>
        <div
          id="dropdownDefaultButton"
          className="flex justify-end items-center cursor-pointer hover:text-gray-500"
          onClick={toggleDropdown}
        >
          {user?.profileImage && (
            <img
              src={user.profileImage}
              className="lg:h-8 h-5 mr-1 rounded-full"
            />
          )}
          <p className="text-sm break-words max-w-xs"> {user?.name}</p>
        </div>

        {isDropdownOpen && (
          <div className="z-10 absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
            <ul className="py-2">
              <li>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <PowerOff className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-600">Sign out</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
