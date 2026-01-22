"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useRankingsControllerFindOne,
  usePokemonControllerFindAll,
  type PokemonResponseDto,
  type ZoneResponseDto,
} from "@pokeranking/api-client";
import { useIsOwner } from "@/features/users";
import { useRankingUpdate } from "./use-ranking-update";
import { routes } from "@/lib/routes";

interface UseRankPageOptions {
  id: string;
}

/**
 * Hook for managing the rank page (Pokemon editing) state
 *
 * Handles:
 * - Fetching ranking data
 * - Managing pokemon state via useRankingUpdate
 * - Owner authorization (redirects non-owners)
 * - Navigation after save/discard
 */
export function useRankPage({ id }: UseRankPageOptions) {
  const router = useRouter();
  const { data, isLoading, error } = useRankingsControllerFindOne(id);
  const { data: allPokemonData } = usePokemonControllerFindAll();

  const ranking = useMemo(() => data?.data, [data]);
  const allPokemon = useMemo<PokemonResponseDto[]>(() => {
    if (allPokemonData?.status === 200) {
      return allPokemonData.data ?? [];
    }
    return [];
  }, [allPokemonData]);

  const isOwner = useIsOwner(ranking?.user?._id);

  // Initial pokemon from the ranking
  const initialPokemon = useMemo<PokemonResponseDto[]>(
    () => ranking?.pokemon ?? [],
    [ranking?.pokemon]
  );

  // Use the ranking update hook for draft management
  const {
    draftPokemon,
    updateDraft,
    saveDraft,
    discardDraft,
    isDirty,
    isSaving,
  } = useRankingUpdate({
    rankingId: id,
    initialPokemon,
    allPokemon,
  });

  const zones = useMemo<ZoneResponseDto[]>(
    () => ranking?.zones ?? [],
    [ranking]
  );

  // Build position -> color map based on zones and pokemon count
  const positionColors = useMemo(() => {
    const map = new Map<number, string>();
    const pokemonCount = draftPokemon.length;

    for (let pos = 1; pos <= pokemonCount; pos++) {
      for (const zone of zones) {
        const [start, end] = zone.interval;
        if (pos >= start && (end === null || pos <= end)) {
          map.set(pos, zone.color);
          break;
        }
      }
    }

    return map;
  }, [zones, draftPokemon.length]);

  const notFound = error || (data && data.status === 404);

  // Redirect non-owners to view page
  const isUnauthorized = !isLoading && ranking && !isOwner;

  useEffect(() => {
    if (isUnauthorized) {
      router.replace(routes.ranking(id));
    }
  }, [isUnauthorized, router, id]);

  const handleSave = useCallback(async () => {
    const wasInitiallyEmpty = initialPokemon.length === 0;
    const success = await saveDraft();
    if (success) {
      if (wasInitiallyEmpty) {
        // Full reload to fix grid rendering issue when going from empty to populated
        window.location.href = routes.ranking(id);
      } else {
        router.push(routes.ranking(id));
      }
    }
  }, [saveDraft, router, id, initialPokemon.length]);

  const handleDiscard = useCallback(() => {
    discardDraft();
    router.push(routes.ranking(id));
  }, [discardDraft, router, id]);

  return {
    ranking,
    pokemon: draftPokemon,
    setPokemon: updateDraft,
    positionColors,
    zones,
    hasUnsavedChanges: isDirty,
    isSaving,
    handleSave,
    handleDiscard,
    isLoading,
    error,
    notFound,
    isUnauthorized,
  };
}
