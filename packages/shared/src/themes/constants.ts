import type { RankingTheme } from "./types";

/**
 * All available ranking themes
 */
export const RANKING_THEMES: readonly RankingTheme[] = [
  // Starter Tier (0 required) - Always available
  {
    id: "default",
    displayName: "Classic",
    gradientClass: "gradient-type-normal",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter",
  },
  {
    id: "fire",
    displayName: "Fire",
    gradientClass: "gradient-type-fire",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter",
  },
  {
    id: "water",
    displayName: "Water",
    gradientClass: "gradient-type-water",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter",
  },
  {
    id: "grass",
    displayName: "Grass",
    gradientClass: "gradient-type-grass",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter",
  },

  // Intermediate Tier (10+ or 5%)
  {
    id: "electric",
    displayName: "Electric",
    gradientClass: "gradient-type-electric",
    textColor: "dark",
    unlockRequirement: { type: "fixed", count: 10 },
    tier: "intermediate",
  },
  {
    id: "psychic",
    displayName: "Psychic",
    gradientClass: "gradient-type-psychic",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 10 },
    tier: "intermediate",
  },
  {
    id: "poison",
    displayName: "Poison",
    gradientClass: "gradient-type-poison",
    textColor: "light",
    unlockRequirement: { type: "percentage", percent: 5 },
    tier: "intermediate",
  },

  // Advanced Tier (25+ or 15%)
  {
    id: "dragon",
    displayName: "Dragon",
    gradientClass: "gradient-type-dragon",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 25 },
    tier: "advanced",
  },
  {
    id: "ghost",
    displayName: "Ghost",
    gradientClass: "gradient-type-ghost",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 25 },
    tier: "advanced",
  },
  {
    id: "dark",
    displayName: "Dark",
    gradientClass: "gradient-type-dark",
    textColor: "light",
    unlockRequirement: { type: "percentage", percent: 15 },
    tier: "advanced",
  },

  // Premium Tier (50+ or 30%)
  {
    id: "sunset",
    displayName: "Sunset",
    gradientClass: "gradient-pokemon-sunset",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 50 },
    tier: "premium",
  },
  {
    id: "ocean",
    displayName: "Ocean",
    gradientClass: "gradient-pokemon-ocean",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 50 },
    tier: "premium",
  },
  {
    id: "legendary",
    displayName: "Legendary",
    gradientClass: "gradient-type-special",
    textColor: "light",
    unlockRequirement: { type: "percentage", percent: 30 },
    tier: "premium",
  },
] as const;

/**
 * Array of all valid theme IDs
 */
export const THEME_IDS = RANKING_THEMES.map((t) => t.id) as readonly string[];

/**
 * Default theme ID used when no theme is specified
 */
export const DEFAULT_THEME_ID = "default";
