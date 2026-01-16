"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { RankingCard } from "./ranking-card";
import { cn } from "@/lib/utils";

interface CardThemePreviewProps {
  title: string;
  theme: string;
  topPokemonImage?: string;
  pokemonCount?: number;
  className?: string;
}

export const CardThemePreview = memo(function CardThemePreview({
  title,
  theme,
  topPokemonImage,
  pokemonCount = 0,
  className,
}: CardThemePreviewProps) {
  const { t } = useTranslation();
  const now = new Date().toISOString();


  return (
    <div className={className}>
      <h4 className="text-sm font-medium">
        {t("rankingForm.cardPreview")}
      </h4>
      <p className="text-sm text-muted-foreground mb-3">
        {t("rankingForm.cardPreviewDescription")}
      </p>
      <div className="flex justify-center lg:justify-center lg:mt-14">
        <RankingCard
          title={title || t("rankingForm.titlePlaceholder")}
          topPokemonImage={topPokemonImage}
          pokemonCount={pokemonCount}
          createdAt={now}
          updatedAt={now}
          theme={theme}
          className={cn("w-48 sm:w-60 lg:w-72")}
          shouldHighlight={pokemonCount === 0}
        />
      </div>
    </div>
  );
});
