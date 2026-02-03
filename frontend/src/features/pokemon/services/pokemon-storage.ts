import type { PokemonResponseDto } from "@pokeranking/api-client";

const DB_NAME = "pokedex-offline";
const DB_VERSION = 1;
const POKEMON_STORE = "pokemon";
const META_STORE = "meta";
const VERSION_KEY = "version";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store for Pokemon data
      if (!db.objectStoreNames.contains(POKEMON_STORE)) {
        db.createObjectStore(POKEMON_STORE, { keyPath: "_id" });
      }

      // Store for metadata (version)
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
  });

  return dbPromise;
}

/**
 * Get all Pokemon from IndexedDB
 */
export async function getPokemon(): Promise<PokemonResponseDto[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(POKEMON_STORE, "readonly");
      const store = transaction.objectStore(POKEMON_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as PokemonResponseDto[];
        resolve(result.length > 0 ? result : null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Save all Pokemon to IndexedDB along with the version
 */
export async function savePokemon(
  pokemon: PokemonResponseDto[],
  version: number
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([POKEMON_STORE, META_STORE], "readwrite");
    const pokemonStore = transaction.objectStore(POKEMON_STORE);
    const metaStore = transaction.objectStore(META_STORE);

    // Clear existing Pokemon and add new ones
    pokemonStore.clear();
    for (const p of pokemon) {
      pokemonStore.add(p);
    }

    // Save version
    metaStore.put(version, VERSION_KEY);

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

/**
 * Get the stored version from IndexedDB
 */
export async function getVersion(): Promise<number | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(META_STORE, "readonly");
      const store = transaction.objectStore(META_STORE);
      const request = store.get(VERSION_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Clear all Pokemon data from IndexedDB
 */
export async function clearPokemon(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([POKEMON_STORE, META_STORE], "readwrite");
    transaction.objectStore(POKEMON_STORE).clear();
    transaction.objectStore(META_STORE).delete(VERSION_KEY);

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}
