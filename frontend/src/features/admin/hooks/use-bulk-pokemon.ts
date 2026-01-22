"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { PokemonType } from "@pokeranking/shared";
import {
  useUploadControllerUploadImages,
  usePokemonControllerCreateBulk,
  getPokemonControllerSearchQueryKey,
} from "@pokeranking/api-client";
import { getRandomType } from "@/lib/pokemon-types";
import type { BulkPokemonItem } from "../types/bulk-pokemon";

/**
 * Generate a unique ID using crypto.randomUUID if available, otherwise fallback.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extract Pokemon name from filename.
 * Removes extension, replaces dashes/underscores with spaces, and capitalizes words.
 */
function extractNameFromFilename(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Removes null, undefined, and empty array values from an object.
 * Useful for cleaning up optional fields before sending to the API.
 */
function omitEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v != null && !(Array.isArray(v) && v.length === 0)
    )
  ) as Partial<T>;
}

export function useBulkPokemon() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<BulkPokemonItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadMutation = useUploadControllerUploadImages();
  const createBulkMutation = usePokemonControllerCreateBulk();

  const addFiles = useCallback((files: File[]) => {
    const newItems: BulkPokemonItem[] = files.map((file) => ({
      id: generateId(),
      file,
      name: extractNameFromFilename(file.name),
      types: [],
      pokedexNumber: null,
      species: null,
      height: null,
      weight: null,
      abilities: [],
      hp: null,
      attack: null,
      defense: null,
      specialAttack: null,
      specialDefense: null,
      speed: null,
      generation: null,
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const updateItemName = useCallback((id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  }, []);

  const updateItemTypes = useCallback((id: string, types: PokemonType[]) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        // Pick a random type for display when types change
        const displayType = types.length > 0 ? getRandomType(types) : undefined;
        return { ...item, types, displayType: displayType ?? undefined };
      })
    );
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<BulkPokemonItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const clearErrors = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, error: undefined })));
  }, []);

  /**
   * Upload a single item's file and return the image URL
   */
  const uploadSingleItem = useCallback(
    async (item: BulkPokemonItem): Promise<{ id: string; imageUrl?: string; error?: string }> => {
      try {
        const uploadResponse = await uploadMutation.mutateAsync({
          data: { files: [item.file] },
        });

        if (uploadResponse.status !== 201) {
          return { id: item.id, error: t("admin.pokemon.uploadFailed") };
        }

        const result = uploadResponse.data.results[0];
        if (result?.success && result.url) {
          return { id: item.id, imageUrl: result.url };
        }
        return { id: item.id, error: result?.error || t("admin.pokemon.uploadFailed") };
      } catch {
        return { id: item.id, error: t("admin.pokemon.uploadFailed") };
      }
    },
    [uploadMutation, t]
  );

  /**
   * Retry uploading a single failed item
   */
  const retryItem = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item || !item.error) return;

      setIsSubmitting(true);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, error: undefined } : i))
      );

      const result = await uploadSingleItem(item);

      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          if (result.imageUrl) {
            return { ...i, imageUrl: result.imageUrl, error: undefined };
          }
          return { ...i, error: result.error };
        })
      );

      setIsSubmitting(false);
    },
    [items, uploadSingleItem]
  );

  /**
   * Retry all failed items
   */
  const retryAllFailed = useCallback(async () => {
    const failedItems = items.filter((item) => item.error);
    if (failedItems.length === 0) return;

    setIsSubmitting(true);
    clearErrors();

    const results = await Promise.all(failedItems.map(uploadSingleItem));

    setItems((prev) =>
      prev.map((item) => {
        const result = results.find((r) => r.id === item.id);
        if (!result) return item;
        if (result.imageUrl) {
          return { ...item, imageUrl: result.imageUrl, error: undefined };
        }
        return { ...item, error: result.error };
      })
    );

    setIsSubmitting(false);
  }, [items, clearErrors, uploadSingleItem]);

  const submit = useCallback(async () => {
    const validItems = items.filter((item) => !item.error);
    if (validItems.length === 0) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      // Separate items that need upload from those already uploaded
      const itemsNeedingUpload = validItems.filter((item) => !item.imageUrl);
      const itemsWithUrls = validItems.filter((item) => item.imageUrl);

      // Step 1: Upload images for items that need it
      const uploadResults = new Map<string, { imageUrl?: string; error?: string }>();

      if (itemsNeedingUpload.length > 0) {
        const files = itemsNeedingUpload.map((item) => item.file);
        const uploadResponse = await uploadMutation.mutateAsync({
          data: { files },
        });

        if (uploadResponse.status !== 201) {
          toast.error(t("admin.pokemon.bulkUploadFailed"));
          setIsSubmitting(false);
          return;
        }

        // Map results by filename
        const resultsByFilename = new Map(
          uploadResponse.data.results.map((r) => [r.filename, r])
        );

        for (const item of itemsNeedingUpload) {
          const result = resultsByFilename.get(item.file.name);
          if (result?.success && result.url) {
            uploadResults.set(item.id, { imageUrl: result.url });
          } else {
            uploadResults.set(item.id, {
              error: result?.error || t("admin.pokemon.uploadFailed"),
            });
          }
        }
      }

      // Update items with imageUrls and track errors
      const uploadErrors: { id: string; error: string }[] = [];
      const pokemonToCreate: {
        name: string;
        image: string;
        types: PokemonType[];
        itemId: string;
        pokedexNumber?: number;
        species?: string;
        height?: number;
        weight?: number;
        abilities?: string[];
        hp?: number;
        attack?: number;
        defense?: number;
        specialAttack?: number;
        specialDefense?: number;
        speed?: number;
        generation?: number;
      }[] = [];

      setItems((prev) =>
        prev.map((item) => {
          const result = uploadResults.get(item.id);
          if (result) {
            if (result.imageUrl) {
              return { ...item, imageUrl: result.imageUrl };
            }
            return { ...item, error: result.error };
          }
          return item;
        })
      );

      // Helper to build pokemon data from an item
      const buildPokemonData = (item: BulkPokemonItem, imageUrl: string) => {
        const { id, file, error, displayType, imageUrl: _, ...rest } = item;
        return omitEmpty({ ...rest, image: imageUrl, itemId: id }) as (typeof pokemonToCreate)[number];
      };

      // Build list of Pokemon to create
      for (const item of validItems) {
        const uploadResult = uploadResults.get(item.id);
        const imageUrl = uploadResult?.imageUrl || item.imageUrl;

        if (imageUrl) {
          pokemonToCreate.push(buildPokemonData(item, imageUrl));
        } else if (uploadResult?.error) {
          uploadErrors.push({ id: item.id, error: uploadResult.error });
        }
      }

      // For items already with URLs
      for (const item of itemsWithUrls) {
        if (!pokemonToCreate.some((p) => p.itemId === item.id)) {
          pokemonToCreate.push(buildPokemonData(item, item.imageUrl!));
        }
      }

      // Step 2: Create Pokemon from successful uploads
      if (pokemonToCreate.length > 0) {
        const createResponse = await createBulkMutation.mutateAsync({
          data: {
            pokemon: pokemonToCreate.map(({ itemId, ...pokemon }) => pokemon),
          },
        });

        if (createResponse.status !== 201) {
          toast.error(t("admin.pokemon.bulkFailed"));
          setIsSubmitting(false);
          return;
        }

        // Map creation results back to items
        const creationErrors: { id: string; error: string }[] = [];
        const successIds: string[] = [];

        createResponse.data.results.forEach((result, index) => {
          const itemId = pokemonToCreate[index].itemId;
          if (result.success) {
            successIds.push(itemId);
          } else {
            creationErrors.push({
              id: itemId,
              error: result.error || t("admin.pokemon.createError"),
            });
          }
        });

        // Remove successful items and add errors to failed ones
        setItems((prev) =>
          prev
            .filter((item) => !successIds.includes(item.id))
            .map((item) => {
              const creationError = creationErrors.find((e) => e.id === item.id);
              return creationError ? { ...item, error: creationError.error } : item;
            })
        );

        // Invalidate queries
        if (successIds.length > 0) {
          queryClient.invalidateQueries({
            queryKey: getPokemonControllerSearchQueryKey(),
          });
        }

        // Show toast
        const successCount = createResponse.data.successCount;
        const failedCount = createResponse.data.failedCount + uploadErrors.length;

        if (failedCount === 0) {
          toast.success(t("admin.pokemon.bulkSuccess", { count: successCount }));
        } else if (successCount > 0) {
          toast.warning(
            t("admin.pokemon.bulkPartialSuccess", {
              success: successCount,
              failed: failedCount,
            })
          );
        } else {
          toast.error(t("admin.pokemon.bulkFailed"));
        }
      } else if (uploadErrors.length > 0) {
        toast.error(t("admin.pokemon.bulkUploadFailed"));
      }
    } catch {
      toast.error(t("admin.pokemon.bulkFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }, [items, clearErrors, uploadMutation, createBulkMutation, queryClient, t]);

  return {
    items,
    addFiles,
    updateItemName,
    updateItemTypes,
    updateItem,
    removeItem,
    clearAll,
    submit,
    retryItem,
    retryAllFailed,
    isSubmitting,
    hasItems: items.length > 0,
    hasErrors: items.some((item) => item.error),
    errorCount: items.filter((item) => item.error).length,
  };
}
