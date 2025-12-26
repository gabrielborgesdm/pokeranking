"use client";

import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import {
  TypesSelector,
  SelectedTypesBadges,
} from "@/features/pokemon/components/types-selector";
import { PokemonFields } from "./pokemon-fields";
import {
  usePokemonForm,
  type PokemonFormData,
} from "@/features/admin/hooks/use-pokemon-form";
import type { PokemonType } from "@pokeranking/shared";
import { normalize } from "path";
import { normalizePokemonImageSrc } from "@/lib/image-utils";

interface PokemonFormProps {
  mode: "create" | "edit";
  pokemonId?: string;
  initialData?: Partial<PokemonFormData>;
}

export function PokemonForm({ mode, pokemonId, initialData }: PokemonFormProps) {
  const { t } = useTranslation();
  const { form, error, isLoading, onSubmit } = usePokemonForm({
    mode,
    pokemonId,
    initialData,
  });

  const selectedTypes = form.watch("types") as PokemonType[];
  const formValues = form.watch();

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label>{t("admin.pokemon.name")}</Label>
                  <Input
                    placeholder={t("admin.pokemon.namePlaceholder")}
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="image"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label>{t("admin.pokemon.image")}</Label>
                  <ImageUpload
                    value={field.value ?? null}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                  {fieldState.error && (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="types"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>{t("admin.pokemon.types")}</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <TypesSelector
                      selectedTypes={field.value as PokemonType[]}
                      onTypesChange={(types) => field.onChange(types)}
                      disabled={isLoading}
                      showClearButton={false}
                      buttonLabel={t("admin.pokemon.selectTypes")}
                    />
                    <SelectedTypesBadges
                      selectedTypes={selectedTypes}
                      onTypeRemove={(type) =>
                        field.onChange((field.value ?? []).filter((t: string) => t !== type))
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            />
          </div>

          {/* Additional Pokemon Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("admin.pokemon.pokedexInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <PokemonFields
                values={formValues}
                onChange={(field, value) => form.setValue(field as keyof PokemonFormData, value as never)}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("admin.pokemon.saving") : t("admin.pokemon.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
