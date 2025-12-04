import { RANKING_THEMES } from "./constants";
import type { RankingTheme, ThemeUnlockProgress } from "./types";

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
