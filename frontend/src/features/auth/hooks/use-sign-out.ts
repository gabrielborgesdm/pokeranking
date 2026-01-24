import { useCallback } from "react";
import { signOut } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthToken } from "@pokeranking/api-client";

export function useSignOut() {
  const queryClient = useQueryClient();

  const handleSignOut = useCallback(async () => {
    // Clear all TanStack Query cache
    queryClient.clear();

    // Clear the auth token from localStorage
    setAuthToken(null);

    // Sign out via NextAuth
    await signOut();
  }, [queryClient]);

  return handleSignOut;
}
