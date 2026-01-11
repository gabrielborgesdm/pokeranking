import type { RankingTheme } from "./types";

/**
 * All available ranking themes
 */
export const RANKING_THEMES: readonly RankingTheme[] = [
  // Starter Tier (0 required) - Always available
  {
    id: "fire",
    displayName: "Fire",
    gradientClass: "gradient-type-fire",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter",
  },
  {
    id: "water",
    displayName: "Water",
    gradientClass: "gradient-type-water",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter",
  },
  {
    id: "grass",
    displayName: "Grass",
    gradientClass: "gradient-type-grass",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 50 },
    tier: "starter",
  },
  {
    id: "default",
    displayName: "Normal",
    gradientClass: "gradient-type-normal",
    textColor: "#1a1a1a",
    unlockRequirement: { type: "fixed", count: 100 },
    tier: "wild",
  },
  {
    id: "ghost",
    displayName: "Ghost",
    gradientClass: "gradient-type-ghost",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 150 },
    tier: "wild",
  },


  {
    id: "poison",
    displayName: "Poison",
    gradientClass: "gradient-type-poison",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 200 },
    tier: "wild",
  },

  {
    id: "dragon",
    displayName: "Dragon",
    gradientClass: "gradient-type-dragon",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 300 },
    tier: "elite",
  },

  {
    id: "psychic",
    displayName: "Psychic",
    gradientClass: "gradient-type-psychic",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 400 },
    tier: "elite",
  },
  {
    id: "electric",
    displayName: "Electric",
    gradientClass: "gradient-type-electric",
    textColor: "#1a1a1a",
    unlockRequirement: { type: "fixed", count: 500 },
    tier: "elite",
  },

  {
    id: "red",
    displayName: "Pokemon Red",
    gradientClass: "gradient-pokemon-red",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 600 },
    tier: "elite",
  },

  {
    id: "dark",
    displayName: "Dark",
    gradientClass: "gradient-type-dark",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 700 },
    tier: "legendary",
  },

  {
    id: "sunset",
    displayName: "Sunset",
    gradientClass: "gradient-pokemon-sunset",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 800 },
    tier: "legendary",
  },
  {
    id: "ocean",
    displayName: "Ocean",
    gradientClass: "gradient-pokemon-ocean",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 900 },
    tier: "legendary",
  },
  {
    id: "legendary",
    displayName: "Legendary",
    gradientClass: "gradient-type-special",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 1000 },
    tier: "legendary",
  },

  {
    id: "greatball",
    displayName: "Great Ball",
    gradientClass: "gradient-greatball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1050 },
    tier: "master",
  },
  {
    id: "ultraball",
    displayName: "Ultra Ball",
    gradientClass: "gradient-ultraball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1100 },
    tier: "master",
  },
  {
    id: "loveball",
    displayName: "Love Ball",
    gradientClass: "gradient-loveball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1150 },
    tier: "master",
  },

  {
    id: "luxuryball",
    displayName: "Luxury Ball",
    gradientClass: "gradient-luxuryball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1200 },
    tier: "master",
  },

  {
    id: "pokeball",
    displayName: "Pokeball",
    gradientClass: "gradient-pokeball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1250 },
    tier: "master",
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
