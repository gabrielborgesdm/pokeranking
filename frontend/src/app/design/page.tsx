import { ThemeToggle } from "@/components/theme-toggle";
import { Metadata } from "next";
import { ButtonShowcase } from "./sections/button-showcase";
import { ColorPalette } from "./sections/color-palette";
import { DataDisplayShowcase } from "./sections/data-display-showcase";
import { FeedbackShowcase } from "./sections/feedback-showcase";
import { FormShowcase } from "./sections/form-showcase";
import { GradientShowcase } from "./sections/gradient-showcase";
import { LayoutShowcase } from "./sections/layout-showcase";
import { NavigationShowcase } from "./sections/navigation-showcase";
import { PokemonPickerShowcase } from "./sections/pokemon-picker-showcase";
import { UserCardShowcase } from "./sections/user-card-showcase";

export const metadata: Metadata = {
  title: "Design System | Pokeranking",
  description: "Pokemon-themed design system showcase",
};

export default function DesignPage() {
  return (
    <div className="container mx-auto py-10 px-4 space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Pokeranking Design System</h1>
        <p className="text-muted-foreground text-lg">
          Pokemon-inspired colors, gradients, and components
        </p>
      </header>

      <UserCardShowcase />
      <PokemonPickerShowcase />
      <ColorPalette />
      <GradientShowcase />
      <ButtonShowcase />
      <FormShowcase />
      <FeedbackShowcase />
      <NavigationShowcase />
      <DataDisplayShowcase />
      <LayoutShowcase />

      <ThemeToggle />
    </div>
  );
}
