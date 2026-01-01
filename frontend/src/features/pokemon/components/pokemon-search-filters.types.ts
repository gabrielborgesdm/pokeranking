import type { PokemonType } from "@pokeranking/shared";

export type PokemonSortByOption = "pokedexNumber" | "name";
export type PokemonOrderOption = "asc" | "desc";

export interface PokemonSearchFiltersProps {
  search: string;
  selectedTypes: PokemonType[];
  generation: number | null;
  sortBy: PokemonSortByOption;
  order: PokemonOrderOption;
  onSearchChange: (value: string) => void;
  onTypesChange: (types: PokemonType[]) => void;
  onGenerationChange: (generation: number | null) => void;
  onSortByChange: (value: PokemonSortByOption) => void;
  onOrderChange: (value: PokemonOrderOption) => void;
  /** Width for the filter content area (for matching grid width) */
  contentWidth?: number | string;
  /** Use "inline" variant for embedding in panels without card styling */
  variant?: "card" | "inline";
  className?: string;
}
