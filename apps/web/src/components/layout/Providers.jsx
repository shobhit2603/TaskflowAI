"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";

/**
 * Providers — wraps the app with all client-side providers.
 *
 * Why a separate file instead of putting this in layout.jsx?
 *   Next.js root layout.jsx is a Server Component. Providers that use
 *   React context (QueryClientProvider) must be Client Components.
 *   Extracting to this file keeps layout.jsx as a Server Component
 *   while enabling client-side state management below.
 *
 * Providers included:
 *  - QueryClientProvider: TanStack Query for server state
 *  - Toaster (Sonner): global toast notifications
 *    (Zustand doesn't need a Provider — it's global by design)
 */
export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: { fontFamily: "inherit" },
        }}
      />
    </QueryClientProvider>
  );
}
