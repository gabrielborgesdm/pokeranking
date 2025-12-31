"use client";

import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Trash2, X, Save } from "lucide-react";
import { DndContext, type SensorDescriptor, type SensorOptions } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { usePokemonSearchContextOptional } from "@/features/pokemon-search/context/pokemon-search-context";
import { PokemonSearchOverlay } from "@/features/pokemon-search/components/pokemon-search-overlay";
import { PokemonDropzone, PokemonPicker } from "@/features/pokemon-picker";
import { PickerHeaderFilters } from "@/features/pokemon-picker/components/picker-header-filters";
import { DesktopFilterPanel } from "@/features/pokemon-picker/components/desktop/desktop-filter-panel";
import { useAllPokemon } from "@/features/pokemon-picker/hooks/use-all-pokemon";
import { useFilterState } from "@/features/pokemon-picker/hooks/use-filter-state";
import { DesktopDropzoneEmptyState } from "./desktop-dropzone-empty-state";
import type { PokemonResponseDto } from "@pokeranking/api-client";

interface DesktopRankingEditingProps {
  pokemon: PokemonResponseDto[];
  setPokemon: (pokemon: PokemonResponseDto[]) => void;
  positionColors: Map<number, string>;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  sensors: SensorDescriptor<SensorOptions>[];
  filteredOutIds: string[];
  disabledIds: string[];
}

/**
 * Desktop ranking editor with two-column layout.
 * Left side: dropzone with ranked Pokemon
 * Right side: Pokemon picker with filter panel
 */
export const DesktopRankingEditing = memo(function DesktopRankingEditing({
  pokemon,
  setPokemon,
  positionColors,
  hasUnsavedChanges = false,
  isSaving = false,
  onSave,
  onDiscard,
  sensors,
  filteredOutIds,
  disabledIds,
}: DesktopRankingEditingProps) {
  const { t } = useTranslation();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchContext = usePokemonSearchContextOptional();
  const isSearchEnabled = searchContext !== null;
  const isEditMode = onSave !== undefined || onDiscard !== undefined;

  // Pokemon data for picker
  const { pokemon: pickerPokemon, isLoading: pickerLoading } = useAllPokemon();
  const filterState = useFilterState();

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
    <DndContext sensors={sensors}>
      <div className="grid gap-4 grid-cols-2">
        {/* Left: Dropzone section */}
        <div className="min-h-0 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-8 py-2 border-b border-border/40 h-[52px]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                {t("rankingView.yourRanking", "Your Ranking")}
              </h2>
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

          {/* Dropzone content */}
          <div className="flex-1 min-h-0">
            <PokemonDropzone
              id="ranking-pokemon"
              pokemon={pokemon}
              onChange={setPokemon}
              positionColors={positionColors}
              maxColumns={5}
              maxHeight="85vh"
              renderEmptyState={(isOver) => (
                <DesktopDropzoneEmptyState isOver={isOver} minHeight="85vh" />
              )}
            />
          </div>
        </div>

        {/* Right: Picker section */}
        <div className="min-h-0 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-8 py-2 border-b border-border/40 h-[52px]">
            <h2 className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              {t("rankingView.pokemonBox", "Pokemon Box")}
            </h2>
            <PickerHeaderFilters
              activeFilterCount={filterState.activeFilterCount}
              onOpenFilters={() => setFiltersOpen(true)}
            />
          </div>

          {/* Picker content */}
          <div className="flex-1 min-h-0 relative">
            {pickerLoading ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : pickerPokemon.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-muted-foreground">
                  {t("pokedex.pokemonList.noPokemon")}
                </p>
                {filterState.activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={filterState.handleClearFilters}
                    className="mt-4 text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("pokemonFilters.clearFilters")}
                  </Button>
                )}
              </div>
            ) : (
              <PokemonPicker
                pokemon={pickerPokemon}
                mode="drag"
                disabledIds={disabledIds}
                filteredOutIds={filteredOutIds}
                maxColumns={5}
                height="85vh"
              />
            )}

            {/* Filter panel */}
            <DesktopFilterPanel
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              filterState={filterState}
            />
          </div>
        </div>
      </div>

      {/* Search overlay */}
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
    </DndContext>
  );
});
