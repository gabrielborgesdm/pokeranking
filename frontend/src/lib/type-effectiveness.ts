import type { PokemonType } from "@pokeranking/shared";
import typeEffectivenessData from "@/data/type-effectiveness.json";
import { POKEMON_TYPE_VALUES } from "@pokeranking/shared";

type TypeMatchups = {
  defensive: Record<string, number>;
  offensive: Record<string, number>;
};

const typeData = typeEffectivenessData as Record<string, TypeMatchups>;

export interface TypeMultiplier {
  type: PokemonType;
  multiplier: number;
}

export interface TypeEffectivenessResult {
  // Defensive - damage taken
  weaknesses: TypeMultiplier[]; // 2x or 4x
  resistances: TypeMultiplier[]; // 0.5x or 0.25x
  immunities: PokemonType[]; // 0x

  // Offensive - damage dealt
  superEffective: PokemonType[]; // 2x
  notVeryEffective: PokemonType[]; // 0.5x
  noEffect: PokemonType[]; // 0x

  // Recommended counters - super effective AND not weak to target
  recommended: PokemonType[]; // Takes < 2x but > 0x damage
  recommendedImmune: PokemonType[]; // Takes 0x damage (best options)
}

/**
 * Get the defensive multiplier for a single type against an attacking type.
 */
function getDefensiveMultiplier(
  defendingType: PokemonType,
  attackingType: PokemonType
): number {
  const data = typeData[defendingType];
  if (!data) return 1;
  return data.defensive[attackingType] ?? 1;
}

/**
 * Get the offensive multiplier for a single type against a defending type.
 */
function getOffensiveMultiplier(
  attackingType: PokemonType,
  defendingType: PokemonType
): number {
  const data = typeData[attackingType];
  if (!data) return 1;
  return data.offensive[defendingType] ?? 1;
}

/**
 * Calculate type effectiveness for a Pokemon with 1 or 2 types.
 * Handles dual-type multiplier stacking (4x, 2x, 1x, 0.5x, 0.25x, 0x).
 */
export function calculateTypeEffectiveness(
  types: PokemonType[]
): TypeEffectivenessResult {
  const result: TypeEffectivenessResult = {
    weaknesses: [],
    resistances: [],
    immunities: [],
    superEffective: [],
    notVeryEffective: [],
    noEffect: [],
    recommended: [],
    recommendedImmune: [],
  };

  if (types.length === 0) return result;

  // Calculate defensive matchups
  for (const attackingType of POKEMON_TYPE_VALUES) {
    let multiplier = 1;

    for (const defendingType of types) {
      multiplier *= getDefensiveMultiplier(defendingType, attackingType);
    }

    if (multiplier === 0) {
      result.immunities.push(attackingType);
    } else if (multiplier >= 2) {
      result.weaknesses.push({ type: attackingType, multiplier });
    } else if (multiplier < 1) {
      result.resistances.push({ type: attackingType, multiplier });
    }
  }

  // Sort weaknesses by multiplier (4x first, then 2x)
  result.weaknesses.sort((a, b) => b.multiplier - a.multiplier);
  // Sort resistances by multiplier (0.25x first, then 0.5x)
  result.resistances.sort((a, b) => a.multiplier - b.multiplier);

  // Calculate offensive matchups (combined for all types)
  // For dual types, we show what EITHER type is effective against
  const superEffectiveSet = new Set<PokemonType>();
  const notVeryEffectiveSet = new Set<PokemonType>();
  const noEffectSet = new Set<PokemonType>();

  for (const defendingType of POKEMON_TYPE_VALUES) {
    // Find the best offensive multiplier across all attacking types
    let bestMultiplier = 0;
    for (const attackingType of types) {
      const mult = getOffensiveMultiplier(attackingType, defendingType);
      if (mult > bestMultiplier) {
        bestMultiplier = mult;
      }
    }

    if (bestMultiplier === 0) {
      // Only add to noEffect if ALL attacking types have 0 effect
      const allZero = types.every(
        (t) => getOffensiveMultiplier(t, defendingType) === 0
      );
      if (allZero) {
        noEffectSet.add(defendingType);
      }
    } else if (bestMultiplier >= 2) {
      superEffectiveSet.add(defendingType);
    } else if (bestMultiplier < 1) {
      // Only add to notVeryEffective if no type is super effective
      const anySuperEffective = types.some(
        (t) => getOffensiveMultiplier(t, defendingType) >= 2
      );
      if (!anySuperEffective) {
        notVeryEffectiveSet.add(defendingType);
      }
    }
  }

  result.superEffective = Array.from(superEffectiveSet);
  result.notVeryEffective = Array.from(notVeryEffectiveSet);
  result.noEffect = Array.from(noEffectSet);

  // Calculate recommended counters
  // Type is recommended if:
  // 1. It's super effective (2x+) against target
  // 2. Target is NOT super effective against it (target can't hit it for 2x+)
  for (const attackerType of POKEMON_TYPE_VALUES) {
    // Calculate how much damage attackerType deals to target
    let offensiveMultiplier = 1;
    for (const targetType of types) {
      offensiveMultiplier *= getOffensiveMultiplier(attackerType, targetType);
    }

    // Skip if not super effective against target
    if (offensiveMultiplier < 2) continue;

    // Skip if target is super effective against this type
    // (check if attackerType appears in target's super effective list)
    if (superEffectiveSet.has(attackerType)) continue;

    // Calculate how much damage target deals to attackerType (for immunity check)
    let targetDamageToAttacker = 1;
    for (const targetType of types) {
      targetDamageToAttacker *= getOffensiveMultiplier(targetType, attackerType);
    }

    // Categorize based on how safe the counter is
    if (targetDamageToAttacker === 0) {
      // Immune to target's attacks - best counter
      result.recommendedImmune.push(attackerType);
    } else {
      // Target can't hit super effectively - safe counter
      result.recommended.push(attackerType);
    }
  }

  return result;
}

/**
 * Format multiplier for display (e.g., "4x", "2x", "1/2x", "1/4x")
 */
export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0.25) return "1/4x";
  if (multiplier === 0.5) return "1/2x";
  return `${multiplier}x`;
}
