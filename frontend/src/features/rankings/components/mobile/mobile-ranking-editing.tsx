"use client";

import { memo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Search, Trash2, X, Save, ArrowLeft } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDndMonitor,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { usePokemonSearchContextOptional } from "@/features/pokemon-search/context/pokemon-search-context";
import { PokemonSearchOverlay } from "@/features/pokemon-search/components/pokemon-search-overlay";
import { PokemonDropzone, DraggablePokemonGallery } from "@/features/pokemon-picker";
import { PickerHeaderFilters } from "@/features/pokemon-picker/components/picker-header-filters";
import { MobileFilterDialog } from "@/features/pokemon-picker/components/mobile/mobile-filter-dialog";
import { useAllPokemon } from "@/features/pokemon-picker/hooks/use-all-pokemon";
import {
  MobileRankingTabBar,
  MOBILE_TAB_BAR_HEIGHT,
  type MobileRankingTab,
} from "./mobile-ranking-tab-bar";
import { MobileRankingTutorial } from "./mobile-ranking-tutorial";
import { MobileDropzoneEmptyState } from "./mobile-dropzone-empty-state";
import { useMobileRankingTutorial } from "./use-mobile-ranking-tutorial";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";
import { PokemonLoader } from "@/components/pokemon-loader";

interface MobileRankingEditingProps {
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

const HEADER_HEIGHT = 40;

/**
 * Mobile ranking editor with tab-based layout.
 * Tab 1: Ranking dropzone (full screen)
 * Tab 2: Pokemon picker (full screen)
 * Both tabs stay mounted to preserve scroll position.
 */
export const MobileRankingEditing = memo(function MobileRankingEditing({
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
}: MobileRankingEditingProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MobileRankingTab>("ranking");
  const [isPending, startTransition] = useTransition();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Wrap tab changes in transition to keep UI responsive
  const handleTabChange = (tab: MobileRankingTab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const searchContext = usePokemonSearchContextOptional();
  const isSearchEnabled = searchContext !== null;
  const isEditMode = onSave !== undefined || onDiscard !== undefined;

  // Tutorial state
  const { isOpen: isTutorialOpen, openTutorial, closeTutorial } = useMobileRankingTutorial();

  // Pokemon data for picker - use single useAllPokemon call for both data and filters
  const {
    pokemon: pickerPokemon,
    isLoading: pickerLoading,
    search,
    selectedTypes,
    generation,
    sortBy,
    order,
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
  } = useAllPokemon();

  // Compute filter state values
  const activeFilterCount = [
    search.length > 0,
    selectedTypes.length > 0,
    generation !== null,
    sortBy !== "pokedexNumber",
    order !== "asc",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    handleSearchChange("");
    handleTypesChange([]);
    handleGenerationChange(null);
    handleSortByChange("pokedexNumber");
    handleOrderChange("asc");
  };

  const filterState = {
    search,
    selectedTypes,
    generation,
    sortBy,
    order,
    activeFilterCount,
    handleSearchChange,
    handleTypesChange,
    handleGenerationChange,
    handleSortByChange,
    handleOrderChange,
    handleClearFilters,
  };

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

  // Calculate content height (full screen minus header and tab bar)
  const contentHeight = `calc(92dvh - ${HEADER_HEIGHT}px - ${MOBILE_TAB_BAR_HEIGHT}px)`;

  return (
    <DndContext sensors={sensors}>
      {/* Picker drag handler: auto-switch tab + drag overlay */}
      <PickerDragHandler
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pickerPokemon={pickerPokemon}
      />

      <div
        className="relative h-[85dvh]"
        style={{ paddingBottom: MOBILE_TAB_BAR_HEIGHT }}
      >
        {/* Ranking Tab */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-opacity duration-150",
            activeTab === "ranking"
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
            isPending && "opacity-70"
          )}
          style={{ paddingBottom: MOBILE_TAB_BAR_HEIGHT }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-1 border-b border-border/40 h-10 shrink-0">
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
                          <ArrowLeft className="h-4 w-4" />
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
              showScrollButton
              scrollButtonClassName="absolute"
              maxHeight={contentHeight}
              renderEmptyState={(isOver) => (
                <MobileDropzoneEmptyState
                  isOver={isOver}
                  onShowTutorial={openTutorial}
                  minHeight={contentHeight}
                />
              )}
            />
          </div>
        </div>

        {/* Picker Tab */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-opacity duration-150",
            activeTab === "picker"
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
            isPending && "opacity-70"
          )}
          style={{ paddingBottom: MOBILE_TAB_BAR_HEIGHT }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-1 border-b border-border/40 h-10 shrink-0">
            <h2 className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              {t("rankingView.pokemonBox", "Pokemon Box")}
            </h2>
            <PickerHeaderFilters
              activeFilterCount={filterState.activeFilterCount}
              onOpenFilters={() => setFiltersOpen(true)}
            />
          </div>

          {/* Picker content */}
          <div className="flex-1 min-h-0">
            {pickerLoading ? (
              <div className="space-y-4 p-4">
                <PokemonLoader size="lg" className="absolute bottom-0 top-0 left-0 w-full" />
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
              <DraggablePokemonGallery
                pokemon={pickerPokemon}
                disabledIds={disabledIds}
                filteredOutIds={filteredOutIds}
                maxColumns={5}
                height={contentHeight}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <MobileRankingTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Filter dialog */}
      <MobileFilterDialog
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filterState={filterState}
      />

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

      {/* Tutorial overlay */}
      <MobileRankingTutorial
        isOpen={isTutorialOpen}
        onComplete={closeTutorial}
      />
    </DndContext>
  );
});

/**
 * Internal component to handle drag auto-switch and picker drag overlay.
 * Must be inside DndContext to use useDndMonitor.
 */
function PickerDragHandler({
  activeTab,
  setActiveTab,
  pickerPokemon,
}: {
  activeTab: MobileRankingTab;
  setActiveTab: (tab: MobileRankingTab) => void;
  pickerPokemon: PokemonResponseDto[];
}) {
  const [activePickerPokemon, setActivePickerPokemon] =
    useState<PokemonResponseDto | null>(null);

  useDndMonitor({
    onDragStart(event) {
      const dragId = String(event.active.id);
      // Items from dropzone have "dropzone-" prefix, picker items don't
      const isFromPicker = !dragId.startsWith("dropzone-");

      if (isFromPicker) {
        // Track the pokemon being dragged from picker
        const pokemon = pickerPokemon.find((p) => p._id === dragId);
        if (pokemon) {
          setActivePickerPokemon(pokemon);
        }

        if (activeTab === "picker") {
          // Auto-switch to ranking tab when dragging from picker
          setActiveTab("ranking");
        }
      }
    },
    onDragEnd() {
      setActivePickerPokemon(null);
    },
    onDragCancel() {
      setActivePickerPokemon(null);
    },
  });

  return (
    <DragOverlay dropAnimation={null}>
      {activePickerPokemon && (
        <div className="cursor-grabbing animate-[lift_0.2s_ease-out_forwards]">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-xl bg-primary/30 blur-xl animate-pulse" />
            {/* Card with shadow */}
            <div className="relative rounded-lg shadow-2xl">
              <PokemonCard
                name={activePickerPokemon.name}
                image={activePickerPokemon.image}
                types={activePickerPokemon.types as PokemonType[]}
                isCompact
              />
            </div>
          </div>
        </div>
      )}
    </DragOverlay>
  );
}
