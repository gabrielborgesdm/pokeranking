/**
 * Theme unlock requirement - either a fixed Pokemon count or percentage of total
 */
export type ThemeUnlockRequirement =
  | { type: "fixed"; count: number }
  | { type: "percentage"; percent: number };

/**
 * Theme tier for grouping in the UI
 */
export type ThemeTier = "starter" | "wild" | "elite" | "legendary" | "master";

/**
 * Ranking theme configuration
 */
export interface RankingTheme {
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
export interface ThemeUnlockProgress {
  /** Current Pokemon count */
  current: number;
  /** Required Pokemon count to unlock */
  required: number;
  /** Percentage progress (0-100) */
  percentage: number;
}
