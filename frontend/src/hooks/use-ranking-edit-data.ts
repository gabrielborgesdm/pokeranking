"use client";

import { useMemo } from "react";
import {
  useAuthControllerGetProfile,
  usePokemonControllerFindAll,
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
    data: pokemonData,
    isLoading: isPokemonLoading,
    error: pokemonError,
  } = usePokemonControllerFindAll();

  const ranking = useMemo(() => {
    const rankings = profileData?.data?.rankings ?? [];
    return rankings.find((r) => r._id === rankingId);
  }, [profileData, rankingId]);

  const totalPokemon = pokemonData?.data?.length ?? 0;

  return {
    ranking,
    totalPokemon,
    isLoading: isProfileLoading || isPokemonLoading,
    error: profileError || pokemonError,
    notFound: !isProfileLoading && !isPokemonLoading && !ranking,
  };
}
