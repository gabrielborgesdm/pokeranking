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
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemePicker } from "./theme-picker";
import { CardThemePreview } from "./card-theme-preview";
import { BackgroundPreview } from "./background-preview";
import { useRankingForm, type RankingFormData } from "../hooks/use-ranking-form";
import { useUserRankedPokemonCount } from "../hooks/use-user-ranked-pokemon-count";

interface RankingFormProps {
  mode: "create" | "edit";
  rankingId?: string;
  initialData?: Partial<RankingFormData>;
  pokemonCount?: number;
  topPokemonImage?: string;
  onSuccess?: () => void;
}

export function RankingForm({
  mode,
  rankingId,
  initialData,
  pokemonCount = 0,
  topPokemonImage,
  onSuccess,
}: RankingFormProps) {
  const { totalRankedPokemon, totalPokemonInSystem } =
    useUserRankedPokemonCount();
  const { t } = useTranslation();
  const { form, error, isLoading, onSubmit } = useRankingForm({
    mode,
    rankingId,
    initialData,
    onSuccess,
  });

  // Watch form values for real-time preview updates
  const watchedTitle = form.watch("title");
  const watchedTheme = form.watch("theme");
  const watchedBackground = form.watch("background");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? t("rankingForm.createTitle")
            : t("rankingForm.editTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form} >
          <form onSubmit={onSubmit} className="space-y-8">


            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rankingForm.titleLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("rankingForm.titlePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Card Theme Preview */}
              <CardThemePreview
                title={watchedTitle}
                theme={watchedTheme}
                topPokemonImage={topPokemonImage}
                pokemonCount={pokemonCount}
              />
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rankingForm.themeLabel")}</FormLabel>
                    <FormDescription>
                      {t("rankingForm.themeDescription")}
                    </FormDescription>
                    <FormControl>
                      <ThemePicker
                        value={field.value}
                        onChange={field.onChange}
                        pokemonCount={totalRankedPokemon}
                        totalPokemonInSystem={totalPokemonInSystem}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Background Section - Picker on left, Preview on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-4">
              {/* Background Preview */}
              <BackgroundPreview
                background={watchedBackground}
                theme={watchedTheme}
              />
              <FormField
                control={form.control}
                name="background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rankingForm.backgroundLabel")}</FormLabel>
                    <FormDescription>
                      {t("rankingForm.backgroundDescription")}
                    </FormDescription>
                    <FormControl>
                      <ThemePicker
                        value={field.value}
                        onChange={field.onChange}
                        pokemonCount={totalRankedPokemon}
                        totalPokemonInSystem={totalPokemonInSystem}

                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>
            {error && (
              <div className=" p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? t("rankingForm.saving")
                : mode === "create"
                  ? t("rankingForm.create")
                  : t("rankingForm.save")}
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
