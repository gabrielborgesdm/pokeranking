"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DESKTOP_RESPONSIVE_BREAKPOINTS,
  DEFAULT_DESKTOP_SIZING,
  DESKTOP_MODE_MIN_WIDTH,
  type DesktopSizingConfig,
  type BreakpointConfig,
} from "../config/ranking-edit-desktop-layout-config";

/** Debounce delay for resize detection (ms) */
const RESIZE_DEBOUNCE_DELAY = 100;

interface UseRankingEditDesktopLayoutOptions {
  /** Custom breakpoints (optional - uses default if not provided) */
  breakpoints?: BreakpointConfig[];
  /** Debounce delay for resize events (default: 100ms) */
  debounceMs?: number;
}

interface UseRankingEditDesktopLayoutReturn {
  /** Current sizing configuration based on viewport */
  sizing: DesktopSizingConfig;
  /** Current breakpoint name (for debugging) */
  breakpointName: string;
  /** Current viewport width */
  viewportWidth: number;
  /** Whether the window is currently being resized */
  isResizing: boolean;
  /** Whether to use mobile layout (viewport < DESKTOP_MODE_MIN_WIDTH) */
  useMobileLayout: boolean;
}

/**
 * Hook that returns responsive sizing values based on current viewport width.
 *
 * Uses a simple approach: iterates through breakpoints (sorted largest to smallest)
 * and returns the first one where viewport >= minWidth.
 *
 * This is a SEPARATE hook from use-responsive-grid.ts - it handles the
 * desktop-ranking-editing component's layout/styling configuration,
 * not the grid calculation logic.
 */
export function useRankingEditDesktopLayout(
  options: UseRankingEditDesktopLayoutOptions = {}
): UseRankingEditDesktopLayoutReturn {
  const {
    breakpoints = DESKTOP_RESPONSIVE_BREAKPOINTS,
    debounceMs = RESIZE_DEBOUNCE_DELAY,
  } = options;

  const [viewportWidth, setViewportWidth] = useState<number | undefined>(
    undefined
  );
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      setIsResizing(true);
      setViewportWidth(window.innerWidth);

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsResizing(false);
      }, debounceMs);
    };

    // Set initial value
    setViewportWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [debounceMs]);

  // Find the appropriate breakpoint config
  const { sizing, breakpointName } = useMemo(() => {
    // Default to largest breakpoint for SSR
    const width = viewportWidth ?? 1920;

    // Breakpoints should be sorted from largest to smallest minWidth
    // Find first breakpoint where viewport >= minWidth
    for (const bp of breakpoints) {
      if (width >= bp.minWidth) {
        return { sizing: bp.sizing, breakpointName: bp.name };
      }
    }
    // Fallback to default if below all breakpoints
    return { sizing: DEFAULT_DESKTOP_SIZING, breakpointName: "default" };
  }, [viewportWidth, breakpoints]);

  const useMobileLayout = useMemo(() => {
    const width = viewportWidth ?? 1920;
    return width < DESKTOP_MODE_MIN_WIDTH;
  }, [viewportWidth]);

  return {
    sizing,
    breakpointName,
    viewportWidth: viewportWidth ?? 1920,
    isResizing,
    useMobileLayout,
  };
}
