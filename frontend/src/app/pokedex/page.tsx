"use client";

import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import {
  TypeEffectivenessCalculator,
  PokemonListSection,
} from "@/features/pokemon";

export default function PokedexPage() {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("pokedex.title")}</h1>
            <p className="text-muted-foreground">{t("pokedex.description")}</p>
          </div>
        </div>

        {/* Type Effectiveness Calculator */}
        <TypeEffectivenessCalculator />

        {/* Pokemon List Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("pokedex.pokemonList.title")}</h2>
          <PokemonListSection />
        </div>
      </div>
    </main>
  );
}
