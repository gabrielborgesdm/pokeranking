/**
 * Configuration for desktop ranking editor responsive sizing.
 *
 * This config controls:
 * - When to use desktop vs mobile layout (DESKTOP_MODE_MIN_WIDTH)
 * - Sizing values at different viewport widths (breakpoints)
 */

/** Sizing values for grid components */
export interface GridSizing {
  maxColumns: number;
  minCardWidth?: number;
  gap?: number;
  rowHeight?: number;
}

/** Sizing values for the container/layout */
export interface LayoutSizing {
  /** Height for dropzone/picker - can be "85vh", "80vh", etc. */
  contentHeight: string;
  /** Horizontal padding for header (Tailwind class) */
  headerPaddingX: string;
  /** Vertical padding for header (Tailwind class) */
  headerPaddingY: string;
  /** Header height (Tailwind class) */
  headerHeight: string;
}

/** Typography and spacing values */
export interface StyleSizing {
  /** Header title font size (Tailwind class) */
  headerTitleSize: string;
  /** Icon button size (Tailwind class, e.g., "h-8 w-8") */
  iconButtonSize: string;
  /** Icon size inside buttons (Tailwind class, e.g., "h-4 w-4") */
  iconSize: string;
  /** Gap between the two columns (Tailwind class) */
  gridGap: string;
}

/** Complete sizing configuration for a breakpoint */
export interface DesktopSizingConfig {
  grid: GridSizing;
  layout: LayoutSizing;
  styles: StyleSizing;
}

/** Breakpoint definition with minWidth and corresponding config */
export interface BreakpointConfig {
  /** Minimum viewport width for this breakpoint (in pixels) */
  minWidth: number;
  /** Name for debugging/identification */
  name: string;
  /** Sizing configuration for this breakpoint */
  sizing: DesktopSizingConfig;
}

/**
 * Breakpoints for desktop responsive sizing.
 * Ordered from largest to smallest minWidth.
 * The hook finds the FIRST breakpoint where viewport >= minWidth.
 */
export const DESKTOP_RESPONSIVE_BREAKPOINTS: BreakpointConfig[] = [
  {
    name: "xl",
    minWidth: 1536,
    sizing: {
      grid: { maxColumns: 5 },
      layout: {
        contentHeight: "85vh",
        headerPaddingX: "px-8",
        headerPaddingY: "py-2",
        headerHeight: "h-[52px]",
      },
      styles: {
        headerTitleSize: "text-sm",
        iconButtonSize: "h-8 w-8",
        iconSize: "h-4 w-4",
        gridGap: "gap-4",
      },
    },
  },
  {
    name: "lg",
    minWidth: 1280,
    sizing: {
      grid: { maxColumns: 4 },
      layout: {
        contentHeight: "85vh",
        headerPaddingX: "px-6",
        headerPaddingY: "py-2",
        headerHeight: "h-[48px]",
      },
      styles: {
        headerTitleSize: "text-sm",
        iconButtonSize: "h-8 w-8",
        iconSize: "h-4 w-4",
        gridGap: "gap-4",
      },
    },
  },
  {
    name: "md",
    minWidth: 1100,
    sizing: {
      grid: { maxColumns: 3, minCardWidth: 140, rowHeight: 220 },
      layout: {
        contentHeight: "85vh",
        headerPaddingX: "px-4",
        headerPaddingY: "py-1.5",
        headerHeight: "h-[44px]",
      },
      styles: {
        headerTitleSize: "text-xs",
        iconButtonSize: "h-7 w-7",
        iconSize: "h-3.5 w-3.5",
        gridGap: "gap-2",
      },
    },
  },
  {
    name: "sm",
    minWidth: 1000,
    sizing: {
      grid: { maxColumns: 3 },
      layout: {
        contentHeight: "85vh",
        headerPaddingX: "px-3",
        headerPaddingY: "py-1",
        headerHeight: "h-[40px]",
      },
      styles: {
        headerTitleSize: "text-xs",
        iconButtonSize: "h-7 w-7",
        iconSize: "h-3.5 w-3.5",
        gridGap: "gap-3",
      },
    },
  },
];

/**
 * Default/fallback sizing (used when viewport is below smallest breakpoint).
 * Matches the smallest breakpoint for consistency.
 */
export const DEFAULT_DESKTOP_SIZING: DesktopSizingConfig =
  DESKTOP_RESPONSIVE_BREAKPOINTS[DESKTOP_RESPONSIVE_BREAKPOINTS.length - 1]
    .sizing;

/**
 * Minimum viewport width to use desktop mode (two-column layout).
 * Below this threshold, mobile mode (tab-based) is used.
 *
 * Default: 768px (allows desktop mode on smaller screens)
 * Previous behavior was 1536px via screen-size-provider's isMedium.
 */
export const DESKTOP_MODE_MIN_WIDTH = 768;
