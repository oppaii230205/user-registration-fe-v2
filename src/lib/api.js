import axios from "axios";

// Get base URL from environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://user-registration-be-qcv3.onrender.com";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Token management - Access token stored in memory, refresh token in HttpOnly cookie (managed by backend)
let accessToken = null;
let isAuthenticated = false;

export const tokenManager = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token;
    isAuthenticated = true;
  },
  clearAccessToken: () => {
    accessToken = null;
    isAuthenticated = false;
  },
  isAuthenticated: () => isAuthenticated,
  setAuthenticated: (value) => {
    isAuthenticated = value;
  },
  // Refresh token is HttpOnly cookie - cannot be accessed by JavaScript
  // Backend automatically reads it from cookie header
  clearAll: () => {
    accessToken = null;
    isAuthenticated = false;
    // Call logout endpoint to clear HttpOnly cookie on backend
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

    // Prevent infinite loop - don't retry refresh endpoint itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

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

      try {
        // Call refresh token endpoint - HttpOnly cookie sent automatically
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Empty body - refresh token in HttpOnly cookie
          { withCredentials: true } // Send cookies with request
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

  refreshToken: async () => {
    // Refresh token is in HttpOnly cookie, sent automatically
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  logout: async () => {
    // Call logout endpoint to clear HttpOnly cookie
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/user/me");
    return response.data;
  },
};
