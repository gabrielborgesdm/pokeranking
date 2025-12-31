"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PokemonSearchFilters } from "@/features/pokemon";
import type { UseFilterStateReturn } from "../../hooks/use-filter-state";

interface DesktopFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: UseFilterStateReturn;
}

/**
 * Desktop filter panel - bottom overlay within the picker container.
 * No backdrop, scrollable content, stays open while interacting.
 */
export const DesktopFilterPanel = memo(function DesktopFilterPanel({
  isOpen,
  onClose,
  filterState,
}: DesktopFilterPanelProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="flex absolute inset-x-0 bottom-0 z-50 bg-background border-t border-border shadow-lg mr-3 max-h-[60%] flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <h3 className="text-sm font-semibold">
          {t("pokemonFilters.filters")}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-y-auto flex-1 p-4">
        <PokemonSearchFilters
          search={filterState.search}
          selectedTypes={filterState.selectedTypes}
          generation={filterState.generation}
          sortBy={filterState.sortBy}
          order={filterState.order}
          onSearchChange={filterState.handleSearchChange}
          onTypesChange={filterState.handleTypesChange}
          onGenerationChange={filterState.handleGenerationChange}
          onSortByChange={filterState.handleSortByChange}
          onOrderChange={filterState.handleOrderChange}
        />
      </div>
    </div>
  );
});
