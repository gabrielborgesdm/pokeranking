import { Metadata } from "next";
import { ColorPalette } from "./sections/color-palette";
import { GradientShowcase } from "./sections/gradient-showcase";
import { ButtonShowcase } from "./sections/button-showcase";
import { FormShowcase } from "./sections/form-showcase";
import { FeedbackShowcase } from "./sections/feedback-showcase";
import { NavigationShowcase } from "./sections/navigation-showcase";
import { DataDisplayShowcase } from "./sections/data-display-showcase";
import { LayoutShowcase } from "./sections/layout-showcase";
import { ThemeToggle } from "@/components/theme-toggle";

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
