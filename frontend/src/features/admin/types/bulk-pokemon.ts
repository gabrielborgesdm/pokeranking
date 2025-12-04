import type { PokemonType } from "@pokeranking/shared";

/**
 * Represents a single Pokemon item in the bulk import queue.
 * Used to track each file dropped by the user before upload/creation.
 */
export interface BulkPokemonItem {
  /** Client-side unique ID for React key and item tracking */
  id: string;
  /** The image file to upload */
  file: File;
  /** Pokemon name to create (derived from filename, user-editable) */
  name: string;
  /** Pokemon types */
  types: PokemonType[];
  /** URL after successful upload (used for retry flow) */
  imageUrl?: string;
  /** Error message if upload or creation failed */
  error?: string;
  /** Cached type for stable card gradient display */
  displayType?: PokemonType;
  /** National Pokedex number */
  pokedexNumber?: number | null;
  /** Species classification */
  species?: string | null;
  /** Height in meters */
  height?: number | null;
  /** Weight in kilograms */
  weight?: number | null;
  /** Pokemon abilities */
  abilities?: string[];
  /** Base HP stat */
  hp?: number | null;
  /** Base Attack stat */
  attack?: number | null;
  /** Base Defense stat */
  defense?: number | null;
  /** Base Special Attack stat */
  specialAttack?: number | null;
  /** Base Special Defense stat */
  specialDefense?: number | null;
  /** Base Speed stat */
  speed?: number | null;
  /** Generation introduced */
  generation?: number | null;
}
