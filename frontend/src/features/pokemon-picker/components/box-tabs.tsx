"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { BoxResponseDto } from "@pokeranking/api-client";

interface BoxTabsProps {
  boxes: BoxResponseDto[];
  selectedBoxId: string;
  isLoading?: boolean;
  onBoxSelect: (boxId: string) => void;
}

export const BoxTabs = memo(function BoxTabs({
  boxes,
  selectedBoxId,
  isLoading,
  onBoxSelect,
}: BoxTabsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex gap-2 pb-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {/* User boxes */}
        {boxes.map((box) => (
          <Button
            key={box._id}
            variant={selectedBoxId === box._id ? "default" : "outline"}
            size="sm"
            onClick={() => onBoxSelect(box._id)}
            className={cn(
              "shrink-0",
              selectedBoxId === box._id && "pointer-events-none"
            )}
          >
            {box.name}
            <span className="ml-1.5 text-xs opacity-70">
              ({box.pokemon.length})
            </span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
});
