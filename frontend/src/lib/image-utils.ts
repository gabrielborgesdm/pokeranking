import { getClientConfig } from "./config";

export const POKEMON_IMAGE_BASE_URL = "/pokemon";
export const DEFAULT_POKEMON_IMAGE = "/images/who.png";

const ALLOWED_IMAGE_EXTENSIONS = [".png"];
const INVALID_CHARS = /[/\\<>:"|?*]/;
const PATH_TRAVERSAL = /\.\./;

function isValidFilename(value: string): boolean {
  if (PATH_TRAVERSAL.test(value)) return false;
  if (INVALID_CHARS.test(value)) return false;
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
    value.toLowerCase().endsWith(ext)
  );
}

function isValidWhitelistedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const { allowedImageDomains } = getClientConfig();
    return allowedImageDomains.some(
      (domain) =>
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates an image string matches backend validation rules.
 * Accepts either a valid filename (.png, no path traversal) or a URL from allowed domains.
 */
export function isValidImageString(value: string): boolean {
  return isValidFilename(value) || isValidWhitelistedUrl(value);
}

/**
 * Returns the allowed image domains from config for display in error messages.
 */
export function getAllowedImageDomains(): string[] {
  return getClientConfig().allowedImageDomains;
}

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
