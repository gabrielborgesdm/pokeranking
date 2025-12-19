"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypesSelector, SelectedTypesBadges } from "@/features/pokemon";
import { PokemonPicker } from "./pokemon-picker";
import { useBoxPokemon, type BoxSortByOption, type BoxOrderOption } from "../hooks/use-box-pokemon";
import { useResponsiveGrid } from "../hooks/use-responsive-grid";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type { PokemonType } from "@pokeranking/shared";
import { cn } from "@/lib/utils";

const GENERATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
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
  } = useBoxPokemon();

  // Use the same responsive grid calculation as the picker to get matching width
  // Note: minCardWidth, gap, rowHeight are auto-detected based on mobile/desktop
  const { containerRef, gridContentWidth } = useResponsiveGrid({
    maxColumns,
    itemCount: pokemon.length || 1, // At least 1 to avoid division by zero
    paddingX: GRID_PADDING_X,
  });

  // Use viewport-based mobile detection to match CSS breakpoints
  const isMobile = useIsMobile(768);

  // Local state for debounced search
  const [inputValue, setInputValue] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== search) {
        handleSearchChange(inputValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, search, handleSearchChange]);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleTypeRemove = (type: PokemonType) => {
    handleTypesChange(selectedTypes.filter((t) => t !== type));
  };

  const handleClearFilters = () => {
    setInputValue("");
    handleSearchChange("");
    handleTypesChange([]);
    handleGenerationChange(null);
    handleSortByChange("pokedexNumber");
    handleOrderChange("asc");
  };

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    search.length > 0,
    selectedTypes.length > 0,
    generation !== null,
    sortBy !== "pokedexNumber",
    order !== "asc",
  ].filter(Boolean).length;

  // Search input component shared between desktop header and mobile sheet
  const searchInput = (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t("admin.pokemon.searchPlaceholder")}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9 h-10"
      />
    </div>
  );

  // Filter content shared between desktop collapsible and mobile sheet
  const filterContent = (
    <div className="space-y-4">
      {/* Filter grid - responsive: 1 col on small, 2 cols on medium, 4 cols on large */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Type filter - spans full width on lg screens */}
        <div className="space-y-1.5 lg:col-span-2 xl:col-span-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("pokemonFilters.type")}
          </label>
          <TypesSelector
            selectedTypes={selectedTypes}
            onTypesChange={handleTypesChange}
            compact
            buttonClassName="w-full h-9"
          />
        </div>

        {/* Generation filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("admin.pokemon.generation")}
          </label>
          <Select
            value={generation?.toString() ?? "all"}
            onValueChange={(value) =>
              handleGenerationChange(value === "all" ? null : Number(value))
            }
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder={t("admin.pokemon.generation")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pokemonFilters.allGenerations")}</SelectItem>
              {GENERATION_OPTIONS.map((gen) => (
                <SelectItem key={gen} value={String(gen)}>
                  {t("pokemonFilters.generation", { gen })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort by */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("pokemonFilters.sortBy")}
          </label>
          <Select value={sortBy} onValueChange={(value) => handleSortByChange(value as BoxSortByOption)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pokedexNumber">{t("pokemonFilters.sortByPokedex")}</SelectItem>
              <SelectItem value="name">{t("admin.pokemon.sortByName")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("pokemonFilters.order")}
          </label>
          <Select value={order} onValueChange={(value) => handleOrderChange(value as BoxOrderOption)}>
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t("admin.pokemon.orderAsc")}</SelectItem>
              <SelectItem value="desc">{t("admin.pokemon.orderDesc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected type badges - inside filter content */}
      {selectedTypes.length > 0 && (
        <SelectedTypesBadges
          selectedTypes={selectedTypes}
          onTypeRemove={handleTypeRemove}
        />
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className="space-y-3">
        {/* Desktop: Search bar with filter toggle - width matches grid, centered */}
        <div
          className="hidden md:flex items-center gap-2 mx-auto"
          style={{
            width: gridContentWidth > 0 ? gridContentWidth : `calc(100% - ${GRID_PADDING_X * 2}px)`,
          }}
        >
          {searchInput}

          {/* Filter toggle button */}
          <Button
            variant={filtersOpen ? "secondary" : "outline"}
            size="default"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="gap-2 h-10 shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t("pokemonFilters.filters")}</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 p-0 justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              filtersOpen && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Desktop: Expandable filters section */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="hidden md:block">
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
            <div
              className="mx-auto"
              style={{
                width: gridContentWidth > 0 ? gridContentWidth : `calc(100% - ${GRID_PADDING_X * 2}px)`,
              }}
            >
              <div className="rounded-lg border bg-card/50 p-4 space-y-4">
                {filterContent}

                {/* Clear filters button */}
                {activeFilterCount > 0 && (
                  <div className="flex justify-end pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-muted-foreground hover:text-foreground gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t("pokemonFilters.clearFilters")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Mobile: Bottom sheet for filters - only render on mobile to avoid overlay on desktop */}
        {isMobile && (
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetContent side="bottom" className="h-full">
              <SheetHeader>
                <SheetTitle>{t("pokemonFilters.filters")}</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto flex-1 px-4 space-y-4">
                {/* Search input in mobile sheet */}
                {searchInput}
                {filterContent}
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
          onClick={() => setFiltersOpen(true)}
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
