"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ─── Query Keys ─────────────────────────────────────────────────────────────
// Centralising query keys prevents typos and makes cache invalidation reliable.
// Using arrays lets TanStack Query do partial invalidation:
//   queryClient.invalidateQueries({ queryKey: ['auth'] }) invalidates all auth queries.
export const authKeys = {
  all: ["auth"],
  me: () => [...authKeys.all, "me"],
};

/**
 * useLogin — mutation for POST /auth/login.
 * On success: stores auth, redirects to dashboard.
 */
export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials) => api.post("/auth/login", credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Welcome back! 👋");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
}

/**
 * useSignup — mutation for POST /auth/signup.
 */
export function useSignup() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data) => api.post("/auth/signup", data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Account created! Welcome to TaskflowAI 🎉");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Signup failed. Please try again.");
    },
  });
}

/**
 * useLogout — clears auth state and redirects to login.
 */
export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return () => {
    logout();
    qc.clear(); // clear all cached data on logout
    router.push("/login");
    toast.success("Signed out successfully.");
  };
}
