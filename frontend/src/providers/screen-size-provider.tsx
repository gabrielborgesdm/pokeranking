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
const SMALL_SCREEN_BREAKPOINT = 872;

/** Breakpoint for mobile detection (matches Tailwind md: 768px) */
const MOBILE_BREAKPOINT = 768;

/** Debounce delay for resize detection (ms) */
const RESIZE_DEBOUNCE_DELAY = 100;

interface ScreenSizeContextValue {
  /** True when viewport width < 872px */
  isSmall: boolean;
  /** True when viewport width < 768px */
  isMobile: boolean;
  /** True when the window is being resized (debounced) */
  isResizing: boolean;
}

const ScreenSizeContext = createContext<ScreenSizeContextValue | undefined>(
  undefined
);

export function ScreenSizeProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const checkWidth = () => {
      setWidth(window.innerWidth);
      setIsResizing(true);

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsResizing(false);
      }, RESIZE_DEBOUNCE_DELAY);
    };

    setWidth(window.innerWidth);
    window.addEventListener("resize", checkWidth);
    return () => {
      window.removeEventListener("resize", checkWidth);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const value = useMemo(() => {
    if (width === undefined) return undefined;
    return {
      isSmall: width < SMALL_SCREEN_BREAKPOINT,
      isMobile: width < MOBILE_BREAKPOINT,
      isResizing,
    };
  }, [width, isResizing]);

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
