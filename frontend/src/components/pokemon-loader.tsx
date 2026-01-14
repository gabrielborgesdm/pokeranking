"use client";

import { cn } from "@/lib/utils";

interface PokemonLoaderProps {
  /**
   * Size of the loader
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Show loading text below the spinner
   * @default false
   */
  showText?: boolean;
  /**
   * Custom loading text (only shown if showText is true)
   */
  text?: string;
}

/**
 * Pokemon-themed loading spinner with animated Pokeball
 */
export function PokemonLoader({
  size = "md",
  className,
  showText = false,
  text = "Loading...",
}: PokemonLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {/* Pokeball Animation */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "relative animate-pulse",
            sizeClasses[size]
          )}
          style={{ animationDuration: "2s" }}
        >
          {/* Pokeball SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Loading"
          >
            {/* Outer circle border */}
            <circle
              cx="50"
              cy="50"
              r="48"
              className="fill-none stroke-muted-foreground/20"
              strokeWidth="2"
            />

            {/* Top half */}
            <path
              d="M 50 2 A 48 48 0 0 1 98 50 L 65 50 A 15 15 0 0 0 35 50 L 2 50 A 48 48 0 0 1 50 2 Z"
              className="fill-muted-foreground/20"
            />

            {/* Bottom half */}
            <path
              d="M 2 50 A 48 48 0 0 0 50 98 A 48 48 0 0 0 98 50 L 65 50 A 15 15 0 0 1 35 50 Z"
              className="fill-muted-foreground/10"
            />

            {/* Middle band */}
            <rect
              x="2"
              y="47"
              width="96"
              height="6"
              className="fill-muted-foreground/30"
            />

            {/* Center button outer circle */}
            <circle
              cx="50"
              cy="50"
              r="15"
              className="fill-background stroke-muted-foreground/30"
              strokeWidth="3"
            />

            {/* Center button inner circle */}
            <circle
              cx="50"
              cy="50"
              r="8"
              className="fill-none stroke-muted-foreground/20"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Optional loading text */}
      {showText && (
        <p className="text-sm text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );
}
