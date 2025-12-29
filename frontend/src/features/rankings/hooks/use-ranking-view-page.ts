"use client";

import { useMemo } from "react";
import {
  useRankingsControllerFindOne,
  type PokemonResponseDto,
  type ZoneResponseDto,
} from "@pokeranking/api-client";
import { useIsOwner } from "@/features/users";
import { useRankingLike } from "./use-ranking-like";

interface UseRankingViewPageOptions {
  id: string;
}

/**
 * Hook for managing the ranking view page state (read-only)
 *
 * Handles:
 * - Fetching ranking data
 * - Calculating isOwner
 * - Like functionality
 * - Top pokemon for hero display
 */
export function useRankingViewPage({ id }: UseRankingViewPageOptions) {
  const { data, isLoading, error } = useRankingsControllerFindOne(id);
  const { likeCount, isLiked, toggleLike } = useRankingLike({ rankingId: id });

  const ranking = useMemo(() => data?.data, [data]);
  const isOwner = useIsOwner(ranking?.user?.username);

  const pokemon = useMemo<PokemonResponseDto[]>(
    () => ranking?.pokemon ?? [],
    [ranking?.pokemon]
  );

  const zones = useMemo<ZoneResponseDto[]>(
    () => ranking?.zones ?? [],
    [ranking]
  );

  const notFound = error || (data && data.status === 404);

  // Get top Pokemon for hero display
  const topPokemon = pokemon[0]
    ? { name: pokemon[0].name, image: pokemon[0].image, id: pokemon[0]._id }
    : null;

  return {
    ranking,
    pokemon,
    zones,
    isOwner,
    isLoading,
    error,
    notFound,
    likeCount,
    isLiked,
    toggleLike,
    topPokemon,
  };
}
