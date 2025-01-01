import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // New state

  const refreshAuthStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        withCredentials: true,
      });
      setIsLoggedIn(true);
      setUserDetails(response.data);
    } catch (error) {
      setIsLoggedIn(false);
      setUserDetails(null);
    } finally {
      setIsInitialized(true); // Mark initialization as complete
    }
  };

  useEffect(() => {
    // Optionally, run this only if you want the app to check login status on mount.
    setIsInitialized(true);
  }, []); // No refreshAuthStatus call here

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userDetails,
        refreshAuthStatus,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
