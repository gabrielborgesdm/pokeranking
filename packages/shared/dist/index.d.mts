/**
 * Theme unlock requirement - either a fixed Pokemon count or percentage of total
 */
type ThemeUnlockRequirement = {
    type: "fixed";
    count: number;
} | {
    type: "percentage";
    percent: number;
};
/**
 * Theme tier for grouping in the UI
 */
type ThemeTier = "starter" | "wild" | "elite" | "legendary" | "master";
/**
 * Ranking theme configuration
 */
interface RankingTheme {
    /** Unique theme identifier */
    id: string;
    /** Display name for the UI */
    displayName: string;
    /** CSS class for the gradient (defined in globals.css) */
    gradientClass: string;
    /** Text color as CSS color value (e.g., '#ffffff', 'rgb(255,255,255)') */
    textColor: string;
    /** Optional text shadow for better contrast */
    textShadow?: string;
    /** Requirement to unlock this theme */
    unlockRequirement: ThemeUnlockRequirement;
    /** Tier grouping for UI display */
    tier: ThemeTier;
}
/**
 * Progress toward unlocking a theme
 */
interface ThemeUnlockProgress {
    /** Current Pokemon count */
    current: number;
    /** Required Pokemon count to unlock */
    required: number;
    /** Percentage progress (0-100) */
    percentage: number;
}

/**
 * All available ranking themes
 */
declare const RANKING_THEMES: readonly RankingTheme[];
/**
 * Array of all valid theme IDs
 */
declare const THEME_IDS: readonly string[];
/**
 * Default theme ID used when no theme is specified
 */
declare const DEFAULT_THEME_ID = "default";

/**
 * Check if a theme is available based on Pokemon count
 * @param themeId - The theme ID to check
 * @param pokemonCount - Current Pokemon count in the ranking
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns true if the theme is available for use
 */
declare function isThemeAvailable(themeId: string, pokemonCount: number, totalPokemonInSystem: number): boolean;
/**
 * Get a theme by its ID
 * @param themeId - The theme ID to look up
 * @returns The theme configuration or undefined if not found
 */
declare function getThemeById(themeId: string): RankingTheme | undefined;
/**
 * Get all themes that are available for a given Pokemon count
 * @param pokemonCount - Current Pokemon count in the ranking
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns Array of available themes
 */
declare function getAvailableThemes(pokemonCount: number, totalPokemonInSystem: number): RankingTheme[];
/**
 * Get the unlock progress for a specific theme
 * @param theme - The theme to check progress for
 * @param pokemonCount - Current Pokemon count in the ranking
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns Progress information including current, required, and percentage
 */
declare function getThemeUnlockProgress(theme: RankingTheme, pokemonCount: number, totalPokemonInSystem: number): ThemeUnlockProgress;
/**
 * Validate if a theme ID exists
 * @param themeId - The theme ID to validate
 * @returns true if the theme ID is valid
 */
declare function isValidThemeId(themeId: string): boolean;
/**
 * Get the required Pokemon count for a theme
 * @param themeId - The theme ID
 * @param totalPokemonInSystem - Total Pokemon available in the system
 * @returns The required Pokemon count, or 0 if theme not found
 */
declare function getThemeRequiredCount(themeId: string, totalPokemonInSystem: number): number;

declare const POKEMON_TYPE_VALUES: readonly ["bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying", "ghost", "grass", "ground", "ice", "normal", "poison", "psychic", "rock", "steel", "water"];
type PokemonType = (typeof POKEMON_TYPE_VALUES)[number];
/** @deprecated Use POKEMON_TYPE_VALUES directly */
declare const PokemonTypes: Record<PokemonType, PokemonType>;
interface PokemonStats {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
}

/**
 * Zone type for ranking tier display
 */
interface Zone {
    name: string;
    interval: [number, number | null];
    color: string;
}

/**
 * Default zones for ranking display
 * Works well for ~1000+ Pokemon with 6 tiers
 */
declare const DEFAULT_ZONES: readonly Zone[];

export { DEFAULT_THEME_ID, DEFAULT_ZONES, POKEMON_TYPE_VALUES, type PokemonStats, type PokemonType, PokemonTypes, RANKING_THEMES, type RankingTheme, THEME_IDS, type ThemeTier, type ThemeUnlockProgress, type ThemeUnlockRequirement, type Zone, getAvailableThemes, getThemeById, getThemeRequiredCount, getThemeUnlockProgress, isThemeAvailable, isValidThemeId };
