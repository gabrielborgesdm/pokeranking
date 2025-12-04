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
        "relative overflow-hidden rounded-xl p-6 min-w-[280px] border-2 box-border",
        className
      )}
    >
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-square mb-4 rounded-lg" />

      {/* Title placeholder */}
      <Skeleton className="h-6 w-3/4 mb-2" />

      {/* Footer placeholder */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
});
