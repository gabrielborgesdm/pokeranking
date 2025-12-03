"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UserCardSkeletonProps {
  className?: string;
}

export const UserCardSkeleton = memo(function UserCardSkeleton({
  className,
}: UserCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 min-w-[280px] border-2 box-border",
        className
      )}
    >
      <div className="absolute top-4 left-4">
        <Skeleton className="h-10 w-16" />
      </div>
      <div className="absolute top-4 right-4">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <div className="mt-16 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
});
