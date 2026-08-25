import { QueryClient } from "@tanstack/react-query";

/**
 * queryClient — global TanStack Query client configuration.
 *
 * Key settings:
 *  - staleTime 60s: data is considered fresh for 1 minute. Prevents
 *    unnecessary refetches when switching between tabs/pages.
 *  - retry 1: retry failed requests once (handles transient network errors)
 *    but don't hammer a broken endpoint.
 *  - refetchOnWindowFocus false: don't refetch every time the user tabs back.
 *    The task list is not real-time — explicit refresh is fine.
 *
 * Why a separate file? — so we can import the same instance in both the
 * Providers component and any server-side prefetch logic.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,         // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // mutations should not auto-retry — side effects run once
    },
  },
});
