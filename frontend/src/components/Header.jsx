import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/login"); // Navigate to the login page
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <header
      className="fixed top-0 left-64 right-0 bg-gradient-to-r from-gray-700 to-gray-500 text-white p-4 flex justify-end items-center h-16 shadow-md"
    >
      <div>
        {!isLoggedIn ? (
          <button
            onClick={handleLogin}
            className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
