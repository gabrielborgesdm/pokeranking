import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PokemonTypeVariant } from "@/lib/pokemon-variants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, maxLength);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const CARD_VARIANTS: PokemonTypeVariant[] = [
  "grass",
  "water",
  "fire",
  "electric",
  "special",
];

const variantCache = new Map<number, PokemonTypeVariant>();

export function getVariantByIndex(index: number): PokemonTypeVariant {
  const cached = variantCache.get(index);
  if (cached) return cached;

  const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];
  variantCache.set(index, variant);
  return variant;
}
