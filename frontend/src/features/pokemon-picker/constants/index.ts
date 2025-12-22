export const POKEMON_PICKER_DEFAULTS = {
  MIN_CARD_WIDTH: 180,
  MAX_CARD_WIDTH: 250,
  GAP: 36,
  ROW_HEIGHT: 255,
  HEIGHT: 600,
  MIN_COLUMNS: 1,
  MAX_COLUMNS: 5,
} as const;

/** Maximum grid content width for desktop (5 columns * 180px + 4 gaps * 36px) */
export const MAX_GRID_CONTENT_WIDTH =
  POKEMON_PICKER_DEFAULTS.MAX_COLUMNS * POKEMON_PICKER_DEFAULTS.MIN_CARD_WIDTH +
  (POKEMON_PICKER_DEFAULTS.MAX_COLUMNS - 1) * POKEMON_PICKER_DEFAULTS.GAP;

export const POKEMON_PICKER_COMPACT = {
  MIN_CARD_WIDTH: 100,
  MAX_CARD_WIDTH: 140,
  GAP: 14,
  ROW_HEIGHT: 140,
} as const;

/** Breakpoint for mobile detection (matches Tailwind md: 768px) */
export const MOBILE_BREAKPOINT = 768;
