"use client";

export type {
  PokemonSearchFiltersProps,
  PokemonSortByOption,
  PokemonOrderOption,
} from "./pokemon-search-filters.types";

export { LocalPokemonSearchFilters } from "./mobile/local-pokemon-search-filters";

// Re-export as default PokemonSearchFilters (used by pokemon-list-section)
export { LocalPokemonSearchFilters as PokemonSearchFilters } from "./mobile/local-pokemon-search-filters";
