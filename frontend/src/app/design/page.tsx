"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "react-i18next";
import { ColorPalette } from "./sections/color-palette";
import { GradientShowcase } from "./sections/gradient-showcase";
import { PokemonPickerShowcase } from "./sections/pokemon-picker-showcase";
import { SelectablePokemonGalleryShowcase } from "./sections/selectable-pokemon-gallery-showcase";
import { UserCardShowcase } from "./sections/user-card-showcase";

export default function DesignPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-8xl mx-auto py-10 px-4 space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t("design.title")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("design.subtitle")}
        </p>
      </header>

      <UserCardShowcase />
      <PokemonPickerShowcase />
      <SelectablePokemonGalleryShowcase />
      <ColorPalette />
      <GradientShowcase />
      <ThemeToggle />
    </div>
  );
}
