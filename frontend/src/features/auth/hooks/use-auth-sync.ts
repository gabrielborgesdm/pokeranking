"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setAuthToken } from "@pokeranking/api-client";

export function useAuthSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setAuthToken(session.accessToken);
    } else if (status === "unauthenticated") {
      setAuthToken(null);
    }
  }, [session, status]);

  return { session, status };
}
