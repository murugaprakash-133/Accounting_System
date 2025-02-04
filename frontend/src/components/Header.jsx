import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

const Header = () => {
  const { isLoggedIn, userDetails, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileSidebarRef = useRef(null);
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileSidebarRef.current &&
        !profileSidebarRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.error("Logout Successfully!");
  };

  const isLoginOrRegisterPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/";

  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-700 to-gray-500 text-white px-6 py-4 flex justify-between items-center shadow-md z-50">
      {/* Logo Section */}
      {!isLoggedIn && (
        <div
          className="flex items-center text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Accountify
        </div>
      )}

      {/* Profile or Login Section */}
      <div className="ml-auto flex items-center space-x-4">
        {!isLoggedIn && !isLoginOrRegisterPage && (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm"
          >
            Login
          </button>
        )}

        {isLoggedIn && userDetails && (
          <div className="relative">
            {/* Profile Button */}
            <button
              onClick={toggleProfile}
              ref={buttonRef}
              className="flex items-center space-x-2 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
            >
              <FaUserCircle className="text-2xl" />
              <span className="hidden sm:block truncate max-w-[150px] text-white">
                {userDetails.name}
              </span>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div
                ref={profileSidebarRef}
                className={`absolute right-0 sm:right-0 sm:left-auto mt-2 bg-white text-black rounded-md shadow-md p-3 sm:p-4 w-60 sm:w-64 max-h-[80vh] sm:max-h-none overflow-y-auto origin-top-right transform transition-transform duration-300 ease-in-out ${
                  isProfileOpen
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0 pointer-events-none"
                }`}
                style={{
                  zIndex: 100,
                }}
              >
                <div className="space-y-2">
                  <p className="flex justify-between text-xs sm:text-sm">
                    <strong className="text-gray-600 ">Name:</strong>
                    <span className="text-right text-gray-800 truncate max-w-[100px] sm:max-w-none">
                      {userDetails.name}
                    </span>
                  </p>
                  <p className="flex justify-between text-xs sm:text-sm">
                    <strong className="text-gray-600">Email:</strong>
                    <span className="text-right text-gray-800 truncate max-w-[100px] sm:max-w-none">
                      {userDetails.email}
                    </span>
                  </p>
                  <p className="flex justify-between text-xs sm:text-sm">
                    <strong className="text-gray-600">Role:</strong>
                    <span className="text-right text-gray-800">
                      {userDetails.role}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md hover:bg-red-600 mt-4 transition duration-300"
                >
                  Logout
                </button>
              </div>
            )}
            <ToastContainer />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
