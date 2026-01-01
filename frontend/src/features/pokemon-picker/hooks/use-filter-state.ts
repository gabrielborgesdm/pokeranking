"use client";

import { useMemo, useCallback } from "react";
import { useAllPokemon, type PokemonSortByOption, type PokemonOrderOption } from "./use-all-pokemon";
import type { PokemonType } from "@pokeranking/shared";

export interface FilterState {
  search: string;
  selectedTypes: PokemonType[];
  generation: number | null;
  sortBy: PokemonSortByOption;
  order: PokemonOrderOption;
}

export interface UseFilterStateReturn extends FilterState {
  // Computed values
  activeFilterCount: number;

  // Handlers
  handleSearchChange: (value: string) => void;
  handleTypesChange: (types: PokemonType[]) => void;
  handleGenerationChange: (gen: number | null) => void;
  handleSortByChange: (value: PokemonSortByOption) => void;
  handleOrderChange: (value: PokemonOrderOption) => void;
  handleClearFilters: () => void;
}

/**
 * Hook for managing Pokemon filter state.
 * Wraps useAllPokemon and adds activeFilterCount and handleClearFilters.
 */
export function useFilterState(): UseFilterStateReturn {
  const {
    search,
    selectedTypes,
    generation,
    sortBy,
    order,
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
  } = useAllPokemon();

  // Count active filters (excluding defaults)
  const activeFilterCount = useMemo(() => {
    return [
      search.length > 0,
      selectedTypes.length > 0,
      generation !== null,
      sortBy !== "pokedexNumber",
      order !== "asc",
    ].filter(Boolean).length;
  }, [search, selectedTypes, generation, sortBy, order]);

  // Reset all filters to defaults
  const handleClearFilters = useCallback(() => {
    handleSearchChange("");
    handleTypesChange([]);
    handleGenerationChange(null);
    handleSortByChange("pokedexNumber");
    handleOrderChange("asc");
  }, [handleSearchChange, handleTypesChange, handleGenerationChange, handleSortByChange, handleOrderChange]);

  return {
    // State
    search,
    selectedTypes,
    generation,
    sortBy,
    order,

    // Computed
    activeFilterCount,

    // Handlers
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
    handleClearFilters,
  };
}
