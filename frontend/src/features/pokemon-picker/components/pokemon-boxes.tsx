"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { PokemonSearchFilters } from "@/features/pokemon";
import { PokemonPicker } from "./pokemon-picker";
import { useAllPokemon } from "../hooks/use-all-pokemon";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { useScreenSize } from "@/providers/screen-size-provider";
import { cn } from "@/lib/utils";
import { useState } from "react";

const GRID_PADDING_X = 16;

interface PokemonBoxesProps {
  /** IDs of Pokemon that should appear disabled/unavailable (grayed out but visible) */
  disabledIds?: string[];
  /** IDs of Pokemon that should be completely hidden from the picker */
  filteredOutIds?: string[];
  /** Optional class name for the container */
  className?: string;
  /** Maximum number of columns (caps responsive behavior) */
  maxColumns?: number;
  /** Height of the picker container. Accepts number for px or string for CSS value like "75vh" */
  height?: number | string;
}

export const PokemonBoxes = memo(function PokemonBoxes({
  disabledIds,
  filteredOutIds,
  className,
  maxColumns,
  height,
}: PokemonBoxesProps) {
  const { t } = useTranslation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    pokemon,
    isLoading,
    search,
    selectedTypes,
    generation,
    sortBy,
    order,
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
  } = useAllPokemon();

  // Use the same responsive grid calculation as the picker to get matching width
  const { containerRef, gridContentWidth } = useResponsiveGrid({
    maxColumns,
    itemCount: pokemon.length || 1,
    paddingX: GRID_PADDING_X,
  });

  // Use viewport-based mobile detection to match CSS breakpoints
  const { isMobile } = useScreenSize();

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    search.length > 0,
    selectedTypes.length > 0,
    generation !== null,
    sortBy !== "pokedexNumber",
    order !== "asc",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    handleSearchChange("");
    handleTypesChange([]);
    handleGenerationChange(null);
    handleSortByChange("pokedexNumber");
    handleOrderChange("asc");
  };

  const contentWidth =
    gridContentWidth > 0
      ? gridContentWidth
      : `calc(100% - ${GRID_PADDING_X * 2}px)`;

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className="space-y-3">
        {/* Desktop: Shared filter component */}
        <div className="hidden md:block">
          <PokemonSearchFilters
            search={search}
            selectedTypes={selectedTypes}
            generation={generation}
            sortBy={sortBy}
            order={order}
            onSearchChange={handleSearchChange}
            onTypesChange={handleTypesChange}
            onGenerationChange={handleGenerationChange}
            onSortByChange={handleSortByChange}
            onOrderChange={handleOrderChange}
            contentWidth={contentWidth}
          />
        </div>

        {/* Mobile: Bottom sheet for filters */}
        {isMobile && (
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="bottom" className="h-full">
              <SheetHeader>
                <SheetTitle>{t("pokemonFilters.filters")}</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto flex-1 px-4">
                <PokemonSearchFilters
                  search={search}
                  selectedTypes={selectedTypes}
                  generation={generation}
                  sortBy={sortBy}
                  order={order}
                  onSearchChange={handleSearchChange}
                  onTypesChange={handleTypesChange}
                  onGenerationChange={handleGenerationChange}
                  onSortByChange={handleSortByChange}
                  onOrderChange={handleOrderChange}
                />
              </div>
              {activeFilterCount > 0 && (
                <SheetFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("pokemonFilters.clearFilters")}
                  </Button>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        )}

        {/* Mobile: Floating filter button */}
        <Button
          variant="default"
          size="icon"
          onClick={() => setMobileFiltersOpen(true)}
          className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:hidden"
        >
          <SlidersHorizontal className="h-6 w-6" />
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Pokemon picker */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <PokemonPicker
            pokemon={pokemon}
            mode="drag"
            disabledIds={disabledIds}
            filteredOutIds={filteredOutIds}
            maxColumns={maxColumns}
            height={height}
          />
        )}
      </div>
    </div>
  );
});
