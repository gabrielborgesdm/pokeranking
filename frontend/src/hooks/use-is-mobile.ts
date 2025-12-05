"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the viewport is below a certain breakpoint
 * @param breakpoint - The breakpoint in pixels (default: 1024 for lg)
 * @returns boolean indicating if viewport is below the breakpoint
 */
export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
