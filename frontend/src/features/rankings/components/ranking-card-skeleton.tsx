"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RankingCardSkeletonProps {
  className?: string;
}

export const RankingCardSkeleton = memo(function RankingCardSkeleton({
  className,
}: RankingCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-3 sm:p-6 min-w-0 shadow-lg bg-pokemon-navy/10 dark:bg-secondary/20",
        className
      )}
    >
      {/* Pokemon Image placeholder */}
      <div className="relative w-full aspect-square mb-4">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      {/* Content */}
      <div className="space-y-2 min-w-0">
        {/* Title placeholder */}
        <Skeleton className="h-6 w-3/4" />

        {/* Username placeholder */}
        <Skeleton className="h-4 w-1/2" />

        {/* Footer placeholder - Pokemon count and likes */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-pokemon-navy/5 dark:bg-secondary/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-pokemon-navy/5 dark:bg-secondary/10" />
    </div>
  );
});
