"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PokemonSearchFilters } from "@/features/pokemon";
import type { UseFilterStateReturn } from "../../hooks/use-filter-state";

interface MobileFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: UseFilterStateReturn;
}

/**
 * Mobile filter dialog - full-screen dialog for filter controls.
 * Has sticky header with close button and optional footer with clear filters.
 */
export const MobileFilterDialog = memo(function MobileFilterDialog({
  isOpen,
  onClose,
  filterState,
}: MobileFilterDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-full rounded-none p-0 flex flex-col [&>button]:hidden">
        <DialogHeader className="px-4 py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{t("pokemonFilters.filters")}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
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
        {filterState.activeFilterCount > 0 && (
          <div className="px-4 py-3 border-t border-border/50 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={filterState.handleClearFilters}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              {t("pokemonFilters.clearFilters")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
