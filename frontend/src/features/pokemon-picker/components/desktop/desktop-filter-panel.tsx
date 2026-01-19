"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypesSelector } from "@/features/pokemon/components/types-selector";
import type { UseFilterStateReturn } from "../../hooks/use-filter-state";
import type {
  PokemonSortByOption,
  PokemonOrderOption,
} from "@/features/pokemon/components/pokemon-search-filters.types";

interface DesktopFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: UseFilterStateReturn;
}

/**
 * Desktop filter panel - bottom overlay within the picker container.
 * Contains inline filter controls with a close button.
 */
export const DesktopFilterPanel = memo(function DesktopFilterPanel({
  isOpen,
  onClose,
  filterState,
}: DesktopFilterPanelProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="p-3 space-y-3">
        {/* Header with title, clear button, and close button */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t("pokemonFilters.additionalFilters", "Additional Filters")}
          </span>
          <div className="flex items-center gap-1">
            {filterState.activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={filterState.handleClearFilters}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                {t("pokemonFilters.clearFilters")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Type filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("pokemonFilters.type")}
            </label>
            <TypesSelector
              selectedTypes={filterState.selectedTypes}
              onTypesChange={filterState.handleTypesChange}
              compact
              buttonClassName="h-9 text-sm w-full justify-start"
            />
          </div>

          {/* Generation filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("pokemonFilters.generation")}
            </label>
            <Input
              type="number"
              min={1}
              max={9}
              placeholder={t("pokemonFilters.allGenerations")}
              value={filterState.generation ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                filterState.handleGenerationChange(
                  value === "" ? null : Number(value)
                );
              }}
              className="h-9"
            />
          </div>

          {/* Sort by */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("pokemonFilters.sortBy")}
            </label>
            <Select
              value={filterState.sortBy}
              onValueChange={(value) =>
                filterState.handleSortByChange(value as PokemonSortByOption)
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pokedexNumber">
                  {t("pokemonFilters.sortByPokedex")}
                </SelectItem>
                <SelectItem value="name">
                  {t("admin.pokemon.sortByName")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("pokemonFilters.order")}
            </label>
            <Select
              value={filterState.order}
              onValueChange={(value) =>
                filterState.handleOrderChange(value as PokemonOrderOption)
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  {t("admin.pokemon.orderAsc")}
                </SelectItem>
                <SelectItem value="desc">
                  {t("admin.pokemon.orderDesc")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
});
