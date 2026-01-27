import { usePokemonControllerFindAll } from "@pokeranking/api-client";

/**
 * Wrapper around usePokemonControllerFindAll with a 30-minute stale time.
 * Pokemon data rarely changes, so we avoid unnecessary refetches.
 */
export function useAllPokemonQuery() {
  return usePokemonControllerFindAll({
    query: {
      staleTime: 1000 * 60 * 30,
    },
  });
}
