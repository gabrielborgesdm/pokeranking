"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { useAuthSync } from "@/hooks/use-auth-sync";

const CACHE_DISABLED = process.env.NEXT_PUBLIC_CACHE_DISABLED === "true";

function AuthSyncWrapper({ children }: { children: ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: CACHE_DISABLED ? 0 : 1000 * 60 * 5, // 5 minutes
            gcTime: CACHE_DISABLED ? 0 : 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSyncWrapper>{children}</AuthSyncWrapper>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
