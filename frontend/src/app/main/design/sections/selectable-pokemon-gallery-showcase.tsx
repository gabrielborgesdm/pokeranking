"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SelectablePokemonGallery } from "@/features/pokemon-picker";
import { Button } from "@/components/ui/button";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import type { PokemonType } from "@/lib/pokemon-types";

export function SelectablePokemonGalleryShowcase() {
  const { t } = useTranslation();
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonResponseDto | null>(null);

  const handleSelect = useCallback((poke: PokemonResponseDto | null) => {
    setSelectedPokemon(poke);
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedPokemon(null);
  }, []);

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t("design.sections.selectableGallery.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("design.sections.selectableGallery.description")}
        </p>
      </div>

      {/* Selected Pokemon Display */}
      {selectedPokemon && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {t("design.sections.selectableGallery.selectedPokemon")}
            </h4>
            <Button variant="ghost" size="sm" onClick={handleDeselect}>
              {t("design.sections.selectableGallery.deselect")}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <PokemonCard
                name={selectedPokemon.name}
                image={selectedPokemon.image}
                types={selectedPokemon.types as PokemonType[]}
                isCompact
              />
            </div>
            <div>
              <p className="font-semibold text-lg">{selectedPokemon.name}</p>
              <p className="text-sm text-muted-foreground">
                #{selectedPokemon.pokedexNumber?.toString().padStart(3, '0')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selectable Pokemon Gallery */}
      <SelectablePokemonGallery
        selectedPokemon={selectedPokemon}
        onSelect={handleSelect}
        maxColumns={4}
        height={500}
      />
    </section>
  );
}
