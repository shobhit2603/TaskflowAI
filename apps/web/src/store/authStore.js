"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * useAuthStore — global authentication state with hydration tracking.
 *
 * THE RELOAD BUG FIX:
 *   Without hydration tracking, on page reload:
 *     1. Component renders → Zustand hasn't read localStorage yet
 *     2. isAuthenticated is false → redirect to /login fires
 *     3. Zustand rehydrates (token found) → too late, already redirected
 *
 *   The fix: track `_hasHydrated`. The dashboard layout waits for this to
 *   be true before checking auth. This gives Zustand time to read
 *   localStorage and restore the token before any redirect happens.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      /** Called by onRehydrateStorage after localStorage is read */
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      /** Called after login/signup — stores user + token */
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      /**
       * logout — clears all auth state.
       * Navigation is NOT done here — the store doesn't know about routing.
       * The calling component handles the redirect.
       */
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      /** Refreshes user profile data without changing the token */
      updateUser: (user) => set({ user }),
    }),
    {
      name: "taskflow-auth",
      // Only persist what needs to survive a browser refresh
      partialize: (state) => ({ user: state.user, token: state.token }),
      // This runs after localStorage is read and state is restored
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Set isAuthenticated based on whether a token was found
          if (state.token) {
            state.isAuthenticated = true;
          }
          // Signal that hydration is complete — dashboard can now check auth
          state.setHasHydrated(true);
        }
      },
    }
  )
);
