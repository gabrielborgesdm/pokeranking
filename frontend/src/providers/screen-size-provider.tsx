"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";

/** Breakpoint for small screen detection */
const SMALL_SCREEN_BREAKPOINT = 1224;

/** Breakpoint for mobile detection (matches Tailwind md: 768px) */
const MOBILE_BREAKPOINT = 768;

interface ScreenSizeContextValue {
  /** True when viewport width < 1224px */
  isSmall: boolean;
  /** True when viewport width < 768px */
  isMobile: boolean;
}

const ScreenSizeContext = createContext<ScreenSizeContextValue | undefined>(
  undefined
);

export function ScreenSizeProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const checkWidth = () => {
      setWidth(window.innerWidth);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const value = useMemo(() => {
    if (width === undefined) return undefined;
    return {
      isSmall: width < SMALL_SCREEN_BREAKPOINT,
      isMobile: width < MOBILE_BREAKPOINT,
    };
  }, [width]);

  // Don't render children until screen size is determined
  if (value === undefined) {
    return null;
  }

  return (
    <ScreenSizeContext.Provider value={value}>
      {children}
    </ScreenSizeContext.Provider>
  );
}

export function useScreenSize(): ScreenSizeContextValue {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error("useScreenSize must be used within a ScreenSizeProvider");
  }
  return context;
}
