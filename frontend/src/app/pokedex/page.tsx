"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import {
  TypeEffectivenessCalculator,
  PokemonListSection,
} from "@/features/pokemon";
import { useAnalytics } from "@/hooks/use-analytics";
import { BackButton } from "@/components/back-button";
import { PageHeader } from "@/components/page-header";

export default function PokedexPage() {
  const { t } = useTranslation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("pokedex", "Pokedex");
  }, [trackPageView]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-8xl">
      <div className="space-y-8">
        {/* Header */}
        <BackButton />
        <PageHeader
          title={t("pokedex.title")}
          description={t("pokedex.description")}
        />

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
