import { useMemo } from "react";
import { useOfflinePokemon } from "./use-offline-pokemon";

/**
 * Offline-first Pokemon query hook.
 *
 * Uses IndexedDB for instant loading and syncs with the server when online.
 * Returns a TanStack Query-compatible interface for backward compatibility.
 */
export function useAllPokemonQuery() {
  const { data, isLoading, error } = useOfflinePokemon();

  // Return a TanStack Query-compatible interface
  const queryResult = useMemo(() => {
    if (data) {
      return {
        status: 200 as const,
        data,
      };
    }
    return undefined;
  }, [data]);

  return {
    data: queryResult,
    isLoading,
    error,
  };
}
