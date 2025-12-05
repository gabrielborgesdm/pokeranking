"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { PokemonImage } from "@/components/pokemon-image";
import { PokemonType, pokemonTypeGradients } from "@/lib/pokemon-types";
import { PokemonTypeIcon } from "./pokemon-type-icon";

interface PokemonCardProps {
  name: string;
  image: string;
  types?: PokemonType[];
  onClick?: () => void;
  className?: string;
  /** 1-based position in the ranking */
  position?: number;
  /** Zone color for the position circle */
  positionColor?: string;
}

const DEFAULT_GRADIENT = "gradient-pokemon-default";

const PositionBadge = memo(function PositionBadge({
  position,
}: {
  position: number;
}) {
  const displayText = position < 10 ? `0${position}` : String(position);
  const isThreeDigit = position >= 100;
  const isFourDigit = position >= 1000;
  const textSize = isFourDigit ? "text-xl" : isThreeDigit ? "text-2xl" : "text-3xl";
  const marginLeft = isFourDigit ? "ml-2" : isThreeDigit ? "ml-2" : "ml-3";

  return (
    <span
      className={`${marginLeft} mb-3 font-black text-white drop-shadow-md ${textSize}`}
    >
      {displayText}
    </span>
  );
});

export const PokemonCard = memo(function PokemonCard({
  name,
  image,
  types = [],
  onClick,
  className,
  position,
  positionColor,
}: PokemonCardProps) {
  const primaryType = types[0];
  const gradientClass = primaryType
    ? pokemonTypeGradients[primaryType]
    : DEFAULT_GRADIENT;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 min-w-[200px] shadow-lg",
        onClick && "hover:cursor-pointer",
        gradientClass,
        className
      )}
    >
      {/* Pokemon Image */}
      <div className="relative w-full aspect-square mb-3">
        <PokemonImage
          src={image}
          alt={name}
          fill
          className="drop-shadow-lg z-10"
          sizes="(max-width: 768px) 50vw, 200px"
        />
      </div>

      {/* Pokemon Name */}
      <h3 className="text-xl font-bold text-center truncate mb-2">{name}</h3>

      {/* Type Icons */}
      <div className="flex justify-center gap-2 h-7">
        {types.map((type) => (
          <PokemonTypeIcon key={type} type={type} size={28} />
        ))}
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full flex items-end justify-start"
        style={{
          backgroundColor: positionColor ?? "rgba(255,255,255,0.1)",
        }}
      >
        {position !== undefined && <PositionBadge position={position} />}
      </div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
    </div>
  );
});
