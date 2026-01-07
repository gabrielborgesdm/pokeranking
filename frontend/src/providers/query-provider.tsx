"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { useAuthSync, handleSessionExpired } from "@/features/auth";
import { isApiError } from "@pokeranking/api-client";

const CACHE_DISABLED = process.env.NEXT_PUBLIC_CACHE_DISABLED === "true";
const DEV_TOOLS_DISABLED = process.env.NEXT_PUBLIC_DEV_TOOLS_DISABLED === "true";

function AuthSyncWrapper({ children }: { children: ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (!query.meta?.skipGlobalErrorHandler) {
              handleSessionExpired(error);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (!mutation.meta?.skipGlobalErrorHandler) {
              handleSessionExpired(error);
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: CACHE_DISABLED ? 0 : 1000 * 60 * 5, // 5 minutes
            gcTime: CACHE_DISABLED ? 0 : 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: (failureCount, error) => {
              if (isApiError(error) && error.status === 401) return false;
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSyncWrapper>{children}</AuthSyncWrapper>
      {!DEV_TOOLS_DISABLED && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
