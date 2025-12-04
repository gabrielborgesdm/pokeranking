"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import {
  usePokemonForm,
  type PokemonFormData,
} from "@/features/admin/hooks/use-pokemon-form";

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

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.pokemon.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("admin.pokemon.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.pokemon.image")}</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("admin.pokemon.saving") : t("admin.pokemon.save")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
