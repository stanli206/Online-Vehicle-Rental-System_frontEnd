import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isUser = user && !isAdmin;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-yellow-700 to-yellow-700 text-white bg-gray shadow-md rounded">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo & Left Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide text-white pl-0 flex"
          >
            <img src="/car.png" className="w-14 h-14 mb-1" alt="" />

            <i className="fa-solid fa-car mt-3">
              Rent<span className="text-yellow-300">AUTO</span>
            </i>
          </Link>

          {/* Show only if user is a User (not Admin) and not in "/" */}
          {isUser && location.pathname !== "/" && (
            <Link
              to="/"
              className="text-white hover:text-yellow-300 font-medium"
            >
              Home
            </Link>
          )}
          {isUser && location.pathname === "/" && (
            <Link
              to="/Dashboard"
              className="text-white hover:text-yellow-300 font-medium"
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-white hover:text-yellow-300 font-medium"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 font-medium hover:text-yellow-300 focus:outline-none"
              >
                Welcome, {user.name}
                <ChevronDown 
                  size={18} 
                  className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg text-black z-50 overflow-hidden">
                  {isUser && (
                    <Link
                      to="/orders&bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-yellow-600 hover:text-white"
                    >
                      My Bookings
                    </Link>
                  )}
                  {isUser && (
                    <Link
                      to="/userProfile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-yellow-600 hover:text-white"
                    >
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-white font-medium hover:text-yellow-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;