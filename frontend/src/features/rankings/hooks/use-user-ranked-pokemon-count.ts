"use client";

import { useSession } from "next-auth/react";
import {
  useAuthControllerGetProfile,
  usePokemonControllerGetCount,
} from "@pokeranking/api-client";

/**
 * Hook to get the total count of Pokemon ranked by the current user
 * across all their rankings, along with the total Pokemon in the system.
 */
export function useUserRankedPokemonCount() {
  const { data: session } = useSession();

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useAuthControllerGetProfile({
    query: {
      enabled: !!session?.user,
    },
  });

  const {
    data: countData,
    isLoading: isCountLoading,
    error: countError,
  } = usePokemonControllerGetCount();

  const totalRankedPokemon = profileData?.data?.rankedPokemonCount ?? 0;
  const totalPokemonInSystem = countData?.data?.totalPokemonCount ?? 0;

  return {
    totalRankedPokemon,
    totalPokemonInSystem,
    isLoading: isProfileLoading || isCountLoading,
    error: profileError || countError,
  };
}
