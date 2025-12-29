import type { Virtualizer } from "@tanstack/react-virtual";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { VirtualItem, Zone } from "@/features/pokemon-picker/utils/zone-grouping";

/**
 * Search result with tier and position info
 */
export interface PokemonSearchResult {
  pokemon: PokemonResponseDto;
  /** 1-based position in the ranking */
  position: number;
  /** Tier/zone name (e.g., "S Tier") */
  zoneName?: string;
  /** Zone color for display */
  zoneColor?: string;
}

/**
 * Configuration for scroll-to behavior, registered by listing components
 */
export interface ScrollToConfig {
  /** Virtualizer instance reference - can be container or window based */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  virtualizer: Virtualizer<any, Element>;
  /** Number of columns in the grid */
  columnCount: number;
  /** Pokemon list for finding index */
  pokemon: PokemonResponseDto[];
  /** Zone virtual items (for zone-grouped view) */
  virtualItems?: VirtualItem[];
  /** Scroll container ref (used for container-based virtualization) */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Whether this uses window-based virtualization */
  isWindowVirtualizer?: boolean;
}

/**
 * Context value shared across components
 */
export interface PokemonSearchContextValue {
  /** Whether the search overlay is open */
  isOpen: boolean;
  /** Current search query */
  searchQuery: string;
  /** Filtered search results */
  results: PokemonSearchResult[];
  /** ID of the currently highlighted Pokemon (for animation) */
  highlightedPokemonId: string | null;
  /** Open the search overlay */
  openSearch: () => void;
  /** Close the search overlay */
  closeSearch: () => void;
  /** Update the search query */
  setSearchQuery: (query: string) => void;
  /** Select a result (scrolls to and highlights the Pokemon) */
  selectResult: (result: PokemonSearchResult) => void;
  /** Register scroll configuration from listing component */
  registerScrollConfig: (config: ScrollToConfig) => void;
  /** Unregister scroll configuration */
  unregisterScrollConfig: () => void;
}

/**
 * Props for the PokemonSearchProvider
 */
export interface PokemonSearchProviderProps {
  /** All Pokemon in the ranking */
  pokemon: PokemonResponseDto[];
  /** Zone configuration for tier names */
  zones?: Zone[];
  /** Children components */
  children: React.ReactNode;
}
