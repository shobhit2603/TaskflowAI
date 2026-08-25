"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import TaskForm from "@/components/tasks/TaskForm";

/**
 * DashboardLayout — protected layout with hydration-aware auth guard.
 *
 * THE FIX for reload→logout bug:
 *   We check `_hasHydrated` before acting on `isAuthenticated`.
 *   On first render after reload, both are false → we show a loading spinner.
 *   Once Zustand reads localStorage (takes ~5ms), `_hasHydrated` becomes true.
 *   THEN we check if authenticated → redirect to login only if truly logged out.
 *
 *   Without this: isAuthenticated = false on first render (before localStorage
 *   is read) → redirect fires before the token is restored.
 */
export default function DashboardLayout({ children }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect AFTER Zustand has finished reading localStorage
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // ── Loading state while Zustand rehydrates from localStorage ────────────
  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — render nothing (redirect is already in flight)
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global task dialog — mounted here, opened from anywhere via taskStore */}
      <TaskForm />
    </div>
  );
}
