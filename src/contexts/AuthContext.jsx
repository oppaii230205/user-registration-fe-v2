import { createContext, useContext, useState, useEffect } from "react";
import { tokenManager } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has a refresh token on mount
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (accessToken, refreshToken) => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenManager.clearAll();
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
