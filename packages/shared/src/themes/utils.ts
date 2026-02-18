import { RANKING_THEMES, TROPHY_THRESHOLDS, TROPHY_COLORS } from "./constants";
import type { RankingTheme, ThemeTier, ThemeUnlockProgress } from "./types";

/**
 * Check if a theme is available based on Pokemon count
 * @param themeId - The theme ID to check
 * @param pokemonCount - Current Pokemon count in the ranking
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns true if the theme is available for use
 */
export function isThemeAvailable(
  themeId: string,
  pokemonCount: number,
  totalPokemonInSystem: number
): boolean {
  const theme = RANKING_THEMES.find((t) => t.id === themeId);
  if (!theme) return false;

  const { unlockRequirement } = theme;

  if (unlockRequirement.type === "fixed") {
    return pokemonCount >= unlockRequirement.count;
  } else {
    const requiredCount = Math.ceil(
      (unlockRequirement.percent / 100) * totalPokemonInSystem
    );
    return pokemonCount >= requiredCount;
  }
}

/**
 * Get a theme by its ID
 * @param themeId - The theme ID to look up
 * @returns The theme configuration or undefined if not found
 */
export function getThemeById(themeId: string): RankingTheme | undefined {
  return RANKING_THEMES.find((t) => t.id === themeId);
}

/**
 * Get all themes that are available for a given Pokemon count
 * @param pokemonCount - Current Pokemon count in the ranking
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns Array of available themes
 */
export function getAvailableThemes(
  pokemonCount: number,
  totalPokemonInSystem: number
): RankingTheme[] {
  return RANKING_THEMES.filter((theme) =>
    isThemeAvailable(theme.id, pokemonCount, totalPokemonInSystem)
  );
}

/**
 * Get the unlock progress for a specific theme
 * @param theme - The theme to check progress for
 * @param pokemonCount - Current Pokemon count in the ranking
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns Progress information including current, required, and percentage
 */
export function getThemeUnlockProgress(
  theme: RankingTheme,
  pokemonCount: number,
  totalPokemonInSystem: number
): ThemeUnlockProgress {
  const { unlockRequirement } = theme;

  const required =
    unlockRequirement.type === "fixed"
      ? unlockRequirement.count
      : Math.ceil((unlockRequirement.percent / 100) * totalPokemonInSystem);

  return {
    current: pokemonCount,
    required,
    percentage: required > 0 ? Math.min(100, (pokemonCount / required) * 100) : 100,
  };
}

/**
 * Validate if a theme ID exists
 * @param themeId - The theme ID to validate
 * @returns true if the theme ID is valid
 */
export function isValidThemeId(themeId: string): boolean {
  return RANKING_THEMES.some((t) => t.id === themeId);
}

/**
 * Get the required Pokemon count for a theme
 * @param themeId - The theme ID
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns The required Pokemon count, or 0 if theme not found
 */
export function getThemeRequiredCount(
  themeId: string,
  totalPokemonInSystem: number
): number {
  const theme = getThemeById(themeId);
  if (!theme) return 0;

  const { unlockRequirement } = theme;

  if (unlockRequirement.type === "fixed") {
    return unlockRequirement.count;
  } else {
    return Math.ceil((unlockRequirement.percent / 100) * totalPokemonInSystem);
  }
}

/**
 * Get trophy configuration based on Pokemon count
 * @param pokemonCount - Current Pokemon count in the ranking
 * @returns Trophy tier and color
 */
export function getTrophy(pokemonCount: number): {
  tier: ThemeTier;
  color: string;
} {
  let tier: ThemeTier = "starter";

  if (pokemonCount >= TROPHY_THRESHOLDS.master) {
    tier = "master";
  } else if (pokemonCount >= TROPHY_THRESHOLDS.legendary) {
    tier = "legendary";
  } else if (pokemonCount >= TROPHY_THRESHOLDS.elite) {
    tier = "elite";
  } else if (pokemonCount >= TROPHY_THRESHOLDS.wild) {
    tier = "wild";
  }

  return { tier, color: TROPHY_COLORS[tier] };
}

/**
 * Get the next trophy tier and remaining Pokemon needed
 * @param pokemonCount - Current Pokemon count
 * @returns Next tier info or null if at master tier
 */
export function getNextTrophy(pokemonCount: number): {
  nextTier: ThemeTier;
  threshold: number;
  remaining: number;
} | null {
  const tierOrder: ThemeTier[] = ["starter", "wild", "elite", "legendary", "master"];
  const currentTrophy = getTrophy(pokemonCount);
  const currentIndex = tierOrder.indexOf(currentTrophy.tier);

  if (currentIndex >= tierOrder.length - 1) {
    return null; // Already at master tier
  }

  const nextTier = tierOrder[currentIndex + 1];
  const threshold = TROPHY_THRESHOLDS[nextTier];
  const remaining = threshold - pokemonCount;

  return { nextTier, threshold, remaining };
}
