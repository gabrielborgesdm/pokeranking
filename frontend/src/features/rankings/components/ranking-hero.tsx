"use client";

import { PokemonImage } from "@/components/pokemon-image";
import { Button } from "@/components/ui/button";
import { PokemonDetailsDialog } from "@/features/pokemon/components/pokemon-details-dialog";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getThemeById } from "@pokeranking/shared";
import { Heart } from "lucide-react";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface RankingHeroProps {
  /** Ranking title */
  title: string;
  /** Username of the ranking owner */
  username: string;
  /** Top #1 Pokemon in the ranking */
  topPokemon?: { name: string; image: string; id?: string } | null;
  /** Total number of Pokemon in this ranking */
  pokemonCount: number;
  /** Theme ID for the background */
  theme?: string | null;
  /** Number of likes */
  likeCount: number;
  /** Whether current user has liked */
  isLiked: boolean;
  /** Whether current user is the owner */
  isOwner: boolean;
  /** Called when like button is clicked */
  onLikeClick?: () => void;
  /** Maximum width for content alignment */
  maxContentWidth?: number;
  /** Optional class name */
  className?: string;

  isAuthenticated?: boolean;
}

/**
 * RankingHero - Themed hero section for ranking view
 *
 * Displays the ranking's top Pokemon, title, owner info, and like button
 * with a themed gradient background based on the user's selected theme.
 */
export const RankingHero = memo(function RankingHero({
  title,
  username,
  topPokemon,
  pokemonCount,
  theme,
  likeCount,
  isLiked,
  isOwner,
  isAuthenticated,
  onLikeClick,
  maxContentWidth,
  className,
}: RankingHeroProps) {
  const { t } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Get theme data for styling
  const themeData = useMemo(() => {
    if (!theme) return null;
    return getThemeById(theme);
  }, [theme]);

  const gradientClass = themeData?.gradientClass ?? "gradient-type-fire";
  const textColor = themeData?.textColor ?? "#ffffff";
  const textShadow = themeData?.textShadow;

  return (
    <div
      className={cn(
        "relative mt-6 mx-auto rounded-lg py-8 sm:py-12 px-4 sm:px-6 overflow-hidden",
        gradientClass,
        className
      )}
      style={{
        maxWidth: maxContentWidth,
        color: textColor,
        textShadow: textShadow
      }}

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

      <div
        className="relative z-10 mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-6"
        style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
      >
        {/* Left section: Top Pokemon */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* Top Pokemon Image - falls back to "who.png" if no pokemon */}
          <div
            className={cn(
              "relative w-20 h-20 sm:w-32 sm:h-32",
              topPokemon?.id && "cursor-pokeball"
            )}
            onClick={() => topPokemon?.id && setIsDetailsOpen(true)}
          >
            <div className="relative w-full h-full">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-white/25 blur-xl" />
              <PokemonImage
                src={topPokemon?.image}
                alt={topPokemon?.name ?? "Pokemon"}
                fill
                className="drop-shadow-2xl relative z-10 transition-transform hover:scale-105"
                sizes="(max-width: 640px) 80px, 128px"
              />
            </div>
          </div>
        </div>

        {/* Center section: Title, username, pokemon count */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-xl sm:text-3xl font-bold truncate drop-shadow-md">
            {title}
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base opacity-90 mt-1">
            <Link
              href={routes.userRankings(username)}
              className="hover:underline font-medium"
            >
              @{username}
            </Link>
            <span>·</span>
            <span>
              {t("rankings.pokemonCount", { count: pokemonCount })}
            </span>
          </div>
        </div>

        {/* Right section: Like button (hidden for owner) */}
        {!isOwner && !!isAuthenticated && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="lg"
              onClick={onLikeClick}
              className={cn(
                "gap-2 hover:bg-white/15 text-lg",
                isLiked && "text-red-500"
              )}
            >
              <Heart
                className={cn("h-5 w-5 sm:h-6 sm:w-6", isLiked && "fill-current")} style={{ color: textColor }}
              />
              <span className="font-semibold" style={{ color: textColor }}>{likeCount}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Pokemon details dialog */}
      <PokemonDetailsDialog
        pokemonId={topPokemon?.id ?? null}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
});
