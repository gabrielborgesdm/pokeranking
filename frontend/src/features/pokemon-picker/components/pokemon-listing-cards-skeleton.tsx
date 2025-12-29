"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PokemonCardSkeleton } from "@/features/pokemon/components/pokemon-card-skeleton";

interface PokemonListingCardsSkeletonProps {
  count?: number;
  isCompact?: boolean;
  className?: string;
}

export function PokemonListingCardsSkeleton({
  count = 15,
  isCompact = false,
  className,
}: PokemonListingCardsSkeletonProps) {
  // Split cards into two zones for realistic skeleton
  const firstZoneCount = Math.min(10, count);
  const secondZoneCount = Math.max(0, count - firstZoneCount);

  return (
    <main className={cn("space-y-0", className)}>
      {/* Hero Skeleton */}
      <div className="mt-6 mx-4 sm:mx-auto max-w-[1044px] rounded-2xl py-8 sm:py-12 px-4 sm:px-6 bg-muted/50">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-6">
          {/* Left: Top Pokemon Image */}
          <div className="shrink-0">
            <Skeleton className="w-20 h-20 sm:w-32 sm:h-32 rounded-full" />
          </div>

          {/* Center: Title and info */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
            <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 mx-auto sm:mx-0" />
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Skeleton className="h-4 sm:h-5 w-32" />
              <Skeleton className="h-4 sm:h-5 w-24" />
            </div>
          </div>

          {/* Right: Like button */}
          <div className="shrink-0">
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>
        </div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex justify-center px-4 sm:px-0">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full py-3 sm:py-4 mt-6 px-3 sm:px-4 rounded-xl bg-card/80 border border-border/50 max-w-[1044px]">
          {/* Search input */}
          <div className="flex-1 min-w-0 max-w-[180px] sm:max-w-sm">
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>

      {/* Pokemon Cards with Zone Headers */}
      <div className="flex justify-center px-1 md:px-4 mt-6">
        <div className="w-full max-w-[1044px] space-y-6">
          {/* First Zone (S-Tier) */}
          <div className="space-y-4">
            {/* Zone Header Skeleton */}
            <ZoneHeaderSkeleton isCompact={isCompact} />

            {/* Pokemon Cards Grid */}
            <div
              className={cn(
                "grid",
                isCompact
                  ? "grid-cols-3 gap-3.5"
                  : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-9"
              )}
            >
              {Array.from({ length: firstZoneCount }).map((_, i) => (
                <PokemonCardSkeleton key={`zone1-${i}`} isCompact={isCompact} />
              ))}
            </div>
          </div>

          {/* Second Zone (A-Tier) */}
          {secondZoneCount > 0 && (
            <div className="space-y-4">
              {/* Zone Header Skeleton */}
              <ZoneHeaderSkeleton isCompact={isCompact} />

              {/* Pokemon Cards Grid */}
              <div
                className={cn(
                  "grid",
                  isCompact
                    ? "grid-cols-3 gap-3.5"
                    : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-9"
                )}
              >
                {Array.from({ length: secondZoneCount }).map((_, i) => (
                  <PokemonCardSkeleton key={`zone2-${i}`} isCompact={isCompact} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ZoneHeaderSkeleton({ isCompact }: { isCompact: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 rounded-lg bg-muted/30 border-l-4 border-muted-foreground/20",
        isCompact ? "px-2 py-2" : "px-4 py-8"
      )}
    >
      {/* Zone badge */}
      <Skeleton
        className={cn(
          "rounded-full shrink-0",
          isCompact ? "w-6 h-6" : "w-9 h-9"
        )}
      />

      {/* Zone name and count */}
      <div className="flex flex-col gap-1">
        <Skeleton className={cn(isCompact ? "h-3 w-12" : "h-4 w-16")} />
        <Skeleton className={cn(isCompact ? "h-2.5 w-16" : "h-3.5 w-20")} />
      </div>

      {/* Top types preview */}
      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto mr-1 sm:mr-2">
        <Skeleton className={cn(isCompact ? "h-5 w-8" : "h-6 w-10")} />
        <Skeleton className={cn(isCompact ? "h-5 w-8" : "h-6 w-10")} />
        {!isCompact && <Skeleton className="h-6 w-10" />}
      </div>

      {/* Stats button */}
      <Skeleton className={cn(isCompact ? "h-6 w-6" : "h-8 w-8")} />
    </div>
  );
}
