import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  if (!_hasHydrated) return null;
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
