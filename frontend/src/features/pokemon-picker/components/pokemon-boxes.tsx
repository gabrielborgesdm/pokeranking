"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypesSelector, SelectedTypesBadges } from "@/features/pokemon";
import { BoxTabs } from "./box-tabs";
import { PokemonPicker } from "./pokemon-picker";
import { useBoxPokemon, type BoxSortByOption, type BoxOrderOption } from "../hooks/use-box-pokemon";
import type { PokemonType } from "@pokeranking/shared";

const GENERATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

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
    boxes,
    selectedBoxId,
    isLoadingBoxes,
    pokemon,
    isLoading,
    search,
    selectedTypes,
    generation,
    sortBy,
    order,
    handleBoxSelect,
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
  } = useBoxPokemon();

  // Local state for debounced search
  const [inputValue, setInputValue] = useState(search);

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

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Box tabs */}
        <BoxTabs
          boxes={boxes}
          selectedBoxId={selectedBoxId}
          isLoading={isLoadingBoxes}
          onBoxSelect={handleBoxSelect}
        />

        {/* Compact filters - all in one row with wrapping */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1 min-w-[120px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("admin.pokemon.searchPlaceholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          {/* Type filter */}
          <TypesSelector
            selectedTypes={selectedTypes}
            onTypesChange={handleTypesChange}
            compact
          />

          {/* Generation filter */}
          <Select
            value={generation?.toString() ?? "all"}
            onValueChange={(value) =>
              handleGenerationChange(value === "all" ? null : Number(value))
            }
          >
            <SelectTrigger className="w-[100px] h-9">
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

          {/* Sort by */}
          <Select value={sortBy} onValueChange={(value) => handleSortByChange(value as BoxSortByOption)}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pokedexNumber">{t("pokemonFilters.sortByPokedex")}</SelectItem>
              <SelectItem value="name">{t("admin.pokemon.sortByName")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Order */}
          <Select value={order} onValueChange={(value) => handleOrderChange(value as BoxOrderOption)}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t("admin.pokemon.orderAsc")}</SelectItem>
              <SelectItem value="desc">{t("admin.pokemon.orderDesc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selected type badges */}
        {selectedTypes.length > 0 && (
          <SelectedTypesBadges
            selectedTypes={selectedTypes}
            onTypeRemove={handleTypeRemove}
          />
        )}

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
