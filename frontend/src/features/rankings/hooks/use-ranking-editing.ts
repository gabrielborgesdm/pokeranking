import { useMemo, useState, useEffect } from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { PokemonResponseDto } from "@pokeranking/api-client";

/**
 * Hook for managing RankingEditing internal state
 *
 * Handles:
 * - Tracking initial Pokemon IDs (for distinguishing saved vs draft Pokemon)
 * - DND sensors configuration
 * - Deriving filteredOutIds and disabledIds
 */
export function useRankingEditing(pokemon: PokemonResponseDto[]) {
  // Track initial Pokemon IDs - these are the Pokemon that were already saved
  // in the ranking when the page loaded. We use this to differentiate between:
  // - Saved Pokemon: should be hidden from the picker (filteredOutIds)
  // - Draft Pokemon: newly added during this session, shown as disabled/grayed
  //   out in the picker (disabledIds) to indicate they're already in the ranking
  const [initialPokemonIds, setInitialPokemonIds] = useState<Set<string>>(
    () => new Set()
  );

  // Capture initial IDs when pokemon is first loaded (empty -> populated)
  // This only runs once when the fetched pokemon data arrives
  useEffect(() => {
    if (initialPokemonIds.size === 0 && pokemon.length > 0) {
      setInitialPokemonIds(new Set(pokemon.map((p) => p._id)));
    }
  }, [pokemon, initialPokemonIds.size]);

  // DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    })
  );

  // Derive filtered and disabled IDs from current pokemon state
  const { filteredOutIds, disabledIds } = useMemo(() => {
    const currentIds = pokemon.map((p) => p._id);

    return {
      // Saved Pokemon (from initial load) should be filtered out (hidden)
      filteredOutIds: currentIds.filter((id) => initialPokemonIds.has(id)),
      // Draft Pokemon (added after load) should be disabled (grayed out)
      disabledIds: currentIds.filter((id) => !initialPokemonIds.has(id)),
    };
  }, [pokemon, initialPokemonIds]);

  return {
    sensors,
    filteredOutIds,
    disabledIds,
  };
}
