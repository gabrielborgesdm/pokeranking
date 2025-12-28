import { useMemo, useState, useCallback } from "react";
import {
  useRankingsControllerFindOne,
  usePokemonControllerFindAll,
  type PokemonResponseDto,
  type ZoneResponseDto,
} from "@pokeranking/api-client";
import { useIsOwner } from "@/features/users";
import { useRankingUpdate } from "./use-ranking-update";
import { useRankingLike } from "./use-ranking-like";

interface UseRankingPageOptions {
  id: string;
}

/**
 * Hook for managing the ranking page state
 *
 * Handles:
 * - Fetching ranking data
 * - Managing pokemon state
 * - Calculating isOwner
 * - Managing isEditMode
 * - Calculating positionColors from zones
 */
export function useRankingPage({ id }: UseRankingPageOptions) {
  const { data, isLoading, error } = useRankingsControllerFindOne(id);
  const { data: allPokemonData } = usePokemonControllerFindAll();

  // Like functionality (mock for now, prepared for backend)
  const { likeCount, isLiked, toggleLike } = useRankingLike({ rankingId: id });

  const ranking = useMemo(() => data?.data, [data]);
  const allPokemon = useMemo<PokemonResponseDto[]>(() => {
    if (allPokemonData?.status === 200) {
      return allPokemonData.data ?? [];
    }
    return [];
  }, [allPokemonData]);

  const isOwner = useIsOwner(ranking?.user?.username);

  const [isEditMode, setIsEditMode] = useState(false);

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

  // Use draft pokemon when in edit mode, otherwise use initial
  const pokemon = isEditMode ? draftPokemon : initialPokemon;

  const zones = useMemo<ZoneResponseDto[]>(
    () => ranking?.zones ?? [],
    [ranking]
  );

  // Build position -> color map based on zones and pokemon count
  const positionColors = useMemo(() => {
    const map = new Map<number, string>();
    const pokemonCount = pokemon.length;

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
  }, [zones, pokemon.length]);

  const notFound = error || (data && data.status === 404);

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleDiscardClick = useCallback(() => {
    discardDraft();
    setIsEditMode(false);
  }, [discardDraft]);

  const handleSaveClick = useCallback(async () => {
    const wasInitiallyEmpty = initialPokemon.length === 0;
    const success = await saveDraft();
    if (success) {
      if (wasInitiallyEmpty) {
        // Full reload to fix grid rendering issue when going from empty to populated
        window.location.reload();
      } else {
        setIsEditMode(false);
      }
    }
  }, [saveDraft, initialPokemon.length]);

  // Get top Pokemon for hero display
  const topPokemon = pokemon[0]
    ? { name: pokemon[0].name, image: pokemon[0].image, id: pokemon[0]._id }
    : null;

  return {
    ranking,
    pokemon,
    setPokemon: updateDraft,
    positionColors,
    zones,
    isOwner,
    isEditMode,
    setIsEditMode,
    handleEditClick,
    handleDiscardClick,
    handleSaveClick,
    hasUnsavedChanges: isDirty,
    isSaving,
    isLoading,
    error,
    notFound,
    // Like functionality
    likeCount,
    isLiked,
    toggleLike,
    // Hero data
    topPokemon,
  };
}
