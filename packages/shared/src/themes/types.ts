/**
 * Theme unlock requirement - either a fixed Pokemon count or percentage of total
 */
export type ThemeUnlockRequirement =
  | { type: "fixed"; count: number }
  | { type: "percentage"; percent: number };

/**
 * Theme tier for grouping in the UI
 */
export type ThemeTier = "starter" | "intermediate" | "advanced" | "premium";

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
  /** Text color for contrast - 'light' for white text, 'dark' for dark text */
  textColor: "light" | "dark";
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
