/**
 * Formats a date string to a localized short date format.
 * Example: "Jan 15, 2024" (en) or "15 de jan. de 2024" (pt-BR)
 */
export function formatShortDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
