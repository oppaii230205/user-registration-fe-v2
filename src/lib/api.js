import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "./cookies";

// Get base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://user-registration-be-qcv3.onrender.com";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management - Access token stored in memory, refresh token in cookies
let accessToken = null;

export const tokenManager = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token;
  },
  clearAccessToken: () => {
    accessToken = null;
  },
  getRefreshToken: () => getCookie("refreshToken"),
  setRefreshToken: (token) => {
    setCookie("refreshToken", token, 7); // 7 days expiry
  },
  clearRefreshToken: () => {
    deleteCookie("refreshToken");
  },
  clearAll: () => {
    accessToken = null;
    deleteCookie("refreshToken");
  },
};

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor - Attach access token to all requests
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle 401 errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, logout user
        tokenManager.clearAll();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/request`,
          { refreshToken }
        );

        const { accessToken: newAccessToken } = response.data;

        // Update access token in memory
        tokenManager.setAccessToken(newAccessToken);

        // Process all queued requests with new token
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        tokenManager.clearAll();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/user/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/request", { refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/user/me");
    return response.data;
  },
};
