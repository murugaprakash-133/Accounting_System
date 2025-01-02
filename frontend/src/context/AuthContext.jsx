import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
