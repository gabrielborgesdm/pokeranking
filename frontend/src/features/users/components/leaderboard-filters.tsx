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
import { useAnalytics } from "@/hooks/use-analytics";

export type SortByOption = "rankedPokemonCount" | "username" | "createdAt";
export type OrderOption = "asc" | "desc";

interface LeaderboardFiltersProps {
  searchValue: string;
  sortBy: SortByOption;
  order: OrderOption;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortByOption) => void;
  onOrderChange: (value: OrderOption) => void;
}

export const LeaderboardFilters = memo(function LeaderboardFilters({
  searchValue,
  sortBy,
  order,
  onSearchChange,
  onSortByChange,
  onOrderChange,
}: LeaderboardFiltersProps) {
  const { t } = useTranslation();
  const { trackPokemonSearch } = useAnalytics();
  const [inputValue, setInputValue] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchValue) {
        onSearchChange(inputValue);
        if (inputValue.trim()) {
          trackPokemonSearch(inputValue.trim());
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchValue, onSearchChange, trackPokemonSearch]);

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("leaderboard.searchPlaceholder")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("leaderboard.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rankedPokemonCount">
              {t("leaderboard.sortByScore")}
            </SelectItem>
            <SelectItem value="username">
              {t("leaderboard.sortByUsername")}
            </SelectItem>
            <SelectItem value="createdAt">
              {t("leaderboard.sortByDate")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={order} onValueChange={onOrderChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{t("leaderboard.orderDesc")}</SelectItem>
            <SelectItem value="asc">{t("leaderboard.orderAsc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
