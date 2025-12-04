"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DEFAULT_POKEMON_IMAGE,
  normalizePokemonImageSrc,
} from "@/lib/image-utils";

interface PokemonImageProps {
  src: string | undefined | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export const PokemonImage = React.memo(function PokemonImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes,
  priority,
  className,
}: PokemonImageProps) {
  const [imgSrc, setImgSrc] = React.useState(() =>
    normalizePokemonImageSrc(src)
  );

  React.useEffect(() => {
    setImgSrc(normalizePokemonImageSrc(src));
  }, [src]);

  const handleError = React.useCallback(() => {
    setImgSrc(DEFAULT_POKEMON_IMAGE);
  }, []);

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-contain", className)}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width ?? 200}
      height={height ?? 200}
      sizes={sizes}
      priority={priority}
      className={cn("object-contain", className)}
      onError={handleError}
    />
  );
});
