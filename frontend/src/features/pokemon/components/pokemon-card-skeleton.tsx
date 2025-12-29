"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PokemonCardSkeletonProps {
  className?: string;
  isCompact?: boolean;
  showPositionBadge?: boolean;
}

export function PokemonCardSkeleton({
  className,
  isCompact = false,
  showPositionBadge = true,
}: PokemonCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden shadow-lg bg-muted",
        isCompact ? "rounded-lg p-2" : "rounded-xl p-3 sm:p-4",
        className
      )}
    >
      {/* Pokemon Image Skeleton */}
      <Skeleton
        className={cn(
          "w-full aspect-square rounded-lg",
          isCompact ? "mb-1" : "mb-3"
        )}
      />

      {/* Pokemon Name Skeleton */}
      <Skeleton
        className={cn(
          "mx-auto",
          isCompact ? "h-3 w-3/4 mb-0.5" : "h-6 w-3/4 mb-2"
        )}
      />

      {/* Type Icons Skeleton */}
      <div
        className={cn(
          "flex justify-center",
          isCompact ? "gap-1 h-5" : "gap-2 h-7"
        )}
      >
        <Skeleton
          className={cn("rounded-full", isCompact ? "w-4 h-4" : "w-7 h-7")}
        />
        <Skeleton
          className={cn("rounded-full", isCompact ? "w-4 h-4" : "w-7 h-7")}
        />
      </div>

      {/* Position Badge Skeleton (top-right) */}
      {showPositionBadge && (
        <div
          className={cn(
            "absolute rounded-full bg-muted-foreground/20",
            isCompact ? "-top-3 -right-3 w-10 h-10" : "-top-6 -right-6 w-20 h-20"
          )}
        />
      )}

      {/* Decorative circle (bottom-left) */}
      <div
        className={cn(
          "absolute rounded-full bg-white/5",
          isCompact
            ? "-bottom-2 -left-2 w-8 h-8"
            : "-bottom-4 -left-4 w-16 h-16"
        )}
      />
    </div>
  );
}
