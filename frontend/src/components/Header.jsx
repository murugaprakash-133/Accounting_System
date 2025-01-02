import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isLoggedIn, userDetails, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileSidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileSidebarRef.current &&
        !profileSidebarRef.current.contains(event.target)
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
  };

  const toggleProfile = () => setIsProfileOpen((prevState) => !prevState);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-700 to-gray-500 text-white px-6 py-4 flex justify-between items-center shadow-md z-50">
      <div
        className="hidden sm:flex items-center text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        Accountify
      </div>

      <div className="flex items-center space-x-4">
        {!isLoggedIn && (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm"
          >
            Login
          </button>
        )}

        {isLoggedIn && userDetails && (
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
            >
              <FaUserCircle className="text-2xl" />
              <span className="hidden sm:block truncate max-w-[150px]">
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
                className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-md p-4 w-64"
              >
                <div className="space-y-2">
                  <p className="flex justify-between text-sm">
                    <strong className="text-gray-600">Name:</strong>
                    <span className="text-right text-gray-800">
                      {userDetails.name}
                    </span>
                  </p>
                  <p className="flex justify-between text-sm">
                    <strong className="text-gray-600">Email:</strong>
                    <span className="text-right text-gray-800">
                      {userDetails.email}
                    </span>
                  </p>
                  <p className="flex justify-between text-sm">
                    <strong className="text-gray-600">Role:</strong>
                    <span className="text-right text-gray-800">
                      {userDetails.role}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 mt-4 transition duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
