"use client";

import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PokemonFieldsProps {
  values: {
    pokedexNumber?: number | null;
    generation?: number | null;
    species?: string | null;
    height?: number | null;
    weight?: number | null;
    abilities?: string[];
    hp?: number | null;
    attack?: number | null;
    defense?: number | null;
    specialAttack?: number | null;
    specialDefense?: number | null;
    speed?: number | null;
  };
  onChange: (field: string, value: number | string | string[] | null) => void;
  disabled?: boolean;
  /** Use compact styling for bulk form */
  compact?: boolean;
  /** Additional class for inputs */
  inputClassName?: string;
}

export function PokemonFields({
  values,
  onChange,
  disabled,
  compact = false,
  inputClassName = "",
}: PokemonFieldsProps) {
  const { t } = useTranslation();

  const inputClass = compact
    ? `h-8 text-sm ${inputClassName}`
    : inputClassName;

  const labelClass = compact ? "text-xs" : "";
  const smallLabelClass = compact ? "text-[10px] text-muted-foreground" : "text-xs text-muted-foreground";

  return (
    <div className="space-y-3">
      {/* Pokedex Info Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className={labelClass}>{t("admin.pokemon.pokedexNumber")}</Label>
          <Input
            type="number"
            min={1}
            placeholder="25"
            value={values.pokedexNumber ?? ""}
            onChange={(e) =>
              onChange("pokedexNumber", e.target.value ? Number(e.target.value) : null)
            }
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <Label className={labelClass}>{t("admin.pokemon.generation")}</Label>
          <Input
            type="number"
            min={1}
            max={9}
            placeholder="1"
            value={values.generation ?? ""}
            onChange={(e) =>
              onChange("generation", e.target.value ? Number(e.target.value) : null)
            }
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <Label className={labelClass}>{t("admin.pokemon.height")}</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            placeholder="0.4"
            value={values.height ?? ""}
            onChange={(e) =>
              onChange("height", e.target.value ? Number(e.target.value) : null)
            }
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <Label className={labelClass}>{t("admin.pokemon.weight")}</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            placeholder="6.0"
            value={values.weight ?? ""}
            onChange={(e) =>
              onChange("weight", e.target.value ? Number(e.target.value) : null)
            }
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>

      {/* Species */}
      <div className="space-y-1">
        <Label className={labelClass}>{t("admin.pokemon.species")}</Label>
        <Input
          placeholder={t("admin.pokemon.speciesPlaceholder")}
          value={values.species ?? ""}
          onChange={(e) => onChange("species", e.target.value || null)}
          disabled={disabled}
          className={inputClass}
        />
      </div>

      {/* Abilities */}
      <div className="space-y-1">
        <Label className={labelClass}>{t("admin.pokemon.abilities")}</Label>
        <Input
          placeholder={t("admin.pokemon.abilitiesPlaceholder")}
          value={values.abilities?.join(", ") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            const abilities = value
              ? value.split(",").map((a) => a.trim()).filter(Boolean)
              : [];
            onChange("abilities", abilities);
          }}
          disabled={disabled}
          className={inputClass}
        />
      </div>

      {/* Base Stats */}
      <div>
        <Label className={`${labelClass} mb-2 block`}>{t("admin.pokemon.baseStats")}</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div className="space-y-1">
            <Label className={smallLabelClass}>HP</Label>
            <Input
              type="number"
              min={1}
              max={255}
              placeholder="35"
              value={values.hp ?? ""}
              onChange={(e) =>
                onChange("hp", e.target.value ? Number(e.target.value) : null)
              }
              disabled={disabled}
              className={compact ? `h-7 text-xs ${inputClassName}` : inputClassName}
            />
          </div>
          <div className="space-y-1">
            <Label className={smallLabelClass}>{t("admin.pokemon.attack")}</Label>
            <Input
              type="number"
              min={1}
              max={255}
              placeholder="55"
              value={values.attack ?? ""}
              onChange={(e) =>
                onChange("attack", e.target.value ? Number(e.target.value) : null)
              }
              disabled={disabled}
              className={compact ? `h-7 text-xs ${inputClassName}` : inputClassName}
            />
          </div>
          <div className="space-y-1">
            <Label className={smallLabelClass}>{t("admin.pokemon.defense")}</Label>
            <Input
              type="number"
              min={1}
              max={255}
              placeholder="40"
              value={values.defense ?? ""}
              onChange={(e) =>
                onChange("defense", e.target.value ? Number(e.target.value) : null)
              }
              disabled={disabled}
              className={compact ? `h-7 text-xs ${inputClassName}` : inputClassName}
            />
          </div>
          <div className="space-y-1">
            <Label className={smallLabelClass}>{t("admin.pokemon.specialAttack")}</Label>
            <Input
              type="number"
              min={1}
              max={255}
              placeholder="50"
              value={values.specialAttack ?? ""}
              onChange={(e) =>
                onChange("specialAttack", e.target.value ? Number(e.target.value) : null)
              }
              disabled={disabled}
              className={compact ? `h-7 text-xs ${inputClassName}` : inputClassName}
            />
          </div>
          <div className="space-y-1">
            <Label className={smallLabelClass}>{t("admin.pokemon.specialDefense")}</Label>
            <Input
              type="number"
              min={1}
              max={255}
              placeholder="50"
              value={values.specialDefense ?? ""}
              onChange={(e) =>
                onChange("specialDefense", e.target.value ? Number(e.target.value) : null)
              }
              disabled={disabled}
              className={compact ? `h-7 text-xs ${inputClassName}` : inputClassName}
            />
          </div>
          <div className="space-y-1">
            <Label className={smallLabelClass}>{t("admin.pokemon.speed")}</Label>
            <Input
              type="number"
              min={1}
              max={255}
              placeholder="90"
              value={values.speed ?? ""}
              onChange={(e) =>
                onChange("speed", e.target.value ? Number(e.target.value) : null)
              }
              disabled={disabled}
              className={compact ? `h-7 text-xs ${inputClassName}` : inputClassName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
