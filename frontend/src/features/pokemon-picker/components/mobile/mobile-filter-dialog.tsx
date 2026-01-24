"use client";

import { memo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypesSelector } from "@/features/pokemon/components/types-selector";
import { useBackButtonDialog } from "@/hooks/use-back-button-dialog";
import type { UseFilterStateReturn } from "../../hooks/use-filter-state";
import type {
  PokemonSortByOption,
  PokemonOrderOption,
} from "@/features/pokemon/components/pokemon-search-filters.types";

interface MobileFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: UseFilterStateReturn;
}

/**
 * Mobile filter dialog - bottom sheet with touch-friendly filters.
 * Shows types, generation, sort, and order filters without search (search is in the header).
 */
export const MobileFilterDialog = memo(function MobileFilterDialog({
  isOpen,
  onClose,
  filterState,
}: MobileFilterDialogProps) {
  const { t } = useTranslation();
  useBackButtonDialog(isOpen, onClose);

  // Count active filters (excluding search and defaults)
  const activeFilterCount = [
    filterState.selectedTypes.length > 0,
    filterState.generation !== null,
    filterState.sortBy !== "pokedexNumber",
    filterState.order !== "asc",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    filterState.handleTypesChange([]);
    filterState.handleGenerationChange(null);
    filterState.handleSortByChange("pokedexNumber");
    filterState.handleOrderChange("asc");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="px-4 pb-8 pt-0 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="px-0 pt-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4" />
            {t("pokemonFilters.filters")}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Type filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("admin.pokemon.filterTypes")}
            </Label>
            <TypesSelector
              selectedTypes={filterState.selectedTypes}
              onTypesChange={filterState.handleTypesChange}
              buttonClassName="h-10 text-sm w-full justify-between"
            />
          </div>

          {/* Generation filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("pokemonFilters.generation")}
            </Label>
            <div className="relative">
              <Input
                type="number"
                min={1}
                placeholder={t("pokemonFilters.allGenerations")}
                value={filterState.generation ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  filterState.handleGenerationChange(value === "" ? null : Number(value));
                }}
                className="h-10 text-sm pr-9"
              />
              {filterState.generation !== null && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => filterState.handleGenerationChange(null)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Sort options - 2 column grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Sort by */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("pokemonFilters.sortBy")}
              </Label>
              <Select
                value={filterState.sortBy}
                onValueChange={(value) =>
                  filterState.handleSortByChange(value as PokemonSortByOption)
                }
              >
                <SelectTrigger className="h-10 text-sm w-full">
                  <SelectValue className="text-sm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pokedexNumber" className="text-sm">
                    {t("pokemonFilters.sortByPokedex")}
                  </SelectItem>
                  <SelectItem value="name" className="text-sm">
                    {t("admin.pokemon.sortByName")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("pokemonFilters.order")}
              </Label>
              <Select
                value={filterState.order}
                onValueChange={(value) =>
                  filterState.handleOrderChange(value as PokemonOrderOption)
                }
              >
                <SelectTrigger className="h-10 text-sm w-full">
                  <SelectValue className="text-sm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc" className="text-sm">
                    {t("admin.pokemon.orderAsc")}
                  </SelectItem>
                  <SelectItem value="desc" className="text-sm">
                    {t("admin.pokemon.orderDesc")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear filters button */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full h-9 text-sm"
            >
              <X className="h-3.5 w-3.5 mr-2" />
              {t("pokemonFilters.clearFilters")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});
