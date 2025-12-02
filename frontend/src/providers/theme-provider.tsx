"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun, type LucideIcon } from "lucide-react";

interface ThemeContextValue {
  mounted: boolean;
  isDark: boolean;
  ThemeIcon: LucideIcon;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeContextProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const ThemeIcon = isDark ? Sun : Moon;

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const value = useMemo(
    () => ({ mounted, isDark, ThemeIcon, theme, setTheme, toggleTheme }),
    [mounted, isDark, ThemeIcon, theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </NextThemesProvider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
