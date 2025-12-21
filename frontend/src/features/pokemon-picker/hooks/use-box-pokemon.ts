"use client";

import { useState, useMemo, useCallback } from "react";
import {
  usePokemonControllerFindAll,
  type PokemonResponseDto,
} from "@pokeranking/api-client";
import type { PokemonType } from "@pokeranking/shared";

export type BoxSortByOption = "pokedexNumber" | "name";
export type BoxOrderOption = "asc" | "desc";

export function useBoxPokemon() {
  // Filter state
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [generation, setGeneration] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<BoxSortByOption>("pokedexNumber");
  const [order, setOrder] = useState<BoxOrderOption>("asc");

  // Fetch all pokemon
  const {
    data: allPokemonData,
    isLoading,
  } = usePokemonControllerFindAll();

  // Get raw pokemon
  const rawPokemon = useMemo((): PokemonResponseDto[] => {
    if (allPokemonData?.status === 200) {
      return allPokemonData.data ?? [];
    }
    return [];
  }, [allPokemonData]);

  // Apply frontend filters and sorting
  const filteredPokemon = useMemo(() => {
    let result = rawPokemon;

    // Filter by name (case-insensitive partial match)
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by types (pokemon must have at least one selected type)
    if (selectedTypes.length > 0) {
      result = result.filter((p) =>
        p.types.some((t) => selectedTypes.includes(t as PokemonType))
      );
    }

    // Filter by generation
    if (generation !== null) {
      result = result.filter((p) => p.generation === generation);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "pokedexNumber") {
        comparison = (a.pokedexNumber ?? 0) - (b.pokedexNumber ?? 0);
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      return order === "asc" ? comparison : -comparison;
    });

    return result;
  }, [rawPokemon, search, selectedTypes, generation, sortBy, order]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleTypesChange = useCallback((types: PokemonType[]) => {
    setSelectedTypes(types);
  }, []);

  const handleGenerationChange = useCallback((gen: number | null) => {
    setGeneration(gen);
  }, []);

  const handleSortByChange = useCallback((value: BoxSortByOption) => {
    setSortBy(value);
  }, []);

  const handleOrderChange = useCallback((value: BoxOrderOption) => {
    setOrder(value);
  }, []);

  return {
    // Pokemon data
    pokemon: filteredPokemon,
    isLoading,

    // Filter state
    search,
    selectedTypes,
    generation,
    sortBy,
    order,

    // Handlers
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
  };
}
