/**
 * Converts a number to Roman numerals
 */
function toRomanNumeral(num: number): string {
  if (num <= 0) return String(num);

  const romanNumerals: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";
  let remaining = num;

  for (const [value, numeral] of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Returns the generation number as a Roman numeral string
 * @param generation - The generation number (1, 2, 3, etc.)
 * @returns Roman numeral representation (I, II, III, etc.)
 */
export function getGenerationNumeral(generation: number): string {
  return toRomanNumeral(generation);
}

/**
 * Formats generation for display (e.g., "Gen IV")
 * @param generation - The generation number
 * @returns Formatted string like "Gen IV"
 */
export function formatGeneration(generation: number): string {
  return `Gen ${getGenerationNumeral(generation)}`;
}
