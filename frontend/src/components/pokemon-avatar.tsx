import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import { cn } from "@/lib/utils";

interface PokemonAvatarProps {
  pokemon: PokemonResponseDto | null;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  hoverText?: string;
  hasError?: boolean;
  showBorder?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "size-12",
  md: "size-20",
  lg: "size-32",
  xl: "size-40",
};

const iconSizes = {
  sm: "size-5",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
};

// Image sizes for Next.js optimization (in pixels)
const imageSizes = {
  sm: "48px",
  md: "80px",
  lg: "128px",
  xl: "160px",
};

export function PokemonAvatar({
  pokemon,
  size = "lg",
  onClick,
  hoverText,
  hasError = false,
  showBorder = true,
  className,
}: PokemonAvatarProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative transition-all duration-200",
        isClickable && [
          "cursor-pointer group",
          "hover:scale-105",
          pokemon && "hover:opacity-90",
        ],
        className
      )}
    >
      <Avatar
        className={cn(
          sizeClasses[size],
          "transition-all duration-200",
          showBorder && [
            pokemon
              ? "ring-4 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/25"
              : "ring-2 ring-dashed ring-muted-foreground/30 ring-offset-2 ring-offset-background",
          ],
          hasError && "ring-destructive"
        )}
      >
        {pokemon ? (
          <AvatarImage
            src={pokemon.image}
            alt={pokemon.name}
            sizes={imageSizes[size]}
          />
        ) : (
          <AvatarFallback className="bg-muted">
            <User className={cn(iconSizes[size], "text-muted-foreground")} />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Hover overlay for selected Pokemon */}
      {isClickable && pokemon && hoverText && (
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-white text-xs font-medium text-center px-2">
            {hoverText}
          </span>
        </div>
      )}
    </div>
  );
}
