"use client";

import { useState, useEffect } from "react";

const SMALL_SCREEN_BREAKPOINT = 1224;

/**
 * Hook to detect if the viewport is a small screen (< 1224px)
 * @returns {{ isSmall: boolean }} - isSmall is true when viewport width is below 1224px
 */
export function useIsSmallScreen(): { isSmall: boolean } {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmall(window.innerWidth < SMALL_SCREEN_BREAKPOINT);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return { isSmall };
}
