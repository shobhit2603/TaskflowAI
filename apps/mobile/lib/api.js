import axios from "axios";
import { useAuthStore } from "../store/authStore";

import { Platform } from "react-native";

/**
 * API base URL
 */
const BASE_URL = Platform.OS === "android" 
  ? "http://10.0.2.2:5000/api/v1" 
  : "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: unwrap data + handle 401 ──────────────────────────
api.interceptors.response.use(
  (response) => response.data.data ?? response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
