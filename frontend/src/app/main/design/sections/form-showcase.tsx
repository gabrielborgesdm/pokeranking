"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export function FormShowcase() {
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">{t("design.sections.forms.title")}</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("design.sections.forms.inputs")}</h3>

          <div className="space-y-2">
            <Label htmlFor="pokemon-name">{t("design.sections.forms.pokemonName")}</Label>
            <Input id="pokemon-name" placeholder={t("design.sections.forms.pokemonNamePlaceholder")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("design.sections.forms.description")}</Label>
            <Textarea id="description" placeholder={t("design.sections.forms.descriptionPlaceholder")} />
          </div>

          <div className="space-y-2">
            <Label>{t("design.sections.forms.pokemonType")}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("design.sections.forms.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fire">{t("design.sections.forms.fire")}</SelectItem>
                <SelectItem value="water">{t("design.sections.forms.water")}</SelectItem>
                <SelectItem value="grass">{t("design.sections.forms.grass")}</SelectItem>
                <SelectItem value="electric">{t("design.sections.forms.electric")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("design.sections.forms.togglesChoices")}</h3>

          <div className="flex items-center space-x-2">
            <Checkbox id="shiny" />
            <Label htmlFor="shiny">{t("design.sections.forms.shinyPokemon")}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="notifications" />
            <Label htmlFor="notifications">{t("design.sections.forms.enableNotifications")}</Label>
          </div>

          <div className="space-y-2">
            <Label>{t("design.sections.forms.starterPokemon")}</Label>
            <RadioGroup defaultValue="bulbasaur">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bulbasaur" id="bulbasaur" />
                <Label htmlFor="bulbasaur">{t("design.sections.forms.bulbasaur")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="charmander" id="charmander" />
                <Label htmlFor="charmander">{t("design.sections.forms.charmander")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="squirtle" id="squirtle" />
                <Label htmlFor="squirtle">{t("design.sections.forms.squirtle")}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
