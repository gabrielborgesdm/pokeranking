"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  useRankingsControllerFindOne,
  type PokemonResponseDto,
  type ZoneResponseDto,
} from "@pokeranking/api-client";
import { useIsOwner } from "@/features/users";
import { useRankingLike } from "./use-ranking-like";
import { isLikedByUser } from "../utils/like-utils";

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
  const { data: session } = useSession();
  const { data, isLoading, isError, isFetching } = useRankingsControllerFindOne(id);

  const ranking = useMemo(() => data?.data, [data]);

  const initialIsLiked = useMemo(
    () => isLikedByUser(ranking?.likedBy, session?.user?.id),
    [ranking?.likedBy, session?.user?.id]
  );

  const { likeCount, isLiked, toggleLike } = useRankingLike({
    rankingId: id,
    initialLikeCount: ranking?.likesCount,
    initialIsLiked,
  });
  const isOwner = useIsOwner(ranking?.user?._id);

  const pokemon = useMemo<PokemonResponseDto[]>(
    () => ranking?.pokemon ?? [],
    [ranking?.pokemon]
  );

  const zones = useMemo<ZoneResponseDto[]>(
    () => ranking?.zones ?? [],
    [ranking]
  );

  // Only consider notFound after all retries are exhausted (isError=true)
  // and not while still fetching/retrying
  const notFound = !isFetching && (isError || (data && data.status === 404));

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
    isError,
    notFound,
    likeCount,
    isLiked,
    toggleLike,
    topPokemon,
  };
}
