"use client";

import { memo } from "react";
import { X } from "lucide-react";
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
}

export const TypesSelector = memo(function TypesSelector({
  selectedTypes,
  onTypesChange,
  disabled,
  showClearButton = true,
  compact = false,
  className,
  buttonLabel,
}: TypesSelectorProps) {
  const { t } = useTranslation();

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
            className={compact ? "h-7 text-xs" : "min-w-[120px]"}
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
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {POKEMON_TYPE_VALUES.map((type) => (
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
                    {type}
                  </Badge>
                </label>
              ))}
            </div>
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
          {type}
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ))}
    </div>
  );
});
