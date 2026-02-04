"use client";

import { PageHeader } from "@/components/page-header";
import { PokedexInstallPrompt } from "@/components/pokedex-install-prompt";
import {
  PokemonListSection,
  TypeEffectivenessCalculator,
} from "@/features/pokemon";
import { useAnalytics } from "@/hooks/use-analytics";
import { useIsPwa } from "@/hooks/use-is-pwa";
import { routes } from "@/lib/routes";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PokedexPage() {
  const { t } = useTranslation();
  const { trackPageView } = useAnalytics();
  const { isPokedexPwa } = useIsPwa();

  useEffect(() => {
    trackPageView("pokedex", "Pokedex");
  }, [trackPageView]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-8xl">
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title={t("pokedex.title")}
          description={t("pokedex.description")}
          backHref={isPokedexPwa ? undefined : routes.home}
        />

        {/* Type Effectiveness Calculator */}
        <TypeEffectivenessCalculator />

        {/* Pokemon List Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("pokedex.pokemonList.title")}</h2>
          <PokemonListSection />
        </div>
      </div>
      <PokedexInstallPrompt />
    </main>
  );
}
