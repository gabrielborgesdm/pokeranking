"use client";

import { useMemo } from "react";
import { useAuthControllerGetProfile } from "@pokeranking/api-client";

interface UseRankingEditDataOptions {
  rankingId: string;
}

export function useRankingEditData({ rankingId }: UseRankingEditDataOptions) {
  const { data: profileData, isLoading, error } = useAuthControllerGetProfile();

  const ranking = useMemo(() => {
    const rankings = profileData?.data?.rankings ?? [];
    return rankings.find((r) => r._id === rankingId);
  }, [profileData, rankingId]);

  return {
    ranking,
    isLoading,
    error,
    notFound: !isLoading && !ranking,
  };
}
