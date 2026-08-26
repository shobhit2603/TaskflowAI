import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 min — don't refetch unnecessarily on mobile
      gcTime: 1000 * 60 * 10,     // 10 min — keep cache longer (mobile data is expensive)
      retry: 1,
      refetchOnWindowFocus: false,  // no window concept in React Native
      refetchOnReconnect: true,     // DO refetch when network comes back (mobile-specific)
    },
    mutations: {
      retry: 0,
    },
  },
});
