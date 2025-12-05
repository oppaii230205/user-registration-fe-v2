import { createContext, useContext, useState, useEffect } from "react";
import { tokenManager } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Since refresh token is HttpOnly, we can't check it directly
    // We'll set loading to false and let the user trigger auth if needed
    // The refresh will happen automatically on first API call if valid cookie exists
    setIsLoading(false);
  }, []);

  const login = (accessToken) => {
    // Refresh token is set as HttpOnly cookie by backend
    if (accessToken) {
      tokenManager.setAccessToken(accessToken);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Call backend to clear HttpOnly cookie
      const { authAPI } = await import("../lib/api");
      await authAPI.logout();
    } catch {
      // Ignore errors during logout
    } finally {
      tokenManager.clearAll();
      setIsAuthenticated(false);
    }
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
