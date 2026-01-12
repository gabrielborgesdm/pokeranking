"use client";

import { useThemeContext } from "@/providers/theme-provider";
import { useEffect } from "react";

export function DynamicThemeMeta() {
  const { mounted, isDark } = useThemeContext();

  useEffect(() => {
    if (!mounted) return;

    // Update theme-color meta tag for status bars
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#1a1d2e" : "#fafafa");
    }

    // Update Apple status bar style for iOS PWA
    const metaAppleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaAppleStatusBar) {
      metaAppleStatusBar.setAttribute("content", isDark ? "black-translucent" : "default");
    }
  }, [mounted, isDark]);

  return null;
}
