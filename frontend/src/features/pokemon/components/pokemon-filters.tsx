"use client";

import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { POKEMON_TYPE_VALUES, getPokemonTypeColor } from "@/lib/pokemon-types";
import type { PokemonType } from "@pokeranking/shared";

export type SortByOption = "name" | "createdAt";
export type OrderOption = "asc" | "desc";

interface PokemonFiltersProps {
  searchValue: string;
  sortBy: SortByOption;
  order: OrderOption;
  selectedTypes: PokemonType[];
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortByOption) => void;
  onOrderChange: (value: OrderOption) => void;
  onTypesChange: (types: PokemonType[]) => void;
}

export const PokemonFilters = memo(function PokemonFilters({
  searchValue,
  sortBy,
  order,
  selectedTypes,
  onSearchChange,
  onSortByChange,
  onOrderChange,
  onTypesChange,
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

  const handleTypeToggle = (type: PokemonType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const clearTypes = () => {
    onTypesChange([]);
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

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                {t("admin.pokemon.filterTypes")}
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t("admin.pokemon.selectTypes")}
                  </span>
                  {selectedTypes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTypes}
                      className="h-6 px-2 text-xs"
                    >
                      {t("admin.pokemon.clearTypes")}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {POKEMON_TYPE_VALUES.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => handleTypeToggle(type)}
                      />
                      <Badge
                        variant="secondary"
                        style={{ backgroundColor: getPokemonTypeColor(type) }}
                        className="text-white text-xs"
                      >
                        {type}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("admin.pokemon.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("admin.pokemon.sortByName")}</SelectItem>
              <SelectItem value="createdAt">{t("admin.pokemon.sortByDate")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={order} onValueChange={onOrderChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t("admin.pokemon.orderAsc")}</SelectItem>
              <SelectItem value="desc">{t("admin.pokemon.orderDesc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              style={{ backgroundColor: getPokemonTypeColor(type) }}
              className="text-white text-xs cursor-pointer"
              onClick={() => handleTypeToggle(type)}
            >
              {type}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});
