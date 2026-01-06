"use client";

import { memo } from "react";
import { RankingCardSkeleton } from "./ranking-card-skeleton";

const SKELETON_COUNT = 6;

interface RankingCardsSkeletonProps {
  count?: number;
}

export const RankingCardsSkeleton = memo(function RankingCardsSkeleton({
  count = SKELETON_COUNT,
}: RankingCardsSkeletonProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <RankingCardSkeleton key={index} />
      ))}
    </div>
  );
});
