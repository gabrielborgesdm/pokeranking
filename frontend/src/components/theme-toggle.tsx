"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { trackThemeToggle } = useAnalytics();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    trackThemeToggle(newTheme);
  }, [theme, setTheme, trackThemeToggle]);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
      onClick={handleToggle}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
