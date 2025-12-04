"use client";

import Image from "next/image";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DEFAULT_POKEMON_IMAGE } from "@/lib/image-utils";
import { formatShortDate } from "@/lib/date-utils";
import { getThemeById, DEFAULT_THEME_ID } from "@pokeranking/shared";

interface RankingCardProps {
  title: string;
  topPokemonImage?: string;
  pokemonCount: number;
  createdAt: string;
  updatedAt: string;
  theme?: string;
  onClick?: () => void;
  className?: string;
}

export const RankingCard = memo(function RankingCard({
  title,
  topPokemonImage,
  pokemonCount,
  updatedAt,
  theme,
  onClick,
  className,
}: RankingCardProps) {
  const { t, i18n } = useTranslation();

  const formattedDate = useMemo(
    () => formatShortDate(updatedAt, i18n.language),
    [updatedAt, i18n.language]
  );

  // Get theme data, fallback to default if not found
  const themeData = useMemo(() => {
    const foundTheme = getThemeById(theme ?? DEFAULT_THEME_ID);
    return foundTheme ?? getThemeById(DEFAULT_THEME_ID)!;
  }, [theme]);

  // Use fallback silhouette image when ranking has no Pokemon
  const imageUrl = topPokemonImage || DEFAULT_POKEMON_IMAGE;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 min-w-[280px] shadow-lg transition-transform hover:scale-105",
        onClick && "hover:cursor-pointer",
        themeData.gradientClass,
        className
      )}
    >
      {/* Top Pokemon Image */}
      <div className="relative w-full aspect-square mb-4">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={cn(
            "object-contain drop-shadow-lg",
            !topPokemonImage && "opacity-60"
          )}
          sizes="(max-width: 768px) 50vw, 200px"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold truncate">{title}</h3>
        <div className="flex items-center justify-between text-sm opacity-80">
          <span>
            {t("myRankings.pokemonCount", { count: pokemonCount })}
          </span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
    </div>
  );
});
