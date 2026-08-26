import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * SecureStore adapter for Zustand persist.
 *
 * Why SecureStore instead of AsyncStorage?
 *   SecureStore stores data in the device's encrypted keychain (iOS Keychain /
 *   Android Keystore). This is the correct place to store JWTs on mobile —
 *   AsyncStorage stores in plain text on disk which is not secure for tokens.
 */
const secureStorage = {
  getItem: async (key) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * useAuthStore — same pattern as the web app.
 *
 * Key difference: uses SecureStore instead of localStorage.
 * _hasHydrated solves the same reload → logout flash issue on mobile
 * (app cold start reads from SecureStore asynchronously).
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (user) => set({ user }),
    }),
    {
      name: "taskflow-auth",
      storage: createJSONStorage(() => Platform.OS === "web" ? localStorage : secureStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.token) state.isAuthenticated = true;
          state.setHasHydrated(true);
        }
      },
    }
  )
);
