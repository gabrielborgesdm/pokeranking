"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { setAuthToken } from "@pokeranking/api-client";

export function useAuthSync() {
  const { data: session, status } = useSession();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      wasAuthenticated.current = true;
      setAuthToken(session.accessToken);
    } else if (status === "unauthenticated" && wasAuthenticated.current) {
      // Only clear token if user was previously authenticated in this session
      // This prevents clearing localStorage token on initial page load
      // when NextAuth briefly reports "unauthenticated" before checking cookies
      setAuthToken(null);
    }
  }, [session, status]);

  return { session, status };
}
