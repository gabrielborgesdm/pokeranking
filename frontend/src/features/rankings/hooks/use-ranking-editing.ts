import { useMemo, useState, useEffect } from "react";
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { PokemonResponseDto } from "@pokeranking/api-client";

/** Long press delay for touch drag on mobile (ms) */
const MOBILE_TOUCH_DELAY = 350;

/** Short delay for desktop touch (ms) */
const DESKTOP_TOUCH_DELAY = 50;

/**
 * Hook for managing RankingEditing internal state
 *
 * Handles:
 * - Tracking initial Pokemon IDs (for distinguishing saved vs draft Pokemon)
 * - DND sensors configuration
 * - Deriving filteredOutIds and disabledIds
 */
export function useRankingEditing(
  pokemon: PokemonResponseDto[],
  isMobile = false
) {
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

  // DND sensors - use MouseSensor + TouchSensor instead of PointerSensor
  // PointerSensor has limitations with touch events and can't properly prevent scrolling
  // See: https://docs.dndkit.com/api-documentation/sensors/touch
  const touchDelay = isMobile ? MOBILE_TOUCH_DELAY : DESKTOP_TOUCH_DELAY;
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: touchDelay,
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
