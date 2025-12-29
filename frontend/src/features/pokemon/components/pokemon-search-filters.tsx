"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import type { PokemonType } from "@pokeranking/shared";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypesSelector, SelectedTypesBadges } from "./types-selector";

export type PokemonSortByOption = "pokedexNumber" | "name";
export type PokemonOrderOption = "asc" | "desc";

interface PokemonSearchFiltersProps {
  search: string;
  selectedTypes: PokemonType[];
  generation: number | null;
  sortBy: PokemonSortByOption;
  order: PokemonOrderOption;
  onSearchChange: (value: string) => void;
  onTypesChange: (types: PokemonType[]) => void;
  onGenerationChange: (generation: number | null) => void;
  onSortByChange: (value: PokemonSortByOption) => void;
  onOrderChange: (value: PokemonOrderOption) => void;
  /** Width for the filter content area (for matching grid width) */
  contentWidth?: number | string;
  className?: string;
}

export const PokemonSearchFilters = memo(function PokemonSearchFilters({
  search,
  selectedTypes,
  generation,
  sortBy,
  order,
  onSearchChange,
  onTypesChange,
  onGenerationChange,
  onSortByChange,
  onOrderChange,
  contentWidth,
  className,
}: PokemonSearchFiltersProps) {
  const { t } = useTranslation();

  // Local state for debounced search
  const [inputValue, setInputValue] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== search) {
        onSearchChange(inputValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, search, onSearchChange]);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleTypeRemove = (type: PokemonType) => {
    onTypesChange(selectedTypes.filter((t) => t !== type));
  };

  const handleClearFilters = () => {
    setInputValue("");
    onSearchChange("");
    onTypesChange([]);
    onGenerationChange(null);
    onSortByChange("pokedexNumber");
    onOrderChange("asc");
  };

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    search.length > 0,
    selectedTypes.length > 0,
    generation !== null,
    sortBy !== "pokedexNumber",
    order !== "asc",
  ].filter(Boolean).length;

  const contentStyle = contentWidth
    ? { width: typeof contentWidth === "number" ? contentWidth : contentWidth }
    : undefined;

  // Search input component
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

  // Filter content
  const filterContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Type filter */}
        <div className="space-y-1.5 lg:col-span-2 xl:col-span-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("pokemonFilters.type")}
          </label>
          <TypesSelector
            selectedTypes={selectedTypes}
            onTypesChange={onTypesChange}
            compact
            buttonClassName="w-full h-9"
          />
        </div>

        {/* Generation filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("admin.pokemon.generation")}
          </label>
          <Input
            type="number"
            min={1}
            placeholder={t("pokemonFilters.allGenerations")}
            value={generation ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              onGenerationChange(value === "" ? null : Number(value));
            }}
            className="w-full h-9"
          />
        </div>

        {/* Sort by */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("pokemonFilters.sortBy")}
          </label>
          <Select
            value={sortBy}
            onValueChange={(value) =>
              onSortByChange(value as PokemonSortByOption)
            }
          >
            <SelectTrigger className="w-full h-9">
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
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("pokemonFilters.order")}
          </label>
          <Select
            value={order}
            onValueChange={(value) =>
              onOrderChange(value as PokemonOrderOption)
            }
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t("admin.pokemon.orderAsc")}</SelectItem>
              <SelectItem value="desc">
                {t("admin.pokemon.orderDesc")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected type badges */}
      {selectedTypes.length > 0 && (
        <SelectedTypesBadges
          selectedTypes={selectedTypes}
          onTypeRemove={handleTypeRemove}
        />
      )}
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search bar with filter toggle */}
      <div
        className="flex items-center gap-2 mx-auto"
        style={contentStyle}
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
          <span className="hidden sm:inline">{t("pokemonFilters.filters")}</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="ml-1 h-5 w-5 p-0 justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              filtersOpen && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Expandable filters section */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
          <div className="mx-auto" style={contentStyle}>
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
    </div>
  );
});
