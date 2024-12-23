import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";

axios.defaults.withCredentials = true;

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserDetails();
    } else {
      setIsLoggedIn(false);
      setUserDetails(null);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return { isLoggedIn, userDetails, checkAuthStatus };
};

const Header = () => {
  const { isLoggedIn, userDetails, checkAuthStatus } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileSidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileSidebarRef.current && !profileSidebarRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    checkAuthStatus();
    navigate("/");
  };

  const toggleProfile = () => {
    setIsProfileOpen((prevState) => !prevState);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-700 to-gray-500 text-white p-4 flex justify-between items-center h-16 shadow-md z-10 w-full">
      {/* Logo/Title */}
      <div className="flex items-center text-xl font-semibold">
        <span className="text-white"></span>
      </div>

      {/* Right side: Login/Logout & Profile */}
      <div className="flex items-center space-x-4">
        {/* Login Button */}
        {!isLoggedIn && (
          <button
            onClick={handleLogin}
            className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 text-sm hidden md:block"
          >
            Login
          </button>
        )}

        {/* Profile and Logout */}
        {isLoggedIn && userDetails && (
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2 bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
            >
              <FaUserCircle className="text-xl" />
              <span className="hidden sm:block max-w-[150px] truncate">{userDetails.name}</span>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div
                ref={profileSidebarRef}
                className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-md p-4 w-64 sm:w-72 md:w-80"
              >
                <div className="space-y-2">
                  <p className="flex justify-between text-sm">
                    <strong className="text-gray-600">Name:</strong>
                    <span className="text-right text-gray-800">{userDetails.name}</span>
                  </p>
                  <p className="flex justify-between text-sm">
                    <strong className="text-gray-600">Email:</strong>
                    <span className="text-right text-gray-800">{userDetails.email}</span>
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
