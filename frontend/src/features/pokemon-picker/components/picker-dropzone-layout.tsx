"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Trash2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { usePokemonSearchContextOptional } from "@/features/pokemon-search/context/pokemon-search-context";
import { PokemonSearchOverlay } from "@/features/pokemon-search/components/pokemon-search-overlay";
import { PickerHeaderFilters } from "./picker-header-filters";

interface PickerDropzoneLayoutProps {
  dropzone: React.ReactNode;
  picker: React.ReactNode;
  /** Number of active filters to show on badge */
  activeFilterCount?: number;
  /** Called when filter button is clicked */
  onOpenFilters?: () => void;
  /** Whether there are unsaved changes (shows indicator + enables save) */
  hasUnsavedChanges?: boolean;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Called when save button is clicked */
  onSave?: () => void;
  /** Called when discard is confirmed */
  onDiscard?: () => void;
  className?: string;
}

/**
 * Responsive layout for PokemonDropzone and PokemonPicker.
 * - Desktop (md+): Two-column grid with dropzone left, picker right
 * - Mobile: Full-width stacked sections
 * - Includes section headers with search for ranking Pokemon
 */
export function PickerDropzoneLayout({
  dropzone,
  picker,
  activeFilterCount = 0,
  onOpenFilters,
  hasUnsavedChanges = false,
  isSaving = false,
  onSave,
  onDiscard,
  className,
}: PickerDropzoneLayoutProps) {
  const { t } = useTranslation();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const searchContext = usePokemonSearchContextOptional();
  const isSearchEnabled = searchContext !== null;
  const isEditMode = onSave !== undefined || onDiscard !== undefined;

  const handleDiscardClick = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      onDiscard?.();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    onDiscard?.();
  };

  return (
    <>
      <div
        className={cn(
          "grid gap-4",
          // Mobile: single column, auto rows that fit content
          "grid-cols-1 auto-rows-min",
          // Desktop: two equal columns, single row
          "md:grid-cols-2 md:grid-rows-1",
          className
        )}
      >
        {/* Dropzone - left on desktop, top on mobile */}
        <div className="min-h-0 overflow-hidden max-h-[45dvh] md:max-h-none flex flex-col">
          {/* Section header with search and edit controls */}
          <div className="flex items-center justify-between gap-3 px-4 py-1 md:px-8 md:py-2 border-b border-border/40 h-10 md:h-[52px]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                {t("rankingView.yourRanking", "Your Ranking")}
              </h2>
              {/* Unsaved changes indicator */}
              {isEditMode && hasUnsavedChanges && (
                <span className="text-xs text-amber-500 whitespace-nowrap">
                  {t("rankingView.unsavedChanges", "Unsaved changes")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!isSearchEnabled}
                    onClick={isSearchEnabled ? searchContext?.openSearch : undefined}
                    className="h-8 w-8"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("rankingView.searchPokemon", "Search Pokemon")}
                </TooltipContent>
              </Tooltip>

              {/* Edit mode controls */}
              {isEditMode && (
                <>
                  {/* Discard button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDiscardClick}
                        disabled={isSaving}
                        className="h-8 w-8"
                      >
                        {hasUnsavedChanges ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {hasUnsavedChanges
                        ? t("rankingView.discardChanges", "Discard changes")
                        : t("rankingView.close", "Close")}
                    </TooltipContent>
                  </Tooltip>

                  {/* Save button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={onSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="h-8 w-8"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t("rankingView.saveChanges", "Save changes")}
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0">{dropzone}</div>
        </div>

        {/* Picker - right on desktop, bottom on mobile */}
        <div className="min-h-0 overflow-hidden max-h-[40dvh] md:max-h-none flex flex-col">
          {/* Section header with filter button */}
          <div className="flex items-center justify-between gap-3 px-4 py-1 md:px-8 md:py-2 border-b border-border/40 h-10 md:h-[52px]">
            <h2 className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              {t("rankingView.pokemonBox", "Pokemon Box")}
            </h2>
            {onOpenFilters && (
              <PickerHeaderFilters
                activeFilterCount={activeFilterCount}
                onOpenFilters={onOpenFilters}
              />
            )}
          </div>
          <div className="flex-1 min-h-0">{picker}</div>
        </div>
      </div>

      {/* Search overlay dialog */}
      {isSearchEnabled && <PokemonSearchOverlay />}

      {/* Discard confirmation dialog */}
      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title={t("rankingView.discardConfirmTitle")}
        description={t("rankingView.discardConfirmDescription")}
        confirmLabel={t("rankingView.discardChanges")}
        variant="destructive"
        onConfirm={handleConfirmDiscard}
      />
    </>
  );
}
