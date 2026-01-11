"use client";

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThemeById, DEFAULT_THEME_ID } from "@pokeranking/shared";
import { PokemonImage } from "@/components/pokemon-image";

interface BackgroundPreviewProps {
  background?: string;
  theme: string;
  className?: string;
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
      <div className="flex justify-start mt-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl py-8 sm:py-10 px-5 w-full shadow-xl",
            themeData.gradientClass
          )}
        >
          {/* Flowing wave decoration */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 200"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background wave layers */}
            <path
              d="M0,120 C150,180 350,60 600,100 C850,140 1050,40 1200,80 L1200,200 L0,200 Z"
              fill="rgba(0,0,0,0.08)"
            />
            <path
              d="M0,140 C200,100 400,160 650,120 C900,80 1100,140 1200,100 L1200,200 L0,200 Z"
              fill="rgba(0,0,0,0.06)"
            />
            <path
              d="M0,160 C250,130 450,180 700,150 C950,120 1150,170 1200,140 L1200,200 L0,200 Z"
              fill="rgba(0,0,0,0.04)"
            />

            {/* Sparkle/star elements */}
            <circle cx="85%" cy="25%" r="2" fill="rgba(255,255,255,0.6)" />
            <circle cx="90%" cy="40%" r="1.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="80%" cy="55%" r="1" fill="rgba(255,255,255,0.3)" />
            <circle cx="92%" cy="65%" r="1.5" fill="rgba(255,255,255,0.5)" />
            <circle cx="75%" cy="35%" r="1" fill="rgba(255,255,255,0.25)" />
          </svg>

          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-black/10" />

          {/* Hero content - mimics RankingHero layout */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            {/* Left section: Pokemon image placeholder */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <div className="absolute inset-0 rounded-full bg-white/25 blur-lg" />
                <PokemonImage
                  src={undefined}
                  alt="Pokemon"
                  fill
                  className="drop-shadow-xl relative z-10"
                  sizes="80px"
                />
              </div>
            </div>

            {/* Center section: Title and info placeholders */}
            <div className="flex-1 min-w-0">
              <div className="w-32 sm:w-40 h-5 sm:h-6 rounded-full bg-white/30 mb-2" />
              <div className={cn("flex items-center gap-2")}>
                <div className="w-16 sm:w-20 h-3 rounded-full bg-white/20" />
                <span className="text-white/40">·</span>
                <div className="w-20 sm:w-24 h-3 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Right section: Like button placeholder */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10">
              <Heart className="h-4 w-4 text-white/60" />
              <span className="text-sm font-medium text-white/60">42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
