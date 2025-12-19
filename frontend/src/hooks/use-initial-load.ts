"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { getRankingsControllerFindByUsernameQueryOptions } from "@pokeranking/api-client";

export function useInitialLoad() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.username) {
      queryClient.prefetchQuery(
        getRankingsControllerFindByUsernameQueryOptions(session.user.username)
      );
    }
  }, [status, session?.user?.username, queryClient]);
}
