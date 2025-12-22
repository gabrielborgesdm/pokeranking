"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PokemonCardSkeleton } from "@/features/pokemon/components/pokemon-card-skeleton";

interface PokemonListingCardsSkeletonProps {
  count?: number;
  isCompact?: boolean;
  showNavbar?: boolean;
  className?: string;
}

export function PokemonListingCardsSkeleton({
  count = 15,
  isCompact = false,
  showNavbar = true,
  className,
}: PokemonListingCardsSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Navbar Skeleton */}
      {showNavbar && (
        <nav className="flex justify-center py-4 px-4 md:px-8 border-b border-border/40 bg-card/70">
          <div className="flex items-center justify-between gap-4 w-full max-w-[1044px]">
            {/* Left: Title and username */}
            <div className="flex flex-col gap-1 min-w-0">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Center: Search input */}
            <div className="flex-1 flex items-center justify-end gap-2">
              <div className="hidden sm:flex max-w-md">
                <Skeleton className="h-9 w-48" />
              </div>
            </div>

            {/* Right: Button */}
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </nav>
      )}

      {/* Cards Grid Skeleton */}
      <div className="flex justify-center">
        <div
          className={cn(
            "grid py-8 max-w-[1044px]",
            isCompact
              ? "grid-cols-3 gap-3.5 px-1"
              : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-9 px-4"
          )}
        >
          {Array.from({ length: count }).map((_, i) => (
            <PokemonCardSkeleton key={i} isCompact={isCompact} />
          ))}
        </div>
      </div>
    </div>
  );
}
