'use strict';

// src/themes/constants.ts
var RANKING_THEMES = [
  // Starter Tier (0 required) - Always available
  {
    id: "default",
    displayName: "Classic",
    gradientClass: "gradient-type-normal",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter"
  },
  {
    id: "fire",
    displayName: "Fire",
    gradientClass: "gradient-type-fire",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter"
  },
  {
    id: "water",
    displayName: "Water",
    gradientClass: "gradient-type-water",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter"
  },
  {
    id: "grass",
    displayName: "Grass",
    gradientClass: "gradient-type-grass",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter"
  },
  // Intermediate Tier (10+ or 5%)
  {
    id: "electric",
    displayName: "Electric",
    gradientClass: "gradient-type-electric",
    textColor: "dark",
    unlockRequirement: { type: "fixed", count: 10 },
    tier: "intermediate"
  },
  {
    id: "psychic",
    displayName: "Psychic",
    gradientClass: "gradient-type-psychic",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 10 },
    tier: "intermediate"
  },
  {
    id: "poison",
    displayName: "Poison",
    gradientClass: "gradient-type-poison",
    textColor: "light",
    unlockRequirement: { type: "percentage", percent: 5 },
    tier: "intermediate"
  },
  // Advanced Tier (25+ or 15%)
  {
    id: "dragon",
    displayName: "Dragon",
    gradientClass: "gradient-type-dragon",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 25 },
    tier: "advanced"
  },
  {
    id: "ghost",
    displayName: "Ghost",
    gradientClass: "gradient-type-ghost",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 25 },
    tier: "advanced"
  },
  {
    id: "dark",
    displayName: "Dark",
    gradientClass: "gradient-type-dark",
    textColor: "light",
    unlockRequirement: { type: "percentage", percent: 15 },
    tier: "advanced"
  },
  // Premium Tier (50+ or 30%)
  {
    id: "sunset",
    displayName: "Sunset",
    gradientClass: "gradient-pokemon-sunset",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 50 },
    tier: "premium"
  },
  {
    id: "ocean",
    displayName: "Ocean",
    gradientClass: "gradient-pokemon-ocean",
    textColor: "light",
    unlockRequirement: { type: "fixed", count: 50 },
    tier: "premium"
  },
  {
    id: "legendary",
    displayName: "Legendary",
    gradientClass: "gradient-type-special",
    textColor: "light",
    unlockRequirement: { type: "percentage", percent: 30 },
    tier: "premium"
  }
];
var THEME_IDS = RANKING_THEMES.map((t) => t.id);
var DEFAULT_THEME_ID = "default";

// src/themes/utils.ts
function isThemeAvailable(themeId, pokemonCount, totalPokemonInSystem) {
  const theme = RANKING_THEMES.find((t) => t.id === themeId);
  if (!theme) return false;
  const { unlockRequirement } = theme;
  if (unlockRequirement.type === "fixed") {
    return pokemonCount >= unlockRequirement.count;
  } else {
    const requiredCount = Math.ceil(
      unlockRequirement.percent / 100 * totalPokemonInSystem
    );
    return pokemonCount >= requiredCount;
  }
}
function getThemeById(themeId) {
  return RANKING_THEMES.find((t) => t.id === themeId);
}
function getAvailableThemes(pokemonCount, totalPokemonInSystem) {
  return RANKING_THEMES.filter(
    (theme) => isThemeAvailable(theme.id, pokemonCount, totalPokemonInSystem)
  );
}
function getThemeUnlockProgress(theme, pokemonCount, totalPokemonInSystem) {
  const { unlockRequirement } = theme;
  const required = unlockRequirement.type === "fixed" ? unlockRequirement.count : Math.ceil(unlockRequirement.percent / 100 * totalPokemonInSystem);
  return {
    current: pokemonCount,
    required,
    percentage: required > 0 ? Math.min(100, pokemonCount / required * 100) : 100
  };
}
function isValidThemeId(themeId) {
  return RANKING_THEMES.some((t) => t.id === themeId);
}
function getThemeRequiredCount(themeId, totalPokemonInSystem) {
  const theme = getThemeById(themeId);
  if (!theme) return 0;
  const { unlockRequirement } = theme;
  if (unlockRequirement.type === "fixed") {
    return unlockRequirement.count;
  } else {
    return Math.ceil(unlockRequirement.percent / 100 * totalPokemonInSystem);
  }
}

// src/pokemon-types.ts
var POKEMON_TYPE_VALUES = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water"
];
var PokemonTypes = Object.fromEntries(
  POKEMON_TYPE_VALUES.map((t) => [t, t])
);

exports.DEFAULT_THEME_ID = DEFAULT_THEME_ID;
exports.POKEMON_TYPE_VALUES = POKEMON_TYPE_VALUES;
exports.PokemonTypes = PokemonTypes;
exports.RANKING_THEMES = RANKING_THEMES;
exports.THEME_IDS = THEME_IDS;
exports.getAvailableThemes = getAvailableThemes;
exports.getThemeById = getThemeById;
exports.getThemeRequiredCount = getThemeRequiredCount;
exports.getThemeUnlockProgress = getThemeUnlockProgress;
exports.isThemeAvailable = isThemeAvailable;
exports.isValidThemeId = isValidThemeId;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map