"use client";

import { memo, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MoreVertical, Pencil, Trash2, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { PokemonImage } from "@/components/pokemon-image";
import { formatShortDate } from "@/lib/date-utils";
import { getThemeById, DEFAULT_THEME_ID } from "@pokeranking/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RankingCardProps {
  id?: string;
  title: string;
  topPokemonImage?: string;
  pokemonCount: number;
  createdAt: string;
  updatedAt: string;
  theme?: string;
  /** Like count (for public list view) */
  likesCount?: number;
  /** Username of the ranking owner (for public list view) */
  username?: string;
  onClick?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  shouldHighlight?: boolean;
}

export const RankingCard = memo(function RankingCard({
  id,
  title,
  topPokemonImage,
  pokemonCount,
  updatedAt,
  theme,
  likesCount,
  username,
  onClick,
  onEdit,
  onDelete,
  className,
  shouldHighlight = false,
}: RankingCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const showActions = id && (onEdit || onDelete);

  const handleUsernameClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (username) {
        router.push(routes.userRankings(username));
      }
    },
    [router, username]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (id && onEdit) onEdit(id);
    },
    [id, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (id && onDelete) onDelete(id);
    },
    [id, onDelete]
  );

  const formattedDate = useMemo(
    () => formatShortDate(updatedAt, i18n.language),
    [updatedAt, i18n.language]
  );

  // Get theme data, fallback to default if not found
  const themeData = useMemo(() => {
    const foundTheme = getThemeById(theme ?? DEFAULT_THEME_ID);
    return foundTheme ?? getThemeById(DEFAULT_THEME_ID)!;
  }, [theme]);

  const getCardTextStyle = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (themeData.cardTextColor) {
      styles.color = themeData.cardTextColor;
    }
    else {
      styles.textShadow = themeData.textShadow;
      styles.color = themeData.textColor;
    }
    return styles;
  }

  // Determine if text is light or dark based on color value for decorative elements
  const isLightText = useMemo(() => {
    const color = themeData.textColor.toLowerCase();
    // Check if it's a light color (white or light grays/colors)
    if (color === "#ffffff" || color === "#fff") return true;
    // Check luminance for other colors - simple heuristic
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    }
    return true; // Default to light
  }, [themeData.textColor]);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-3 sm:p-6 min-w-0 shadow-lg transition-transform hover:scale-105 select-none",
        onClick && "hover:cursor-pointer",
        themeData.gradientClass,
        className
      )}
      style={getCardTextStyle()}
    >
      {/* Top Pokemon Image */}
      <div className="relative w-full aspect-square mb-4">
        <PokemonImage
          src={topPokemonImage}
          alt={title}
          fill
          className={cn("drop-shadow-lg", !topPokemonImage && "opacity-60")}
          sizes="(max-width: 768px) 50vw, 200px"
          shouldHighlight={shouldHighlight}
        />
      </div>

      {/* Content */}
      <div className="space-y-2 min-w-0">
        <h3
          className="text-xl font-bold truncate"
          style={getCardTextStyle()}
        >
          {title}
        </h3>
        {username && (
          <button
            onClick={handleUsernameClick}
            className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100 hover:underline transition-opacity min-w-0 w-full"
            style={getCardTextStyle()}
          >
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{username}</span>
          </button>
        )}
        <div
          className="flex items-center justify-between sm:text-sm opacity-80"
          style={getCardTextStyle()}
        >
          <span>
            <span className="sm:hidden">{pokemonCount} PK</span>
            <span className="hidden sm:inline">
              {t("myRankings.pokemonCount", { count: pokemonCount })}
            </span>
          </span>
          {likesCount !== undefined ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Heart className="h-3 w-3" />
              <span>{likesCount}</span>
            </div>
          ) : (
            <span className="hidden sm:inline flex-shrink-0">{formattedDate}</span>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        className={cn(
          "absolute -top-8 -right-8 w-24 h-24 rounded-full",
          isLightText ? "bg-white/10" : "bg-black/10"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-4 -left-4 w-16 h-16 rounded-full",
          isLightText ? "bg-white/5" : "bg-black/5"
        )}
      />

      {/* Actions Dropdown */}
      {
        showActions && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    isLightText
                      ? "bg-black/20 hover:bg-black/40 text-white"
                      : "bg-white/40 hover:bg-white/60 text-foreground"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">{t("common.actions")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("myRankings.edit")}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("myRankings.delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    </div >
  );
});
