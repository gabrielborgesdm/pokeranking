"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PokemonSearchFilters } from "@/features/pokemon";
import { PokemonPicker } from "./pokemon-picker";
import { useAllPokemon } from "../hooks/use-all-pokemon";
import { cn } from "@/lib/utils";

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

/**
 * Hook that exposes the Pokemon filter state and handlers.
 * Use this to render PickerHeaderFilters in an external header.
 */
export function usePokemonBoxFilters() {
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

  return {
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
  };
}

interface PokemonBoxesWithFiltersProps extends PokemonBoxesProps {
  /** Whether filters panel is open (controlled) */
  filtersOpen: boolean;
  /** Called when filters panel should close */
  onCloseFilters: () => void;
  /** Called when active filter count changes */
  onActiveFilterCountChange?: (count: number) => void;
}

/**
 * PokemonBoxes with controlled filter panel.
 * Filter button is rendered externally, this component renders the filter popup.
 */
export const PokemonBoxesWithFilters = memo(function PokemonBoxesWithFilters({
  disabledIds,
  filteredOutIds,
  className,
  maxColumns,
  height,
  filtersOpen,
  onCloseFilters,
  onActiveFilterCountChange,
}: PokemonBoxesWithFiltersProps) {
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
  } = useAllPokemon();

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

  // Report active filter count changes to parent
  useEffect(() => {
    onActiveFilterCountChange?.(activeFilterCount);
  }, [activeFilterCount, onActiveFilterCountChange]);

  // Convert height to CSS value
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div className="relative w-full" style={{ height: heightStyle }}>
        {/* Pokemon picker container */}
        <div className={cn("w-full h-full overflow-hidden", className)}>
          {/* Pokemon picker */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : pokemon.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-muted-foreground">
                {t("pokedex.pokemon.noPokemon")}
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4 text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  {t("pokemonFilters.clearFilters")}
                </Button>
              )}
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

        {/* Desktop: Bottom overlay for filters */}
        {filtersOpen && (
          <div className="hidden md:flex absolute inset-x-0 bottom-0 z-50 bg-background border-t border-border shadow-lg mr-3 max-h-[60%] flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
              <h3 className="text-sm font-semibold">
                {t("pokemonFilters.filters")}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseFilters}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
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
              <div className="px-4 py-2 border-t border-border/50">
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
        )}

        {/* Mobile: Full screen dialog for filters */}
        <Dialog open={filtersOpen} onOpenChange={(open) => !open && onCloseFilters()}>
          <DialogContent className="md:hidden h-[100dvh] max-h-[100dvh] w-screen max-w-full rounded-none p-0 flex flex-col">
            <DialogHeader className="px-4 py-3 border-b border-border/50 shrink-0">
              <DialogTitle>{t("pokemonFilters.filters")}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 p-4">
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
              <div className="px-4 py-3 border-t border-border/50 shrink-0">
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
          </DialogContent>
        </Dialog>
    </div>
  );
});

/**
 * Simple PokemonBoxes with filter button in its own internal header.
 * For use cases where an external header is not available.
 */
export const PokemonBoxes = memo(function PokemonBoxes({
  disabledIds,
  filteredOutIds,
  className,
  maxColumns,
  height,
}: PokemonBoxesProps) {
  const { t } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // Convert height to CSS value
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div className="relative w-full" style={{ height: heightStyle }}>
      {/* Pokemon picker container */}
      <div className={cn("w-full h-full overflow-hidden", className)}>
        {/* Pokemon picker */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : pokemon.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-muted-foreground">
              {t("pokedex.pokemon.noPokemon")}
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="mt-4 text-muted-foreground hover:text-foreground gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                {t("pokemonFilters.clearFilters")}
              </Button>
            )}
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

      {/* Bottom overlay for filters - outside overflow-hidden container */}
      {filtersOpen && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-background border-t border-border shadow-lg mr-3 max-h-[60%] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
            <h3 className="text-sm font-semibold">
              {t("pokemonFilters.filters")}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFiltersOpen(false)}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
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
            <div className="px-4 py-2 border-t border-border/50">
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
      )}
    </div>
  );
});
