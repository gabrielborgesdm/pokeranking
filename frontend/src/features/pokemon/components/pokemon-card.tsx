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
  /** Whether a drag operation is in progress (shows drop overlay) */
  isDropping?: boolean;
  /** Whether to hide type icons (for compact/small screen views) */
  isCompact?: boolean;
  /** Whether this card is highlighted (from search) */
  isHighlighted?: boolean;
}

const DEFAULT_GRADIENT = "gradient-pokemon-default";

const PositionBadge = memo(function PositionBadge({
  position,
  isCompact,
}: {
  position: number;
  isCompact: boolean;
}) {
  const displayText = position < 10 ? `0${position}` : String(position);
  const isThreeDigit = position >= 100;
  const isFourDigit = position >= 1000;

  const textSize = isCompact
    ? (isFourDigit ? "text-sm" : isThreeDigit ? "text-base" : "text-lg")
    : (isFourDigit ? "text-xl" : isThreeDigit ? "text-2xl" : "text-3xl");

  const marginLeft = isCompact
    ? (isFourDigit ? "ml-1" : isThreeDigit ? "ml-1" : "ml-1.5")
    : (isFourDigit ? "ml-2" : isThreeDigit ? "ml-2" : "ml-3");

  return (
    <span
      className={cn(
        marginLeft,
        isCompact ? "mb-1.5" : "mb-3",
        "font-black text-white drop-shadow-md",
        textSize
      )}
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
  isDropping,
  isCompact = false,
  isHighlighted = false,
}: PokemonCardProps) {
  const primaryType = types[0];
  const gradientClass = primaryType
    ? pokemonTypeGradients[primaryType]
    : DEFAULT_GRADIENT;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden shadow-lg transition-all duration-200 ease-out select-none",
        isCompact ? "rounded-lg p-2 min-w-[100px]" : "rounded-xl p-4 min-w-[200px]",
        onClick && "cursor-pokeball hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl",
        isHighlighted && "pokemon-highlight",
        gradientClass,
        className
      )}
    >
      {/* Pokemon Image */}
      <div className={cn("relative w-full aspect-square", isCompact ? "mb-1" : "mb-3")}>
        <PokemonImage
          src={image}
          alt={name}
          fill
          className="drop-shadow-lg z-10"
          sizes="(max-width: 768px) 33vw, 200px"
        />
      </div>

      {/* Pokemon Name */}
      <h3 className={cn(
        "font-bold text-center truncate",
        isCompact ? "text-xs mb-0.5" : "text-xl mb-2"
      )}>{name}</h3>

      {/* Type Icons - smaller when compact */}
      <div className={cn("flex justify-center", isCompact ? "gap-1 h-5" : "gap-2 h-7")}>
        {types.map((type) => (
          <PokemonTypeIcon key={type} type={type} size={isCompact ? 16 : 28} />
        ))}
      </div>

      {/* Dropping Overlay */}
      {isDropping && (
        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center pointer-events-none z-20 border-2 border-dashed border-white/80 backdrop-blur-[2px] animate-pulse">
          {/* Pokeball icon with wobble animation */}
          <div className="relative w-12 h-12 animate-[wobble_0.8s_ease-in-out_infinite]">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* Top half - red */}
              <path d="M 50 5 A 45 45 0 0 1 95 50 L 5 50 A 45 45 0 0 1 50 5" fill="#EF4444" stroke="#1F2937" strokeWidth="4" />
              {/* Bottom half - white */}
              <path d="M 50 95 A 45 45 0 0 1 5 50 L 95 50 A 45 45 0 0 1 50 95" fill="#FAFAFA" stroke="#1F2937" strokeWidth="4" />
              {/* Center band */}
              <rect x="5" y="46" width="90" height="8" fill="#1F2937" />
              {/* Center button with glow */}
              <circle cx="50" cy="50" r="12" fill="#FAFAFA" stroke="#1F2937" strokeWidth="4" />
              <circle cx="50" cy="50" r="6" fill="#FAFAFA" stroke="#1F2937" strokeWidth="2" className="animate-ping" />
            </svg>
          </div>
        </div>
      )}

      {/* Decorative Elements */}
      <div
        className={cn(
          "absolute rounded-full flex items-end justify-start",
          isCompact ? "-top-3 -right-3 w-10 h-10" : "-top-6 -right-6 w-20 h-20"
        )}
        style={{
          backgroundColor: positionColor ?? "rgba(255,255,255,0.1)",
        }}
      >
        {position !== undefined && <PositionBadge position={position} isCompact={isCompact} />}
      </div>
      <div className={cn(
        "absolute rounded-full bg-white/5",
        isCompact ? "-bottom-2 -left-2 w-8 h-8" : "-bottom-4 -left-4 w-16 h-16"
      )} />
    </div>
  );
});
