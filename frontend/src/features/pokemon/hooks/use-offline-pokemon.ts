import { useEffect, useState, useRef } from "react";
import {
  pokemonControllerFindAll,
  pokemonControllerHasChanges,
  type PokemonResponseDto,
} from "@pokeranking/api-client";
import {
  getPokemon,
  savePokemon,
  getVersion,
} from "../services/pokemon-storage";

interface UseOfflinePokemonResult {
  data: PokemonResponseDto[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Offline-first hook for Pokemon data.
 *
 * 1. Immediately loads cached data from IndexedDB (if available)
 * 2. Checks the has-changes endpoint when online
 * 3. If changes detected, fetches fresh data and updates IndexedDB
 * 4. Falls back to cached data when offline
 */
export function useOfflinePokemon(): UseOfflinePokemonResult {
  const [data, setData] = useState<PokemonResponseDto[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchAndSync() {
      try {
        // 1. Load from IndexedDB first (instant)
        const cachedPokemon = await getPokemon();
        const cachedVersion = await getVersion();

        if (cachedPokemon) {
          setData(cachedPokemon);
          setIsLoading(false);
        }

        // 2. Check if we're online
        if (!navigator.onLine) {
          if (!cachedPokemon) {
            setError(new Error("Offline and no cached data available"));
          }
          setIsLoading(false);
          return;
        }

        // 3. Check for changes
        const hasChangesResponse = await pokemonControllerHasChanges({
          version: cachedVersion ?? undefined,
        });
        const { hasChanges, currentVersion } = hasChangesResponse.data;

        // 4. If no changes and we have cached data, we're done
        if (!hasChanges && cachedPokemon) {
          setIsLoading(false);
          return;
        }

        // 5. Fetch fresh data
        const findAllResponse = await pokemonControllerFindAll();
        const freshPokemon = findAllResponse.data;

        // 6. Save to IndexedDB
        await savePokemon(freshPokemon, currentVersion);

        // 7. Update state
        setData(freshPokemon);
        setError(null);
      } catch (err) {
        // If we have cached data, use it despite the error
        const cachedPokemon = await getPokemon();
        if (cachedPokemon) {
          setData(cachedPokemon);
        } else {
          setError(err instanceof Error ? err : new Error("Failed to fetch Pokemon"));
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndSync();
  }, []);

  // Re-sync when coming back online
  useEffect(() => {
    async function handleOnline() {
      try {
        const cachedVersion = await getVersion();
        const hasChangesResponse = await pokemonControllerHasChanges({
          version: cachedVersion ?? undefined,
        });
        const { hasChanges, currentVersion } = hasChangesResponse.data;

        if (hasChanges) {
          const findAllResponse = await pokemonControllerFindAll();
          const freshPokemon = findAllResponse.data;
          await savePokemon(freshPokemon, currentVersion);
          setData(freshPokemon);
        }
      } catch {
        // Silently fail on reconnect sync - we already have cached data
      }
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return { data, isLoading, error };
}
