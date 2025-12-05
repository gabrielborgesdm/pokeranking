"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRankingsControllerUpdate } from "@pokeranking/api-client";
import { useQueryClient } from "@tanstack/react-query";
import type { PokemonResponseDto } from "@pokeranking/api-client";

const DRAFT_STORAGE_PREFIX = "ranking-draft:";
const DEBOUNCE_MS = 500;

interface DraftData {
  pokemonIds: string[];
  updatedAt: number;
}

interface UseRankingDraftOptions {
  rankingId: string;
  initialPokemon: PokemonResponseDto[];
  allPokemon?: PokemonResponseDto[];
}

interface UseRankingDraftReturn {
  draftPokemon: PokemonResponseDto[];
  updateDraft: (pokemon: PokemonResponseDto[]) => void;
  saveDraft: () => Promise<void>;
  discardDraft: () => void;
  isDirty: boolean;
  isSaving: boolean;
  hasDraft: boolean;
}

function getDraftKey(rankingId: string): string {
  return `${DRAFT_STORAGE_PREFIX}${rankingId}`;
}

function loadDraft(rankingId: string): DraftData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(getDraftKey(rankingId));
    if (!stored) return null;
    return JSON.parse(stored) as DraftData;
  } catch {
    return null;
  }
}

function saveDraftToStorage(rankingId: string, pokemonIds: string[]): void {
  if (typeof window === "undefined") return;

  const data: DraftData = {
    pokemonIds,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(getDraftKey(rankingId), JSON.stringify(data));
  } catch {
    // Storage full or unavailable
    console.warn("Failed to save draft to localStorage");
  }
}

function clearDraft(rankingId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getDraftKey(rankingId));
  } catch {
    // Ignore errors
  }
}

export function useRankingDraft({
  rankingId,
  initialPokemon,
  allPokemon = [],
}: UseRankingDraftOptions): UseRankingDraftReturn {
  const queryClient = useQueryClient();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Build a map of all pokemon for quick lookup
  const pokemonMap = useCallback(() => {
    const map = new Map<string, PokemonResponseDto>();
    [...initialPokemon, ...allPokemon].forEach((p) => map.set(p._id, p));
    return map;
  }, [initialPokemon, allPokemon]);

  // Initialize state from localStorage or initial data
  const [draftPokemon, setDraftPokemon] = useState<PokemonResponseDto[]>(() => {
    const draft = loadDraft(rankingId);
    if (draft) {
      const map = pokemonMap();
      const restoredPokemon = draft.pokemonIds
        .map((id) => map.get(id))
        .filter((p): p is PokemonResponseDto => p !== undefined);

      // Only use draft if we could resolve all pokemon
      if (restoredPokemon.length === draft.pokemonIds.length) {
        return restoredPokemon;
      }
    }
    return initialPokemon;
  });

  const [hasDraft, setHasDraft] = useState(() => loadDraft(rankingId) !== null);

  const { mutateAsync: updateRanking, isPending: isSaving } =
    useRankingsControllerUpdate();

  // Check if current state differs from initial
  const isDirty = useCallback(() => {
    if (draftPokemon.length !== initialPokemon.length) return true;
    return draftPokemon.some((p, i) => p._id !== initialPokemon[i]?._id);
  }, [draftPokemon, initialPokemon]);

  // Update draft and schedule localStorage save
  const updateDraft = useCallback(
    (pokemon: PokemonResponseDto[]) => {
      setDraftPokemon(pokemon);
      setHasDraft(true);

      // Debounce localStorage save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        saveDraftToStorage(
          rankingId,
          pokemon.map((p) => p._id)
        );
      }, DEBOUNCE_MS);
    },
    [rankingId]
  );

  // Save draft to server
  const saveDraft = useCallback(async () => {
    const pokemonIds = draftPokemon.map((p) => p._id);

    await updateRanking({
      id: rankingId,
      data: { pokemon: pokemonIds },
    });

    // Clear local draft after successful save
    clearDraft(rankingId);
    setHasDraft(false);

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["/rankings", rankingId] });
    queryClient.invalidateQueries({ queryKey: ["/rankings"] });
  }, [draftPokemon, rankingId, updateRanking, queryClient]);

  // Discard draft and reset to initial state
  const discardDraft = useCallback(() => {
    setDraftPokemon(initialPokemon);
    clearDraft(rankingId);
    setHasDraft(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, [initialPokemon, rankingId]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Sync initial pokemon changes (e.g., after save)
  useEffect(() => {
    // Only sync if there's no active draft
    if (!hasDraft) {
      setDraftPokemon(initialPokemon);
    }
  }, [initialPokemon, hasDraft]);

  return {
    draftPokemon,
    updateDraft,
    saveDraft,
    discardDraft,
    isDirty: isDirty(),
    isSaving,
    hasDraft,
  };
}
