"use client";

import { memo, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PokemonType } from "@pokeranking/shared";
import { POKEMON_TYPE_VALUES, getPokemonTypeColor } from "@/lib/pokemon-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface TypesSelectorProps {
  selectedTypes: PokemonType[];
  onTypesChange: (types: PokemonType[]) => void;
  disabled?: boolean;
  showClearButton?: boolean;
  compact?: boolean;
  className?: string;
  /** Custom button label. If not provided, uses default based on compact prop */
  buttonLabel?: string;
  /** Custom class name for the trigger button */
  buttonClassName?: string;
}

export const TypesSelector = memo(function TypesSelector({
  selectedTypes,
  onTypesChange,
  disabled,
  showClearButton = true,
  compact = false,
  className,
  buttonLabel,
  buttonClassName,
}: TypesSelectorProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(POKEMON_TYPE_VALUES.length / ITEMS_PER_PAGE);
  const paginatedTypes = POKEMON_TYPE_VALUES.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const handleTypeToggle = (type: PokemonType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const clearTypes = () => {
    onTypesChange([]);
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            disabled={disabled}
            className={buttonClassName ?? (compact ? "h-7 text-xs" : "min-w-[120px]")}
          >
            {buttonLabel ?? (compact ? t("admin.pokemon.selectTypes") : t("admin.pokemon.filterTypes"))}
            {selectedTypes.length > 0 && (
              <Badge
                variant="secondary"
                className={compact ? "ml-1 h-4 px-1 text-xs" : "ml-2"}
              >
                {selectedTypes.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-2">
            {showClearButton && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("admin.pokemon.selectTypes")}
                </span>
                {selectedTypes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTypes}
                    className="h-6 px-2 text-xs"
                    disabled={disabled}
                  >
                    {t("admin.pokemon.clearTypes")}
                  </Button>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 my-3">
              {paginatedTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-muted"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                    disabled={disabled}
                  />
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: getPokemonTypeColor(type) }}
                    className="text-white text-xs"
                  >
                    {t(`pokemonTypes.${type}`)}
                  </Badge>
                </label>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

interface SelectedTypesBadgesProps {
  selectedTypes: PokemonType[];
  onTypeRemove: (type: PokemonType) => void;
  disabled?: boolean;
  className?: string;
}

export const SelectedTypesBadges = memo(function SelectedTypesBadges({
  selectedTypes,
  onTypeRemove,
  disabled,
  className,
}: SelectedTypesBadgesProps) {
  const { t } = useTranslation();

  if (selectedTypes.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className || ""}`}>
      {selectedTypes.map((type) => (
        <Badge
          key={type}
          variant="secondary"
          style={{ backgroundColor: getPokemonTypeColor(type) }}
          className="text-white text-xs cursor-pointer h-6"
          onClick={() => !disabled && onTypeRemove(type)}
        >
          {t(`pokemonTypes.${type}`)}
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ))}
    </div>
  );
});
