"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, ChevronDown } from "lucide-react";
import type { PokemonType } from "@pokeranking/shared";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypesSelector } from "../types-selector";
import type {
  PokemonSearchFiltersProps,
  PokemonSortByOption,
  PokemonOrderOption,
} from "../pokemon-search-filters.types";

/**
 * Responsive Pokemon search filters.
 * Mobile: Stacked search input and collapsible filters button
 * Desktop: Inline search input with collapsible filters button
 */
export const LocalPokemonSearchFilters = memo(
  function LocalPokemonSearchFilters({
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

    // Collapsed state for filters
    const [isExpanded, setIsExpanded] = useState(false);

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

    const handleClearFilters = () => {
      setInputValue("");
      onSearchChange("");
      onTypesChange([]);
      onGenerationChange(null);
      onSortByChange("pokedexNumber");
      onOrderChange("asc");
    };

    // Count active filters (excluding search and defaults)
    const activeFilterCount = [
      selectedTypes.length > 0,
      generation !== null,
      sortBy !== "pokedexNumber",
      order !== "asc",
    ].filter(Boolean).length;

    const contentStyle = contentWidth
      ? {
          width: typeof contentWidth === "number" ? contentWidth : contentWidth,
        }
      : undefined;

    return (
      <div className={cn("mx-auto w-full", className)} style={contentStyle}>
        <div className="space-y-3">
          {/* Search input and toggle button - Inline on desktop, stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("admin.pokemon.searchPlaceholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10 h-10 text-sm"
              />
              {inputValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setInputValue("");
                    onSearchChange("");
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Toggle filters button */}
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full sm:w-auto sm:min-w-[140px] h-10 text-sm justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{t("pokemonFilters.filters")}</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Collapsible filters section */}
          {isExpanded && (
            <div className="space-y-3 pt-1">
              {/* Type filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("admin.pokemon.filterTypes")}
                </Label>
                <TypesSelector
                  selectedTypes={selectedTypes}
                  onTypesChange={onTypesChange}
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
                    value={generation ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      onGenerationChange(value === "" ? null : Number(value));
                    }}
                    className="h-10 text-sm pr-9"
                  />
                  {generation !== null && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onGenerationChange(null)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Sort options - 2 column grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {/* Sort by */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("pokemonFilters.sortBy")}
                  </Label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) =>
                      onSortByChange(value as PokemonSortByOption)
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
                    value={order}
                    onValueChange={(value) =>
                      onOrderChange(value as PokemonOrderOption)
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
          )}
        </div>
      </div>
    );
  }
);
