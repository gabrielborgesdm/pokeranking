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
import { BackgroundPicker } from "./background-picker";
import { CardThemePreview } from "./card-theme-preview";
import { BackgroundPreview } from "./background-preview";
import { useRankingForm, type RankingFormData } from "@/hooks/use-ranking-form";

interface RankingFormProps {
  mode: "create" | "edit";
  rankingId?: string;
  initialData?: Partial<RankingFormData>;
  pokemonCount?: number;
  totalPokemonInSystem: number;
  topPokemonImage?: string;
  onSuccess?: () => void;
}

export function RankingForm({
  mode,
  rankingId,
  initialData,
  pokemonCount = 0,
  totalPokemonInSystem,
  topPokemonImage,
  onSuccess,
}: RankingFormProps) {
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
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

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

            {/* Card Theme Section - Picker on left, Preview on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                        pokemonCount={pokemonCount}
                        totalPokemonInSystem={totalPokemonInSystem}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Card Theme Preview */}
              <CardThemePreview
                title={watchedTitle}
                theme={watchedTheme}
                topPokemonImage={topPokemonImage}
                pokemonCount={pokemonCount}
              />
            </div>

            {/* Background Section - Picker on left, Preview on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                      <BackgroundPicker
                        value={field.value}
                        onChange={field.onChange}
                        pokemonCount={pokemonCount}
                        totalPokemonInSystem={totalPokemonInSystem}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Background Preview */}
              <BackgroundPreview
                background={watchedBackground}
                theme={watchedTheme}
              />
            </div>

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
