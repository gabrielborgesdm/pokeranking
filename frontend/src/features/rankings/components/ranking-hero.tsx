"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PokemonImage } from "@/components/pokemon-image";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getThemeById } from "@pokeranking/shared";

interface RankingHeroProps {
  /** Ranking title */
  title: string;
  /** Username of the ranking owner */
  username: string;
  /** Top #1 Pokemon in the ranking */
  topPokemon?: { name: string; image: string } | null;
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
  onLikeClick,
  maxContentWidth,
  className,
}: RankingHeroProps) {
  const { t } = useTranslation();

  // Get theme data for styling
  const themeData = useMemo(() => {
    if (!theme) return null;
    return getThemeById(theme);
  }, [theme]);

  const gradientClass = themeData?.gradientClass ?? "gradient-type-normal";

  return (
    <div
      className={cn(
        "mx-4 mt-4 rounded-2xl p-6",
        gradientClass,
        className
      )}
    >
      <div
        className="mx-auto flex items-center justify-between gap-4"
        style={maxContentWidth ? { maxWidth: maxContentWidth } : undefined}
      >
        {/* Left section: Top Pokemon */}
        <div className="flex flex-col items-center gap-2">
          {/* Top Pokemon Image - falls back to "who.png" if no pokemon */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <div className="relative w-full h-full">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
              <PokemonImage
                src={topPokemon?.image}
                alt={topPokemon?.name ?? "Pokemon"}
                fill
                className="drop-shadow-lg relative z-10 transition-transform hover:scale-105"
                sizes="96px"
              />
            </div>
          </div>
        </div>

        {/* Center section: Title, username, pokemon count */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {title}
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm opacity-80">
            <Link
              href={routes.userRankings(username)}
              className="hover:underline"
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
        {!isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLikeClick}
              className={cn(
                "gap-1.5 hover:bg-white/10",
                isLiked && "text-red-500"
              )}
            >
              <Heart
                className={cn("h-5 w-5", isLiked && "fill-current")}
              />
              <span className="font-medium">{likeCount}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
