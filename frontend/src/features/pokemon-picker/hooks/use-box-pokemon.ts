"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useBoxesControllerFindAll,
  useBoxesControllerFindOne,
  usePokemonControllerFindAll,
  type PokemonResponseDto,
} from "@pokeranking/api-client";
import type { PokemonType } from "@pokeranking/shared";

export type BoxSortByOption = "pokedexNumber" | "name";
export type BoxOrderOption = "asc" | "desc";

const ALL_POKEMON_BOX_ID = "all";

export function useBoxPokemon() {
  // Box selection state
  const [selectedBoxId, setSelectedBoxId] = useState<string>(ALL_POKEMON_BOX_ID);

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [generation, setGeneration] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<BoxSortByOption>("pokedexNumber");
  const [order, setOrder] = useState<BoxOrderOption>("asc");

  // Fetch user's boxes list
  const {
    data: boxesData,
    isLoading: isLoadingBoxes,
  } = useBoxesControllerFindAll();

  // Fetch all pokemon (for "All Pokemon" box)
  const {
    data: allPokemonData,
    isLoading: isLoadingAllPokemon,
  } = usePokemonControllerFindAll({
    query: {
      enabled: selectedBoxId === ALL_POKEMON_BOX_ID,
    },
  });

  // Fetch selected box content (when a specific box is selected)
  const {
    data: selectedBoxData,
    isLoading: isLoadingSelectedBox,
  } = useBoxesControllerFindOne(selectedBoxId, {
    query: {
      enabled: selectedBoxId !== ALL_POKEMON_BOX_ID,
    },
  });

  // Extract boxes list
  const boxes = useMemo(() => {
    if (boxesData?.status === 200) {
      return boxesData.data;
    }
    return [];
  }, [boxesData]);

  // Get raw pokemon based on selected box
  const rawPokemon = useMemo((): PokemonResponseDto[] => {
    if (selectedBoxId === ALL_POKEMON_BOX_ID) {
      if (allPokemonData?.status === 200) {
        return allPokemonData.data ?? [];
      }
      return [];
    }
    if (selectedBoxData?.status === 200) {
      return selectedBoxData.data.pokemon ?? [];
    }
    return [];
  }, [selectedBoxId, allPokemonData, selectedBoxData]);

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

  // Loading state
  const isLoading = useMemo(() => {
    if (selectedBoxId === ALL_POKEMON_BOX_ID) {
      return isLoadingAllPokemon;
    }
    return isLoadingSelectedBox;
  }, [selectedBoxId, isLoadingAllPokemon, isLoadingSelectedBox]);

  // Handlers
  const handleBoxSelect = useCallback((boxId: string) => {
    setSelectedBoxId(boxId);
  }, []);

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
    // Box data
    boxes,
    selectedBoxId,
    isLoadingBoxes,

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
    handleBoxSelect,
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
  };
}
