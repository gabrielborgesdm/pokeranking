"use client";

import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/providers/theme-provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { ThemeIcon, toggleTheme } = useThemeContext();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="fixed right-4 top-4"
      >
        <ThemeIcon className="h-5 w-5" />
      </Button>
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
