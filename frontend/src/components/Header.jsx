// Header.jsx
import { useState } from "react";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <header
      className="fixed top-0 left-64 right-0 bg-gradient-to-r from-gray-700 to-gray-500 text-white p-4 flex justify-end items-center h-16 shadow-md"
    >
      <div>
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv_oL1l60gN7zHc_fMS11OeFR-mLDi3DgjNg&s"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <button
              className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleLogin}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
