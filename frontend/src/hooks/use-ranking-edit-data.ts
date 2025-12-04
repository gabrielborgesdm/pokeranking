"use client";

import { useMemo } from "react";
import {
  useAuthControllerGetProfile,
  usePokemonControllerGetCount,
} from "@pokeranking/api-client";

interface UseRankingEditDataOptions {
  rankingId: string;
}

export function useRankingEditData({ rankingId }: UseRankingEditDataOptions) {
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useAuthControllerGetProfile();

  const {
    data: countData,
    isLoading: isCountLoading,
    error: countError,
  } = usePokemonControllerGetCount();

  const ranking = useMemo(() => {
    const rankings = profileData?.data?.rankings ?? [];
    return rankings.find((r) => r._id === rankingId);
  }, [profileData, rankingId]);

  const totalPokemon = countData?.data?.totalPokemonCount ?? 0;

  return {
    ranking,
    totalPokemon,
    isLoading: isProfileLoading || isCountLoading,
    error: profileError || countError,
    notFound: !isProfileLoading && !isCountLoading && !ranking,
  };
}
