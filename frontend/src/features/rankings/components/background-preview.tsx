"use client";

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getThemeById, DEFAULT_THEME_ID } from "@pokeranking/shared";

interface BackgroundPreviewProps {
  background?: string;
  theme: string;
  className?: string;
}

function PokemonCardSkeleton({ rank }: { rank: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        {/* Rank badge */}
        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-white/95 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm z-10">
          {rank}
        </div>
        {/* Pokemon image placeholder */}
        <div className="w-12 h-12 rounded-lg bg-white/25 backdrop-blur-sm shadow-inner" />
      </div>
      {/* Pokemon name placeholder */}
      <div className="w-8 h-1.5 rounded-full bg-white/30" />
    </div>
  );
}

export const BackgroundPreview = memo(function BackgroundPreview({
  background,
  theme,
  className,
}: BackgroundPreviewProps) {
  const { t } = useTranslation();

  // Use background if set, otherwise fall back to card theme
  const effectiveTheme = background || theme;

  const themeData = useMemo(() => {
    const foundTheme = getThemeById(effectiveTheme ?? DEFAULT_THEME_ID);
    return foundTheme ?? getThemeById(DEFAULT_THEME_ID)!;
  }, [effectiveTheme]);

  return (
    <div className={className}>
      <h4 className="text-sm font-medium">
        {t("rankingForm.backgroundPreview")}
      </h4>
      <p className="text-sm text-muted-foreground mb-3">
        {t("rankingForm.backgroundPreviewDescription")}
      </p>
      <div className="flex justify-start mt-8">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl p-5 w-full shadow-xl",
            themeData.gradientClass
          )}
        >
          {/* Header area with title placeholder */}
          <div className="mb-5">
            <div className="w-28 h-3.5 rounded-full bg-white/30 mb-2" />
            <div className="w-16 h-2 rounded-full bg-white/20" />
          </div>

          {/* Pokemon grid with skeletons */}
          <div className="grid grid-cols-4 gap-x-3 gap-y-4 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => (
              <PokemonCardSkeleton key={rank} rank={rank} />
            ))}
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
});
