import axios from "axios";
import { useAuthStore } from "@/store/authStore";

/**
 * api — central Axios instance for all API communication.
 *
 * Design decisions:
 *  - Single base URL from env → change one variable to switch environments
 *  - Request interceptor injects Bearer token from Zustand store
 *    (accessed via .getState() — Zustand's escape hatch for non-React contexts)
 *  - Response interceptor unwraps the { success, message, data } envelope so
 *    callers get `data` directly, not the wrapper
 *  - 401 responses auto-logout (token expired or revoked)
 *  - 30s timeout to handle slow AI endpoints gracefully
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor — attach JWT ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // .getState() works outside React components — Zustand's intentional escape hatch
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — unwrap data, handle auth errors ───────────────
api.interceptors.response.use(
  (response) => {
    // Unwrap the standard API envelope → callers get data directly
    // response.data = { success: true, message: "...", data: { ... } }
    return response.data.data ?? response.data;
  },
  (error) => {
    const status = error.response?.status;
    const serverError = error.response?.data;

    // Auto-logout on 401 — token expired or account deleted
    if (status === 401) {
      useAuthStore.getState().logout();
    }

    // Re-throw the server's error shape so components get { message, errors }
    return Promise.reject(serverError || { message: "Network error. Please check your connection." });
  }
);

export default api;
