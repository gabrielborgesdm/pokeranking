"use client";

import { memo, useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { PokemonType } from "@pokeranking/shared";
import { PokemonSearchFilters } from "./pokemon-search-filters";
import { PokemonCard } from "./pokemon-card";
import { PokemonCardSkeleton } from "./pokemon-card-skeleton";
import { PokemonDetailsDialog } from "./pokemon-details-dialog";
import { EmptyPokemonCard } from "../empty-pokemon-card";
import { Pagination } from "@/components/pagination";
import { useAllPokemon } from "@/features/pokemon-picker/hooks/use-all-pokemon";
import { useAnalytics } from "@/hooks/use-analytics";

const ITEMS_PER_PAGE = 24;

export const PokemonListSection = memo(function PokemonListSection() {
  const { t } = useTranslation();
  const [selectedPokemon, setSelectedPokemon] = useState<typeof pokemon[0] | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [gridRef, setGridRef] = useState<HTMLDivElement | null>(null);
  const { trackPokemonDetailsView, trackPokedexFilterChange, trackPaginationChange } = useAnalytics();

  const {
    pokemon,
    isLoading,
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTypes, generation, sortBy, order]);

  // Track filter changes
  useEffect(() => {
    if (selectedTypes.length > 0 || generation || sortBy !== "pokedexNumber") {
      trackPokedexFilterChange({
        types: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        generation: generation ? String(generation) : undefined,
        sort_by: sortBy !== "pokedexNumber" ? sortBy : undefined,
      });
    }
  }, [selectedTypes, generation, sortBy, trackPokedexFilterChange]);

  const totalPages = Math.ceil(pokemon.length / ITEMS_PER_PAGE);

  const paginatedPokemon = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return pokemon.slice(start, end);
  }, [pokemon, currentPage]);

  const handlePokemonClick = useCallback((pokemonItem: typeof pokemon[0]) => {
    setSelectedPokemon(pokemonItem);
    trackPokemonDetailsView(pokemonItem._id, pokemonItem.name);
  }, [trackPokemonDetailsView]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    gridRef?.scrollIntoView({ behavior: "smooth", block: "start" });
    trackPaginationChange("pokedex", page);
  }, [trackPaginationChange, gridRef]);

  const handleSearchEnter = useCallback(() => {
    if (gridRef && paginatedPokemon.length > 0) {
      // Scroll to the grid with smooth behavior
      gridRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [gridRef, paginatedPokemon.length]);

  return (
    <div className="space-y-6">
      <PokemonSearchFilters
        search={search}
        selectedTypes={selectedTypes}
        generation={generation}
        sortBy={sortBy}
        order={order}
        onSearchChange={handleSearchChange}
        onTypesChange={handleTypesChange}
        onGenerationChange={handleGenerationChange}
        onSortByChange={handleSortByChange}
        onOrderChange={handleOrderChange}
        onSearchEnter={handleSearchEnter}
      />

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("pokedex.pokemonList.resultsCount", { count: pokemon.length })}
        </p>
      )}

      {/* Pokemon Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <PokemonCardSkeleton key={i} showPositionBadge={false} />
          ))}
        </div>
      ) : pokemon.length === 0 ? (
        <EmptyPokemonCard
          message={t("pokedex.pokemonList.noPokemon")}
          showAction={false}
        />
      ) : (
        <div
          ref={setGridRef}
          className="scroll-mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {paginatedPokemon.map((p) => (
            <PokemonCard
              key={p._id}
              name={p.name}
              image={p.image}
              types={p.types as PokemonType[]}
              onClick={() => handlePokemonClick(p)}
              className="min-w-0"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pokemon.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Pokemon Details Dialog */}
      <PokemonDetailsDialog
        pokemon={selectedPokemon}
        open={!!selectedPokemon}
        onOpenChange={(open) => !open && setSelectedPokemon(null)}
      />
    </div>
  );
});
