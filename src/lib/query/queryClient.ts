import { QueryClient } from '@tanstack/react-query';

/** Shared QueryClient. Tuned for a mobile marketplace: warm cache, quiet retries. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min — vendor data changes slowly
      gcTime: 30 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
