"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { BoxResponseDto } from "@pokeranking/api-client";

const ALL_POKEMON_BOX_ID = "all";

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
  const router = useRouter();

  const handleAddBox = () => {
    router.push("/boxes/new");
  };

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
        {/* All Pokemon tab */}
        <Button
          variant={selectedBoxId === ALL_POKEMON_BOX_ID ? "default" : "outline"}
          size="sm"
          onClick={() => onBoxSelect(ALL_POKEMON_BOX_ID)}
          className={cn(
            "shrink-0",
            selectedBoxId === ALL_POKEMON_BOX_ID && "pointer-events-none"
          )}
        >
          {t("boxSelector.allPokemon")}
        </Button>

        {/* User boxes */}
        {boxes
          .filter((box) => box.name !== "All Pokemon") // Filter out the default box if returned
          .map((box) => (
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

        {/* Add box button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddBox}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("boxPicker.addBox")}
        </Button>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
});
