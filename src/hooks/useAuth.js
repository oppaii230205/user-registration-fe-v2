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
      const { accessToken, refreshToken } = data;
      login(accessToken, refreshToken);
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
      // Just clear local state, no API call needed
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all queries from cache
      navigate("/login");
    },
  });
};

// Hook for fetching user profile
export const useUser = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["user"],
    queryFn: authAPI.getProfile,
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: false,
    staleTime: 1000 * 60 * 1, // 1 minutes
  });
};
