// src/themes/constants.ts
var RANKING_THEMES = [
  // Starter Tier (0 required) - Always available
  {
    id: "fire",
    displayName: "Fire",
    gradientClass: "gradient-type-fire",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter"
  },
  {
    id: "water",
    displayName: "Water",
    gradientClass: "gradient-type-water",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter"
  },
  {
    id: "grass",
    displayName: "Grass",
    gradientClass: "gradient-type-grass",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 0 },
    tier: "starter"
  },
  {
    id: "default",
    displayName: "Normal",
    gradientClass: "gradient-type-normal",
    textColor: "#1a1a1a",
    unlockRequirement: { type: "fixed", count: 100 },
    tier: "wild"
  },
  {
    id: "ghost",
    displayName: "Ghost",
    gradientClass: "gradient-type-ghost",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 150 },
    tier: "wild"
  },
  {
    id: "poison",
    displayName: "Poison",
    gradientClass: "gradient-type-poison",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 200 },
    tier: "wild"
  },
  {
    id: "dragon",
    displayName: "Dragon",
    gradientClass: "gradient-type-dragon",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 300 },
    tier: "elite"
  },
  {
    id: "psychic",
    displayName: "Psychic",
    gradientClass: "gradient-type-psychic",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 400 },
    tier: "elite"
  },
  {
    id: "electric",
    displayName: "Electric",
    gradientClass: "gradient-type-electric",
    textColor: "#1a1a1a",
    unlockRequirement: { type: "fixed", count: 500 },
    tier: "elite"
  },
  {
    id: "red",
    displayName: "Pokemon Red",
    gradientClass: "gradient-pokemon-red",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 600 },
    tier: "elite"
  },
  {
    id: "dark",
    displayName: "Dark",
    gradientClass: "gradient-type-dark",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 700 },
    tier: "legendary"
  },
  {
    id: "sunset",
    displayName: "Sunset",
    gradientClass: "gradient-pokemon-sunset",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 800 },
    tier: "legendary"
  },
  {
    id: "ocean",
    displayName: "Ocean",
    gradientClass: "gradient-pokemon-ocean",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 900 },
    tier: "legendary"
  },
  {
    id: "legendary",
    displayName: "Legendary",
    gradientClass: "gradient-type-special",
    textColor: "#ffffff",
    unlockRequirement: { type: "fixed", count: 1e3 },
    tier: "legendary"
  },
  {
    id: "greatball",
    displayName: "Great Ball",
    gradientClass: "gradient-greatball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1050 },
    tier: "master"
  },
  {
    id: "ultraball",
    displayName: "Ultra Ball",
    gradientClass: "gradient-ultraball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1100 },
    tier: "master"
  },
  {
    id: "loveball",
    displayName: "Love Ball",
    gradientClass: "gradient-loveball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1150 },
    tier: "master"
  },
  {
    id: "luxuryball",
    displayName: "Luxury Ball",
    gradientClass: "gradient-luxuryball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1200 },
    tier: "master"
  },
  {
    id: "pokeball",
    displayName: "Pokeball",
    gradientClass: "gradient-pokeball",
    textColor: "#ffffff",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    unlockRequirement: { type: "fixed", count: 1250 },
    tier: "master"
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

// src/zones/constants.ts
var DEFAULT_ZONES = [
  { name: "S", interval: [1, 10], color: "#ef4444" },
  { name: "A", interval: [11, 150], color: "#f97316" },
  { name: "B", interval: [151, 400], color: "#eab308" },
  { name: "C", interval: [401, 700], color: "#22c55e" },
  { name: "D", interval: [701, 1e3], color: "#3b82f6" },
  { name: "F", interval: [1001, null], color: "#6b7280" }
];

export { DEFAULT_THEME_ID, DEFAULT_ZONES, POKEMON_TYPE_VALUES, PokemonTypes, RANKING_THEMES, THEME_IDS, getAvailableThemes, getThemeById, getThemeRequiredCount, getThemeUnlockProgress, isThemeAvailable, isValidThemeId };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map