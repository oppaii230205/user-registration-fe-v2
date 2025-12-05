import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Hook for user login
export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      const { accessToken } = data;
      // Refresh token is set as HttpOnly cookie by backend
      login(accessToken);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/dashboard");
    },
  });
};

// Hook for user registration
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      navigate("/login");
    },
  });
};

// Hook for user logout
export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Call backend to clear HttpOnly cookie
      await logout();
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all queries from cache
      navigate("/login");
    },
  });
};

// Hook for fetching user profile
export const useUser = () => {
  const { isAuthenticated, login } = useAuth();

  return useQuery({
    queryKey: ["user"],
    queryFn: authAPI.getProfile,
    enabled: true, // Always try to fetch - will trigger refresh if HttpOnly cookie exists
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      // If we successfully got user data and weren't authenticated, update auth state
      if (!isAuthenticated && data) {
        // User is authenticated via HttpOnly cookie
        login(null); // Access token will be set by interceptor during refresh
      }
    },
  });
};
