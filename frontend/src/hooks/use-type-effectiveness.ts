import { useMemo } from "react";
import type { PokemonType } from "@pokeranking/shared";
import {
  calculateTypeEffectiveness,
  type TypeEffectivenessResult,
} from "@/lib/type-effectiveness";

/**
 * Hook to calculate type effectiveness for a Pokemon with 1 or 2 types.
 * Results are memoized based on the types array.
 */
export function useTypeEffectiveness(
  types: PokemonType[]
): TypeEffectivenessResult {
  return useMemo(
    () => calculateTypeEffectiveness(types),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [types.join(",")]
  );
}
