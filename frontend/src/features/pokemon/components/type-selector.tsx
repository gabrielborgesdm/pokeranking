"use client";

import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PokemonType } from "@pokeranking/shared";
import {
  POKEMON_TYPE_VALUES,
  pokemonTypeGradients,
} from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PokemonTypeIcon } from "./pokemon-type-icon";

interface TypeSelectorProps {
  value: PokemonType | null;
  onChange: (type: PokemonType | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const TypeSelector = memo(function TypeSelector({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  className,
}: TypeSelectorProps) {
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder ?? t("pokedex.typeCalculator.selectType");

  return (
    <DropdownMenu modal={false} className={className}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <DropdownMenuTrigger
        disabled={disabled}
        className={cn(
          "flex items-center justify-between gap-2 h-9 sm:h-10 w-full sm:min-w-[180px] px-2.5 sm:px-3 rounded-lg border transition-all text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          value
            ? cn(
              "text-white border-transparent",
              pokemonTypeGradients[value]
            )
            : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {value ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PokemonTypeIcon type={value} size={18} showTooltip={false} />
            <span className="font-medium">{t(`pokemonTypes.${value}`)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs sm:text-sm">{defaultPlaceholder}</span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", value && "text-white/80")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
        {POKEMON_TYPE_VALUES.map((type) => (
          <DropdownMenuItem
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              value === type && "bg-accent"
            )}
          >
            <PokemonTypeIcon type={type} size={18} />
            <span className="font-medium text-sm">{t(`pokemonTypes.${type}`)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
