// components/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data stale immediately so navigating triggers a background refetch
            staleTime: 0,
            // Automatically refetch whenever a route mounts/remounts
            refetchOnMount: "always",
            // Automatically refetch when the user refocuses the window/tab
            refetchOnWindowFocus: true,
            // Keep unused cache in memory for 10 minutes so navigating back is instant
            gcTime: 1000 * 60 * 10,
            // Prevents infinite retries on hard server errors
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}