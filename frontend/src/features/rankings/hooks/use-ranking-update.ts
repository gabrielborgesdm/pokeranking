"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useRankingsControllerUpdate,
  getRankingsControllerFindOneQueryKey,
  getAuthControllerGetProfileQueryKey,
  type PokemonResponseDto,
} from "@pokeranking/api-client";
import { useAnalytics } from "@/hooks/use-analytics";

const DRAFT_KEY_PREFIX = "ranking-draft:";
const DEBOUNCE_MS = 500;

interface DraftData {
  pokemonIds: string[];
  updatedAt: number;
}

interface UseRankingUpdateOptions {
  rankingId: string;
  initialPokemon: PokemonResponseDto[];
  allPokemon: PokemonResponseDto[];
}

interface UseRankingUpdateReturn {
  draftPokemon: PokemonResponseDto[];
  updateDraft: (pokemon: PokemonResponseDto[]) => void;
  saveDraft: () => Promise<boolean>;
  discardDraft: () => void;
  hasDraft: boolean;
  isDirty: boolean;
  isSaving: boolean;
}

function getDraftKey(rankingId: string): string {
  return `${DRAFT_KEY_PREFIX}${rankingId}`;
}

function loadDraft(rankingId: string): DraftData | null {
  if (typeof window === "undefined") return null;

  try {
    const key = getDraftKey(rankingId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored) as DraftData;
    if (!Array.isArray(data.pokemonIds)) return null;

    return data;
  } catch {
    return null;
  }
}

function saveDraftToStorage(rankingId: string, pokemonIds: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const key = getDraftKey(rankingId);
    const data: DraftData = {
      pokemonIds,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn("Failed to save draft to localStorage");
  }
}

function clearDraftFromStorage(rankingId: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = getDraftKey(rankingId);
    localStorage.removeItem(key);
  } catch {
    console.warn("Failed to clear draft from localStorage");
  }
}

function resolvePokemonIds(
  pokemonIds: string[],
  allPokemon: PokemonResponseDto[]
): PokemonResponseDto[] | null {
  const pokemonMap = new Map(allPokemon.map((p) => [p._id, p]));
  const resolved: PokemonResponseDto[] = [];

  for (const id of pokemonIds) {
    const pokemon = pokemonMap.get(id);
    if (!pokemon) {
      // Draft contains invalid Pokemon ID, discard it
      return null;
    }
    resolved.push(pokemon);
  }

  return resolved;
}

export function useRankingUpdate({
  rankingId,
  initialPokemon,
  allPokemon,
}: UseRankingUpdateOptions): UseRankingUpdateReturn {
  const queryClient = useQueryClient();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { trackRankingUpdate } = useAnalytics();

  // Track initial pokemon IDs for dirty checking
  const initialPokemonIdsRef = useRef<string[]>([]);

  // Initialize state from localStorage or initial data
  const [draftPokemon, setDraftPokemon] = useState<PokemonResponseDto[]>(() => {
    // Try to restore draft from localStorage
    const storedDraft = loadDraft(rankingId);
    if (storedDraft && allPokemon.length > 0) {
      const resolved = resolvePokemonIds(storedDraft.pokemonIds, allPokemon);
      if (resolved) {
        return resolved;
      }
      // Draft invalid, clear it
      clearDraftFromStorage(rankingId);
    }
    return initialPokemon;
  });

  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    return loadDraft(rankingId) !== null;
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync with initialPokemon when it changes and there's no draft
  useEffect(() => {
    if (initialPokemon.length === 0) return;

    const storedDraft = loadDraft(rankingId);
    if (storedDraft && allPokemon.length > 0) {
      // There's a draft, try to resolve it
      const resolved = resolvePokemonIds(storedDraft.pokemonIds, allPokemon);
      if (resolved) {
        setDraftPokemon(resolved);
        setHasDraft(true);
        // Keep initial ref as the baseline for dirty checking
        if (initialPokemonIdsRef.current.length === 0) {
          initialPokemonIdsRef.current = initialPokemon.map((p) => p._id);
        }
      } else {
        // Draft invalid, clear it and sync with initial
        clearDraftFromStorage(rankingId);
        setDraftPokemon(initialPokemon);
        setHasDraft(false);
        initialPokemonIdsRef.current = initialPokemon.map((p) => p._id);
      }
    } else {
      // No draft, sync with initial pokemon
      setDraftPokemon(initialPokemon);
      setHasDraft(false);
      initialPokemonIdsRef.current = initialPokemon.map((p) => p._id);
    }
  }, [allPokemon, rankingId, initialPokemon]);

  // Calculate isDirty
  const isDirty = useMemo(() => {
    const currentIds = draftPokemon.map((p) => p._id);
    const initialIds = initialPokemonIdsRef.current;

    if (currentIds.length !== initialIds.length) return true;
    return currentIds.some((id, index) => id !== initialIds[index]);
  }, [draftPokemon]);

  // Mutation for saving to server
  const { mutateAsync: updateRanking } = useRankingsControllerUpdate();

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateDraft = useCallback(
    (pokemon: PokemonResponseDto[]) => {
      setDraftPokemon(pokemon);
      setHasDraft(true);

      // Debounced save to localStorage
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const pokemonIds = pokemon.map((p) => p._id);
        saveDraftToStorage(rankingId, pokemonIds);
      }, DEBOUNCE_MS);
    },
    [rankingId]
  );

  const saveDraft = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);

    try {
      const pokemonIds = draftPokemon.map((p) => p._id);

      await updateRanking({
        id: rankingId,
        data: { pokemon: pokemonIds },
      });

      trackRankingUpdate(rankingId);

      // Clear draft from localStorage
      clearDraftFromStorage(rankingId);
      setHasDraft(false);

      // Update the initial reference to current state
      initialPokemonIdsRef.current = pokemonIds;

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: getRankingsControllerFindOneQueryKey(rankingId),
      });
      queryClient.invalidateQueries({
        queryKey: getAuthControllerGetProfileQueryKey(),
      });

      return true;
    } catch (error) {
      console.error("Failed to save ranking:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [draftPokemon, rankingId, updateRanking, queryClient, trackRankingUpdate]);

  const discardDraft = useCallback(() => {
    // Cancel any pending debounced save
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Clear from localStorage
    clearDraftFromStorage(rankingId);

    // Reset to initial pokemon
    const pokemonMap = new Map(allPokemon.map((p) => [p._id, p]));
    const restoredPokemon = initialPokemonIdsRef.current
      .map((id) => pokemonMap.get(id))
      .filter((p): p is PokemonResponseDto => p !== undefined);

    setDraftPokemon(restoredPokemon.length > 0 ? restoredPokemon : initialPokemon);
    setHasDraft(false);
  }, [rankingId, allPokemon, initialPokemon]);

  return {
    draftPokemon,
    updateDraft,
    saveDraft,
    discardDraft,
    hasDraft,
    isDirty,
    isSaving,
  };
}
