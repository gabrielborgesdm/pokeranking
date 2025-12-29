"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { Zone } from "@/features/pokemon-picker/utils/zone-grouping";
import type {
  PokemonSearchContextValue,
  PokemonSearchProviderProps,
  PokemonSearchResult,
  ScrollToConfig,
} from "../types";

const PokemonSearchContext = createContext<PokemonSearchContextValue | null>(
  null
);

/**
 * Hook to access the Pokemon search context
 */
export function usePokemonSearchContext(): PokemonSearchContextValue {
  const context = useContext(PokemonSearchContext);
  if (!context) {
    throw new Error(
      "usePokemonSearchContext must be used within a PokemonSearchProvider"
    );
  }
  return context;
}

/**
 * Optional hook that returns null if not within provider (for optional usage)
 */
export function usePokemonSearchContextOptional(): PokemonSearchContextValue | null {
  return useContext(PokemonSearchContext);
}

/**
 * Get zone info for a given 1-based position
 */
function getZoneForPosition(
  position: number,
  zones: Zone[]
): { zoneName: string; zoneColor: string } | null {
  for (const zone of zones) {
    const [start, end] = zone.interval;
    if (position >= start && (end === null || position <= end)) {
      return { zoneName: zone.name, zoneColor: zone.color };
    }
  }
  return null;
}

/**
 * Provider component for Pokemon search functionality
 */
export function PokemonSearchProvider({
  pokemon,
  zones = [],
  children,
}: PokemonSearchProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedPokemonId, setHighlightedPokemonId] = useState<
    string | null
  >(null);
  const scrollConfigRef = useRef<ScrollToConfig | null>(null);

  // Filter and map results based on search query
  const results = useMemo((): PokemonSearchResult[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();

    return pokemon
      .map((p, index) => {
        const position = index + 1;
        const zoneInfo = zones.length > 0 ? getZoneForPosition(position, zones) : null;

        return {
          pokemon: p,
          position,
          zoneName: zoneInfo?.zoneName,
          zoneColor: zoneInfo?.zoneColor,
        };
      })
      .filter((result) => result.pokemon.name.toLowerCase().includes(query));
  }, [pokemon, zones, searchQuery]);

  const openSearch = useCallback(() => {
    setIsOpen(true);
    setSearchQuery("");
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const registerScrollConfig = useCallback((config: ScrollToConfig) => {
    scrollConfigRef.current = config;
  }, []);

  const unregisterScrollConfig = useCallback(() => {
    scrollConfigRef.current = null;
  }, []);

  const selectResult = useCallback(
    async (result: PokemonSearchResult) => {
      // Close the overlay first
      setIsOpen(false);
      setSearchQuery("");

      const config = scrollConfigRef.current;
      if (!config) return;

      const { virtualizer, columnCount, pokemon: pokemonList, virtualItems, scrollRef, isWindowVirtualizer } = config;

      // Find pokemon index in the list
      const pokemonIndex = pokemonList.findIndex(
        (p) => p._id === result.pokemon._id
      );
      if (pokemonIndex === -1) return;

      let rowIndex: number;

      if (virtualItems && virtualItems.length > 0) {
        // Zone view: find the row VirtualItem containing this position
        const targetPosition = pokemonIndex + 1; // 1-based position
        rowIndex = virtualItems.findIndex(
          (item) =>
            item.type === "row" &&
            targetPosition >= item.startPosition &&
            targetPosition < item.startPosition + item.pokemon.length
        );

        if (rowIndex === -1) {
          // Fallback to flat calculation
          rowIndex = Math.floor(pokemonIndex / columnCount);
        }
      } else {
        // Flat view: simple row calculation
        rowIndex = Math.floor(pokemonIndex / columnCount);
      }

      if (isWindowVirtualizer) {
        // Window-based virtualization (view mode): use scrollToIndex which scrolls the window
        virtualizer.scrollToIndex(rowIndex, { align: "center" });
      } else {
        // Container-based virtualization (edit mode)
        const scrollContainer = scrollRef.current;
        const hasConstrainedHeight = scrollContainer &&
          scrollContainer.scrollHeight > scrollContainer.clientHeight;

        if (hasConstrainedHeight) {
          virtualizer.scrollToIndex(rowIndex, { align: "center" });
        } else {
          // Fallback: scroll the window manually
          const virtualItem = virtualizer.getVirtualItems().find(
            (item) => item.index === rowIndex
          );

          if (virtualItem && scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const scrollTop = window.scrollY + containerRect.top + virtualItem.start;
            const viewportCenter = window.innerHeight / 2;
            const targetScroll = scrollTop - viewportCenter + (virtualItem.size / 2);

            window.scrollTo({
              top: Math.max(0, targetScroll),
              behavior: "smooth",
            });
          }
        }
      }

      // Wait for scroll and virtualization to render the row
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Apply highlight animation
      setHighlightedPokemonId(result.pokemon._id);

      // Clear highlight after animation completes
      setTimeout(() => {
        setHighlightedPokemonId(null);
      }, 2000);
    },
    []
  );

  const value = useMemo(
    (): PokemonSearchContextValue => ({
      isOpen,
      searchQuery,
      results,
      highlightedPokemonId,
      openSearch,
      closeSearch,
      setSearchQuery,
      selectResult,
      registerScrollConfig,
      unregisterScrollConfig,
    }),
    [
      isOpen,
      searchQuery,
      results,
      highlightedPokemonId,
      openSearch,
      closeSearch,
      selectResult,
      registerScrollConfig,
      unregisterScrollConfig,
    ]
  );

  return (
    <PokemonSearchContext.Provider value={value}>
      {children}
    </PokemonSearchContext.Provider>
  );
}
