"use client";

import { useTranslation } from "react-i18next";

const pokerankingGradients = [
  {
    nameKey: "pokemonRed",
    descriptionKey: "pokemonRedDescription",
    class: "gradient-pokemon-red",
  },
  {
    nameKey: "pokemonYellow",
    descriptionKey: "pokemonYellowDescription",
    class: "gradient-pokemon-yellow",
  },
  {
    nameKey: "pokemonBlue",
    descriptionKey: "pokemonBlueDescription",
    class: "gradient-pokemon-blue",
  },
  {
    nameKey: "pokeball",
    descriptionKey: "pokeballDescription",
    class: "gradient-pokeball",
  },
  {
    nameKey: "sunset",
    descriptionKey: "sunsetDescription",
    class: "gradient-pokemon-sunset",
  },
  {
    nameKey: "ocean",
    descriptionKey: "oceanDescription",
    class: "gradient-pokemon-ocean",
  },
];

const typeGradients = [
  {
    nameKey: "grassType",
    descriptionKey: "grassTypeDescription",
    class: "gradient-type-grass",
  },
  {
    nameKey: "waterType",
    descriptionKey: "waterTypeDescription",
    class: "gradient-type-water",
  },
  {
    nameKey: "fireType",
    descriptionKey: "fireTypeDescription",
    class: "gradient-type-fire",
  },
  {
    nameKey: "electricType",
    descriptionKey: "electricTypeDescription",
    class: "gradient-type-electric",
  },
  {
    nameKey: "special",
    descriptionKey: "specialDescription",
    class: "gradient-type-special",
  },
];

export function GradientShowcase() {
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">
        {t("design.sections.gradients.title")}
      </h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("design.sections.gradients.typeGradients")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("design.sections.gradients.typeGradientsDescription")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeGradients.map((gradient) => (
              <div key={gradient.nameKey} className="space-y-2">
                <div
                  className={`${gradient.class} h-24 rounded-xl shadow-lg flex items-end p-3`}
                >
                  <span className="font-semibold text-sm">#1</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">
                    {t(`design.sections.gradients.${gradient.nameKey}`)}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    .{gradient.class}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("design.sections.gradients.pokerankingGradients")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {pokerankingGradients.map((gradient) => (
              <div key={gradient.nameKey} className="space-y-2">
                <div
                  className={`${gradient.class} h-32 rounded-lg shadow-md`}
                />
                <div className="text-sm">
                  <p className="font-medium">
                    {t(`design.sections.gradients.${gradient.nameKey}`)}
                  </p>
                  <p className="text-muted-foreground">
                    {t(`design.sections.gradients.${gradient.descriptionKey}`)}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    .{gradient.class}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
