"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PokemonCardSkeletonProps {
  className?: string;
}

export function PokemonCardSkeleton({ className }: PokemonCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-4 min-w-[200px] bg-muted",
        className
      )}
    >
      {/* Pokemon Image Skeleton */}
      <Skeleton className="w-full aspect-square mb-3 rounded-lg" />

      {/* Pokemon Name Skeleton */}
      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />

      {/* Type Icons Skeleton */}
      <div className="flex justify-center gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="w-7 h-7 rounded-full" />
      </div>
    </div>
  );
}
