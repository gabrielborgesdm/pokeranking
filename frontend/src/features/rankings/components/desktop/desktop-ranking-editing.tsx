"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PokemonDropzone, DraggablePokemonGallery } from "@/features/pokemon-picker";
import { Badge } from "@/components/ui/badge";
import { DesktopFilterPanel } from "@/features/pokemon-picker/components/desktop/desktop-filter-panel";
import { useAllPokemon } from "@/features/pokemon-picker/hooks/use-all-pokemon";
import type { UseFilterStateReturn } from "@/features/pokemon-picker/hooks/use-filter-state";
import { PokemonSearchOverlay } from "@/features/pokemon-search/components/pokemon-search-overlay";
import { usePokemonSearchContextOptional } from "@/features/pokemon-search/context/pokemon-search-context";
import { DndContext, type SensorDescriptor, type SensorOptions } from "@dnd-kit/core";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DesktopDropzoneEmptyState } from "./desktop-dropzone-empty-state";
import { PokemonLoader } from "@/components/pokemon-loader";
import { LoadingFallback } from "@/components/loading-fallback";
import { useRankingEditDesktopLayout } from "../../hooks/use-ranking-edit-desktop-layout";
import { cn } from "@/lib/utils";

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
  const { sizing, isResizing } = useRankingEditDesktopLayout();

  const searchContext = usePokemonSearchContextOptional();
  const isSearchEnabled = searchContext !== null;
  const isEditMode = onSave !== undefined || onDiscard !== undefined;

  // Pokemon data for picker - using single hook instance for both data and filter state
  const allPokemonHook = useAllPokemon();
  const { pokemon: pickerPokemon, isLoading: pickerLoading } = allPokemonHook;

  // Create filter state object from the hook
  const filterState: UseFilterStateReturn = useMemo(() => {
    const activeFilterCount = [
      allPokemonHook.search.length > 0,
      allPokemonHook.selectedTypes.length > 0,
      allPokemonHook.generation !== null,
      allPokemonHook.sortBy !== "pokedexNumber",
      allPokemonHook.order !== "asc",
    ].filter(Boolean).length;

    return {
      search: allPokemonHook.search,
      selectedTypes: allPokemonHook.selectedTypes,
      generation: allPokemonHook.generation,
      sortBy: allPokemonHook.sortBy,
      order: allPokemonHook.order,
      activeFilterCount,
      handleSearchChange: allPokemonHook.handleSearchChange,
      handleTypesChange: allPokemonHook.handleTypesChange,
      handleGenerationChange: allPokemonHook.handleGenerationChange,
      handleSortByChange: allPokemonHook.handleSortByChange,
      handleOrderChange: allPokemonHook.handleOrderChange,
      handleClearFilters: () => {
        allPokemonHook.handleSearchChange("");
        allPokemonHook.handleTypesChange([]);
        allPokemonHook.handleGenerationChange(null);
        allPokemonHook.handleSortByChange("pokedexNumber");
        allPokemonHook.handleOrderChange("asc");
      },
    };
  }, [allPokemonHook]);

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
      <div className={cn("grid grid-cols-2", sizing.styles.gridGap)}>
        {/* Left: Dropzone section */}
        <div className="min-h-0 overflow-hidden flex flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between gap-3 border-b border-border/40",
            sizing.layout.headerPaddingX,
            sizing.layout.headerPaddingY,
            sizing.layout.headerHeight
          )}>
            <div className="flex items-center gap-2">
              <h2 className={cn("font-semibold text-muted-foreground whitespace-nowrap", sizing.styles.headerTitleSize)}>
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
                    className={sizing.styles.iconButtonSize}
                  >
                    <Search className={sizing.styles.iconSize} />
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
                        className={sizing.styles.iconButtonSize}
                      >
                        {hasUnsavedChanges ? (
                          <Trash2 className={sizing.styles.iconSize} />
                        ) : (
                          <ArrowLeft className={sizing.styles.iconSize} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {hasUnsavedChanges
                        ? t("rankingView.discardChanges", "Discard changes")
                        : t("rankingView.back", "Back")}
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
                        className={sizing.styles.iconButtonSize}
                      >
                        <Save className={sizing.styles.iconSize} />
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
            {isResizing ? (
              <LoadingFallback />
            ) : (
              <PokemonDropzone
                id="ranking-pokemon"
                pokemon={pokemon}
                onChange={setPokemon}
                positionColors={positionColors}
                maxColumns={sizing.grid.maxColumns}
                minCardWidth={sizing.grid.minCardWidth}
                rowHeight={sizing.grid.rowHeight}
                maxHeight={sizing.layout.contentHeight}
                showScrollButton={true}
                scrollButtonClassName="bottom-8 right-8 absolute"
                renderEmptyState={(isOver) => (
                  <DesktopDropzoneEmptyState isOver={isOver} minHeight={sizing.layout.contentHeight} />
                )}
              />
            )}
          </div>
        </div>

        {/* Right: Picker section */}
        <div className="min-h-0 overflow-hidden flex flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-3 border-b border-border/40",
            sizing.layout.headerPaddingX,
            sizing.layout.headerPaddingY,
            sizing.layout.headerHeight
          )}>
            <h2 className={cn("font-semibold text-muted-foreground whitespace-nowrap", sizing.styles.headerTitleSize)}>
              {t("rankingView.pokemonBox", "Pokemon Box")}
            </h2>

            <div className="relative flex-1 min-w-0 max-w-sm ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("pokemonFilters.searchInBox", "Search in the Pokemon Box...")}
                value={filterState.search}
                onChange={(e) => filterState.handleSearchChange(e.target.value)}
                className="pl-8 h-8 w-full"
                size={1}
              />
            </div>
            <Button
              variant={filterState.activeFilterCount > 0 ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("pokemonFilters.additionalFilters", "Additional Filters")}
              {filterState.activeFilterCount > 0 && (
                <Badge
                  variant="default"
                  className="h-5 w-5 p-0 justify-center text-[10px]"
                >
                  {filterState.activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Picker content */}
          <div className="flex-1 min-h-0 relative">
            {isResizing ? (
              <LoadingFallback />
            ) : pickerLoading ? (
              <PokemonLoader size="lg" className="h-full w-full" />
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
              <DraggablePokemonGallery
                pokemon={pickerPokemon}
                disabledIds={disabledIds}
                filteredOutIds={filteredOutIds}
                maxColumns={sizing.grid.maxColumns}
                minCardWidth={sizing.grid.minCardWidth}
                rowHeight={sizing.grid.rowHeight}
                height={sizing.layout.contentHeight}
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
