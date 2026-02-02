"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function ButtonShowcase() {
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">{t("design.sections.buttons.title")}</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t("design.sections.buttons.variants")}</h3>
          <div className="flex flex-wrap gap-4">
            <Button>{t("design.sections.buttons.primary")}</Button>
            <Button variant="secondary">{t("design.sections.buttons.secondary")}</Button>
            <Button variant="destructive">{t("design.sections.buttons.destructive")}</Button>
            <Button variant="outline">{t("design.sections.buttons.outline")}</Button>
            <Button variant="ghost">{t("design.sections.buttons.ghost")}</Button>
            <Button variant="link">{t("design.sections.buttons.link")}</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t("design.sections.buttons.sizes")}</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">{t("design.sections.buttons.small")}</Button>
            <Button size="default">{t("design.sections.buttons.default")}</Button>
            <Button size="lg">{t("design.sections.buttons.large")}</Button>
            <Button size="icon">+</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t("design.sections.buttons.pokemonThemed")}</h3>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-pokemon-red hover:bg-pokemon-red-dark">
              {t("design.sections.buttons.catchPokemon")}
            </Button>
            <Button className="bg-pokemon-blue hover:bg-pokemon-blue-dark">
              {t("design.sections.buttons.waterType")}
            </Button>
            <Button className="bg-pokemon-yellow hover:bg-pokemon-yellow-dark text-pokemon-navy">
              {t("design.sections.buttons.electricType")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
