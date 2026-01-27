import { usePokemonControllerFindAll } from "@pokeranking/api-client";

const ONE_HOUR = 1000 * 60 * 60; // 1 hour in milliseconds

/**
 * Wrapper around usePokemonControllerFindAll with a 30-minute stale/gc time.
 * Pokemon data rarely changes, so we avoid unnecessary refetches.
 */
export function useAllPokemonQuery() {
  return usePokemonControllerFindAll({
    query: {
      staleTime: ONE_HOUR,
      gcTime: ONE_HOUR,
    },
  });
}
