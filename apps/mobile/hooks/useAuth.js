import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export const authKeys = {
  all: ["auth"],
  me: () => [...authKeys.all, "me"],
};

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials) => api.post("/auth/login", credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Welcome back! 👋");
      router.replace("/(tabs)");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed.");
    },
  });
}

export function useSignup() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data) => api.post("/auth/signup", data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Welcome to TaskflowAI 🎉");
      router.replace("/(tabs)");
    },
    onError: (error) => {
      toast.error(error.message || "Signup failed.");
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return () => {
    logout();
    qc.clear();
    router.replace("/(auth)/login");
    toast.success("Signed out.");
  };
}
