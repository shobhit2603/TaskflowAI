import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";

/**
 * Root Layout — wraps the entire app in providers and handles auth routing.
 *
 * Why auth guard here instead of each screen?
 *   Putting it in _layout.jsx means it runs for every screen automatically.
 *   Any new screen we add is protected by default.
 *
 * Why _hasHydrated check?
 *   SecureStore is async — on app start, the token isn't loaded yet.
 *   Without this check, the app would flash to login before reading the token.
 */
function AuthGuard() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!_hasHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, _hasHydrated, segments]);

  // Loading spinner during SecureStore read (~100ms on app start)
  if (!_hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#09090f" }}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="#09090f" />
        <AuthGuard />
        <Toaster
          position="bottom-center"
          richColors
          theme="dark"
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
