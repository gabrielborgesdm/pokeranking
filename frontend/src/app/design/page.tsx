"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "react-i18next";
import { ColorPalette } from "./sections/color-palette";
import { GradientShowcase } from "./sections/gradient-showcase";
import { PokemonPickerShowcase } from "./sections/pokemon-picker-showcase";
import { SelectablePokemonGalleryShowcase } from "./sections/selectable-pokemon-gallery-showcase";
import { UserCardShowcase } from "./sections/user-card-showcase";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";

export default function DesignPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-8xl mx-auto py-8 px-4 space-y-8">

      <BackButton />
      <PageHeader
        title={t("design.title")}
        description={t("design.subtitle")}
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
