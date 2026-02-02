"use client";

import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/lib/routes";
import { useTranslation } from "react-i18next";
import { ColorPalette } from "./sections/color-palette";
import { GradientShowcase } from "./sections/gradient-showcase";
import { PokemonPickerShowcase } from "./sections/pokemon-picker-showcase";
import { SelectablePokemonGalleryShowcase } from "./sections/selectable-pokemon-gallery-showcase";
import { UserCardShowcase } from "./sections/user-card-showcase";

export default function DesignPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-8xl mx-auto py-8 px-4 space-y-8">
      <PageHeader
        title={t("design.title")}
        description={t("design.subtitle")}
        backHref={routes.home}
      />

      <UserCardShowcase />
      <PokemonPickerShowcase />
      <SelectablePokemonGalleryShowcase />
      <ColorPalette />
      <GradientShowcase />
      <ThemeToggle />
    </div>
  );
}
