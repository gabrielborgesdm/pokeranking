export const POKEMON_PICKER_DEFAULTS = {
  MIN_CARD_WIDTH: 180,
  MAX_CARD_WIDTH: 250,
  GAP: 36,
  ROW_HEIGHT: 255,
  HEIGHT: 600,
  MIN_COLUMNS: 1,
  MAX_COLUMNS: 8,
} as const;

export const POKEMON_PICKER_COMPACT = {
  MIN_CARD_WIDTH: 100,
  MAX_CARD_WIDTH: 140,
  GAP: 8,
  ROW_HEIGHT: 150,
} as const;

/** Breakpoint for mobile detection (matches Tailwind md: 768px) */
export const MOBILE_BREAKPOINT = 768;
