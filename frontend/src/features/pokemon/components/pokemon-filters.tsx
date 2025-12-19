"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypesSelector, SelectedTypesBadges } from "./types-selector";
import type { PokemonType } from "@pokeranking/shared";

export type SortByOption = "name" | "createdAt";
export type OrderOption = "asc" | "desc";

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;
const GENERATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

interface PokemonFiltersProps {
  searchValue: string;
  sortBy: SortByOption;
  order: OrderOption;
  selectedTypes: PokemonType[];
  generation?: number | null;
  limit?: number;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortByOption) => void;
  onOrderChange: (value: OrderOption) => void;
  onTypesChange: (types: PokemonType[]) => void;
  onGenerationChange?: (generation: number | null) => void;
  onLimitChange?: (limit: number) => void;
}

export const PokemonFilters = memo(function PokemonFilters({
  searchValue,
  sortBy,
  order,
  selectedTypes,
  generation,
  limit,
  onSearchChange,
  onSortByChange,
  onOrderChange,
  onTypesChange,
  onGenerationChange,
  onLimitChange,
}: PokemonFiltersProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchValue) {
        onSearchChange(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchValue, onSearchChange]);

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  const handleTypeRemove = (type: PokemonType) => {
    onTypesChange(selectedTypes.filter((t) => t !== type));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("admin.pokemon.searchPlaceholder")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <TypesSelector
            selectedTypes={selectedTypes}
            onTypesChange={onTypesChange}
          />

          {generation !== undefined && onGenerationChange && (
            <Select
              value={generation?.toString() ?? "all"}
              onValueChange={(value) =>
                onGenerationChange(value === "all" ? null : Number(value))
              }
            >
              <SelectTrigger className="flex-1 sm:flex-none sm:w-[120px]">
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
          )}

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[140px]">
              <SelectValue placeholder={t("admin.pokemon.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("admin.pokemon.sortByName")}</SelectItem>
              <SelectItem value="createdAt">{t("admin.pokemon.sortByDate")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={order} onValueChange={onOrderChange}>
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t("admin.pokemon.orderAsc")}</SelectItem>
              <SelectItem value="desc">{t("admin.pokemon.orderDesc")}</SelectItem>
            </SelectContent>
          </Select>

          {limit !== undefined && onLimitChange && (
            <Select
              value={String(limit)}
              onValueChange={(value) => onLimitChange(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <SelectedTypesBadges
        selectedTypes={selectedTypes}
        onTypeRemove={handleTypeRemove}
      />
    </div>
  );
});
