import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [userDetails, setUserDetails] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        withCredentials: true,
      });
      setIsLoggedIn(true);
      setUserDetails(response.data);
      localStorage.setItem("isLoggedIn", "true");
    } catch (error) {
      setIsLoggedIn(false);
      setUserDetails(null);
      localStorage.setItem("isLoggedIn", "false");
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshAuthStatus();
    } else {
      setIsInitialized(true);
    }
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, null, {
        withCredentials: true,
      });
      setIsLoggedIn(false);
      setUserDetails(null);
      localStorage.setItem("isLoggedIn", "false");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userDetails,
        refreshAuthStatus,
        isInitialized,
        logout,
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
      />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
