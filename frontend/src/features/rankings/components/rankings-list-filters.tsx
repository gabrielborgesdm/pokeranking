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
import type { SortByOption, OrderOption } from "../hooks/use-rankings-list";

interface RankingsListFiltersProps {
  searchValue: string;
  sortBy: SortByOption;
  order: OrderOption;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortByOption) => void;
  onOrderChange: (value: OrderOption) => void;
}

export const RankingsListFilters = memo(function RankingsListFilters({
  searchValue,
  sortBy,
  order,
  onSearchChange,
  onSortByChange,
  onOrderChange,
}: RankingsListFiltersProps) {
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

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("rankingsList.searchPlaceholder")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="flex-1 sm:flex-none sm:w-[160px]">
            <SelectValue placeholder={t("rankingsList.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="likesCount">
              {t("rankingsList.sortByLikes")}
            </SelectItem>
            <SelectItem value="createdAt">
              {t("rankingsList.sortByDate")}
            </SelectItem>
            <SelectItem value="pokemonCount">
              {t("rankingsList.sortByPokemon")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={order} onValueChange={onOrderChange}>
          <SelectTrigger className="flex-1 sm:flex-none sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{t("rankingsList.orderDesc")}</SelectItem>
            <SelectItem value="asc">{t("rankingsList.orderAsc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
