"use client";

import { memo, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
  onClick?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const RankingCard = memo(function RankingCard({
  id,
  title,
  topPokemonImage,
  pokemonCount,
  updatedAt,
  theme,
  onClick,
  onEdit,
  onDelete,
  className,
}: RankingCardProps) {
  const { t, i18n } = useTranslation();
  const showActions = id && (onEdit || onDelete);

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
        <PokemonImage
          src={topPokemonImage}
          alt={title}
          fill
          className={cn("drop-shadow-lg", !topPokemonImage && "opacity-60")}
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

      {/* Actions Dropdown */}
      {showActions && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-black/20 hover:bg-black/40 text-white"
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
      )}
    </div>
  );
});
