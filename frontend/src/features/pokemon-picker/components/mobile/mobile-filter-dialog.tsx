"use client";

import { memo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MobilePokemonSearchFilters } from "@/features/pokemon";
import { useBackButtonDialog } from "@/hooks/use-back-button-dialog";
import type { UseFilterStateReturn } from "../../hooks/use-filter-state";

interface MobileFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: UseFilterStateReturn;
}

/**
 * Mobile filter dialog - bottom sheet with touch-friendly filters.
 */
export const MobileFilterDialog = memo(function MobileFilterDialog({
  isOpen,
  onClose,
  filterState,
}: MobileFilterDialogProps) {
  const { t } = useTranslation();
  useBackButtonDialog(isOpen, onClose);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="px-4 pb-8 pt-0 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="px-0 pt-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4" />
            {t("pokemonFilters.filters")}
          </SheetTitle>
        </SheetHeader>
        <MobilePokemonSearchFilters
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
      </SheetContent>
    </Sheet>
  );
});
