"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAllPokemon } from "../hooks/use-all-pokemon";
import { PokemonPickerGrid } from "./pokemon-picker-grid";
import { PokemonLoader } from "@/components/pokemon-loader";
import { EmptyPokemonCard } from "@/features/pokemon/empty-pokemon-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { PokemonResponseDto } from "@pokeranking/api-client";

export interface SelectablePokemonGalleryProps {
  /**
   * Callback when a Pokemon is selected or deselected
   */
  onSelect?: (pokemon: PokemonResponseDto | null) => void;
  /**
   * Externally controlled selected Pokemon
   */
  selectedPokemon?: PokemonResponseDto | null;
  /**
   * Maximum number of columns in the grid
   * @default 4
   */
  maxColumns?: number;
  /**
   * Height of the grid container
   * @default 500
   */
  height?: number | string;
  /**
   * Additional className for the grid container
   */
  className?: string;
  /**
   * Custom search value (for controlled component)
   */
  search?: string;
  /**
   * Search change handler (for controlled component)
   */
  onSearchChange?: (search: string) => void;
  /**
   * Show search input
   * @default true
   */
  showSearch?: boolean;
}

export function SelectablePokemonGallery({
  onSelect,
  selectedPokemon: externalSelectedPokemon,
  maxColumns = 4,
  height = 500,
  className = "border rounded-lg p-4",
  search: externalSearch,
  onSearchChange: externalOnSearchChange,
  showSearch = true,
}: SelectablePokemonGalleryProps) {
  const { t } = useTranslation();
  const { isResizing } = useScreenSize();

  // Internal state for uncontrolled mode
  const [internalSelectedPokemon, setInternalSelectedPokemon] = useState<PokemonResponseDto | null>(null);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = externalSelectedPokemon !== undefined;
  const selectedPokemon = isControlled ? externalSelectedPokemon : internalSelectedPokemon;

  const {
    pokemon,
    isLoading,
    search,
    handleSearchChange,
  } = useAllPokemon();

  // Use external search if provided
  const currentSearch = externalSearch !== undefined ? externalSearch : search;
  const currentHandleSearchChange = externalOnSearchChange !== undefined ? externalOnSearchChange : handleSearchChange;

  const handleSelect = useCallback((poke: PokemonResponseDto | null) => {
    if (!isControlled) {
      setInternalSelectedPokemon(poke);
    }
    onSelect?.(poke);
  }, [isControlled, onSelect]);


  if (isResizing) {
    return (<div className={className + " flex items-center justify-center h-[60vh]"}>
      <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
    </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      {showSearch && (
        <div className="space-y-2">
          <Label htmlFor="pokemon-gallery-search">
            {t("pokemonPicker.selectableGallery.searchLabel")}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="pokemon-gallery-search"
              value={currentSearch}
              onChange={(e) => currentHandleSearchChange(e.target.value)}
              placeholder={t("pokemonPicker.selectableGallery.searchPlaceholder")}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={className} style={{ height }}>
          <PokemonLoader size="lg" className="h-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pokemon.length === 0 && (
        <EmptyPokemonCard
          message={currentSearch ? t("pokemonPicker.selectableGallery.noResults") : t("pokemonPicker.selectableGallery.noPokemon")}
          showAction={false}
          className="py-8"
        />
      )}

      {/* Pokemon Grid with Resizing Overlay */}
      {!isLoading && pokemon.length > 0 && (
        <div className="relative">


          <PokemonPickerGrid
            pokemon={pokemon}
            selectedId={selectedPokemon?._id}
            onSelect={handleSelect}
            maxColumns={maxColumns}
            height={height}
            className={className}
          />
        </div>
      )}
    </div>
  );
}
