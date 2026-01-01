"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
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
 * Mobile variant of Pokemon search filters.
 * Uses a stacked vertical layout optimized for touch interactions.
 */
export const MobilePokemonSearchFilters = memo(
  function MobilePokemonSearchFilters({
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

    // Count active filters (excluding defaults)
    const activeFilterCount = [
      search.length > 0,
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
        <div className="space-y-4">
          {/* Search input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t("admin.pokemon.searchPlaceholder")}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("admin.pokemon.searchPlaceholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10 h-11 text-base"
              />
              {inputValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setInputValue("");
                    onSearchChange("");
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Type filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t("admin.pokemon.filterTypes")}
            </Label>
            <TypesSelector
              selectedTypes={selectedTypes}
              onTypesChange={onTypesChange}
              buttonClassName="h-11 text-base w-full justify-between"
            />
          </div>

          {/* Generation filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
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
                className="h-11 text-base pr-10"
              />
              {generation !== null && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onGenerationChange(null)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sort options - 2 column grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sort by */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t("pokemonFilters.sortBy")}
              </Label>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  onSortByChange(value as PokemonSortByOption)
                }
              >
                <SelectTrigger className="h-11 text-base">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t("pokemonFilters.order")}
              </Label>
              <Select
                value={order}
                onValueChange={(value) =>
                  onOrderChange(value as PokemonOrderOption)
                }
              >
                <SelectTrigger className="h-11 text-base">
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

          {/* Clear filters button */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full h-11 text-base"
            >
              <X className="h-4 w-4 mr-2" />
              {t("pokemonFilters.clearFilters")}
              <span className="ml-1 text-muted-foreground">
                ({activeFilterCount})
              </span>
            </Button>
          )}
        </div>
      </div>
    );
  }
);
