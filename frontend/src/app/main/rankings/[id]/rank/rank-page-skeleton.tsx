"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PokemonCardSkeleton } from "@/features/pokemon/components/pokemon-card-skeleton";
import { cn } from "@/lib/utils";

interface RankPageSkeletonProps {
  className?: string;
}

export function RankPageSkeleton({ className }: RankPageSkeletonProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-1 auto-rows-min",
        "md:grid-cols-2 md:grid-rows-1",
        className
      )}
    >
      {/* Dropzone Panel - left on desktop, top on mobile */}
      <div className="min-h-0 overflow-hidden max-h-[45dvh] md:max-h-none flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-1 md:px-8 md:py-2 border-b border-border/40 h-10 md:h-[52px]">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 min-h-0 p-4 overflow-hidden">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <PokemonCardSkeleton
                key={`dropzone-${i}`}
                isCompact
                showPositionBadge
              />
            ))}
          </div>
        </div>
      </div>

      {/* Picker Panel - right on desktop, bottom on mobile */}
      <div className="min-h-0 overflow-hidden max-h-[40dvh] md:max-h-none flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-1 md:px-8 md:py-2 border-b border-border/40 h-10 md:h-[52px]">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Cards Grid */}
        <div className="flex-1 min-h-0 p-4 overflow-hidden">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <PokemonCardSkeleton
                key={`picker-${i}`}
                isCompact
                showPositionBadge={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
