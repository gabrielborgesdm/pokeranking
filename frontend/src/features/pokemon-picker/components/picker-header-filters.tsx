"use client";

import { memo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PickerHeaderFiltersProps {
  /** Number of active filters (excluding defaults) */
  activeFilterCount: number;
  /** Callback to open the filters dialog/sheet */
  onOpenFilters: () => void;
}

/**
 * Compact filter button for the picker header.
 * Opens a dialog/sheet with full filter controls.
 * Used for both mobile and desktop.
 */
export const PickerHeaderFilters = memo(function PickerHeaderFilters({
  activeFilterCount,
  onOpenFilters,
}: PickerHeaderFiltersProps) {
  return (
    <Button
      variant={activeFilterCount > 0 ? "secondary" : "ghost"}
      size="icon"
      className="h-8 w-8 relative"
      onClick={onOpenFilters}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {activeFilterCount > 0 && (
        <Badge
          variant="default"
          className="absolute -top-1 -right-1 h-4 w-4 p-0 justify-center text-[10px]"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
});
