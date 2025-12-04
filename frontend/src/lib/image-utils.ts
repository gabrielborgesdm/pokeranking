export const POKEMON_IMAGE_BASE_URL = "/pokemon";
export const DEFAULT_POKEMON_IMAGE = "/images/who.png";

/**
 * Normalizes an image source path, handling various input formats.
 * - Returns DEFAULT_POKEMON_IMAGE for null/undefined
 * - Returns as-is if already a full path (starts with "/" or "http")
 * - Otherwise, prepends the POKEMON_IMAGE_BASE_URL
 */
export function normalizePokemonImageSrc(src: string | undefined | null): string {
  if (!src) return DEFAULT_POKEMON_IMAGE;
  if (src.startsWith("/") || src.startsWith("http")) return src;
  return `${POKEMON_IMAGE_BASE_URL}/${src}`;
}
