"use client";

import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ZoneColorPicker, ZONE_COLORS } from "./zone-color-picker";

export interface Zone {
  name: string;
  interval: [number, number | null];
  color: string;
}

interface ZonePickerProps {
  value?: Zone[];
  onChange: (zones: Zone[]) => void;
  errors?: Record<number, { name?: string; interval?: string; color?: string }>;
  className?: string;
}

const DEFAULT_ZONES: Zone[] = [
  { name: "S", interval: [1, 10], color: "#ef4444" },
  { name: "A", interval: [11, 150], color: "#f97316" },
  { name: "B", interval: [151, 300], color: "#eab308" },
  { name: "C", interval: [301, 500], color: "#22c55e" },
  { name: "D", interval: [501, 750], color: "#3b82f6" },
  { name: "F", interval: [751, null], color: "#6b7280" },
];

// Get next available color that's not already used
function getNextColor(usedColors: string[]): string {
  const available = ZONE_COLORS.find((c) => !usedColors.includes(c.hex));
  return available?.hex ?? ZONE_COLORS[0].hex;
}

export const ZonePicker = memo(function ZonePicker({
  value = [],
  onChange,
  errors,
  className,
}: ZonePickerProps) {
  const { t } = useTranslation();

  const handleAddZone = useCallback(() => {
    const usedColors = value.map((z) => z.color);
    const lastZone = value[value.length - 1];
    const newStart = lastZone ? (lastZone.interval[1] ?? lastZone.interval[0]) + 1 : 1;

    const newZone: Zone = {
      name: "",
      interval: [newStart, newStart + 4],
      color: getNextColor(usedColors),
    };

    onChange([...value, newZone]);
  }, [value, onChange]);

  const handleRemoveZone = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleUpdateZone = useCallback(
    (index: number, updates: Partial<Zone>) => {
      const newZones = [...value];
      newZones[index] = { ...newZones[index], ...updates };
      onChange(newZones);
    },
    [value, onChange]
  );

  const handleUseDefaults = useCallback(() => {
    onChange(DEFAULT_ZONES);
  }, [onChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddZone}
        >
          <Plus className="w-4 h-4 mr-1" />
          {t("zoneEditor.addZone")}
        </Button>
        {value.length === 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUseDefaults}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {t("zoneEditor.defaultZones")}
          </Button>
        )}
      </div>

      {/* Zone list */}
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          {t("zoneEditor.noZones")}
        </p>
      ) : (
        <div className="space-y-3">
          {value.map((zone, index) => (
            <ZoneRow
              key={index}
              zone={zone}
              index={index}
              isLast={index === value.length - 1}
              error={errors?.[index]}
              onUpdate={(updates) => handleUpdateZone(index, updates)}
              onRemove={() => handleRemoveZone(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

interface ZoneRowProps {
  zone: Zone;
  index: number;
  isLast: boolean;
  error?: { name?: string; interval?: string; color?: string };
  onUpdate: (updates: Partial<Zone>) => void;
  onRemove: () => void;
}

const ZoneRow = memo(function ZoneRow({
  zone,
  index,
  isLast,
  error,
  onUpdate,
  onRemove,
}: ZoneRowProps) {
  const { t } = useTranslation();
  const isUnbounded = zone.interval[1] === null;

  return (
    <div className="p-3 border rounded-lg bg-card space-y-3">
      {/* Row 1: Name and color */}
      <div className="flex items-center gap-3">
        {/* Color indicator */}
        <div
          className="w-3 h-10 rounded-sm flex-shrink-0"
          style={{ backgroundColor: zone.color }}
        />

        {/* Name input */}
        <div className="flex-1">
          <Input
            type="text"
            value={zone.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder={t("zoneEditor.zoneNamePlaceholder")}
            className={cn("h-8", error?.name && "border-destructive")}
          />
          {error?.name && (
            <p className="text-xs text-destructive mt-1">{error.name}</p>
          )}
        </div>

        {/* Remove button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Row 2: Interval */}
      <div className="flex items-center gap-2 pl-6">
        <Label className="text-xs text-muted-foreground w-10">
          {t("zoneEditor.startPosition")}
        </Label>
        <Input
          type="number"
          min={1}
          value={zone.interval[0]}
          onChange={(e) => {
            const start = Math.max(1, parseInt(e.target.value) || 1);
            onUpdate({ interval: [start, zone.interval[1]] });
          }}
          className="w-20 h-8"
        />

        <Label className="text-xs text-muted-foreground w-8 text-center">
          {t("zoneEditor.endPosition")}
        </Label>

        {isUnbounded ? (
          <span className="text-sm text-muted-foreground px-2">∞</span>
        ) : (
          <Input
            type="number"
            min={zone.interval[0]}
            value={zone.interval[1] ?? ""}
            onChange={(e) => {
              const end = parseInt(e.target.value) || zone.interval[0];
              onUpdate({ interval: [zone.interval[0], Math.max(zone.interval[0], end)] });
            }}
            className="w-20 h-8"
          />
        )}

        {/* Until end checkbox (only show for last zone) */}
        {isLast && (
          <div className="flex items-center gap-1.5 ml-2">
            <Checkbox
              id={`unbounded-${index}`}
              checked={isUnbounded}
              onCheckedChange={(checked) => {
                if (checked) {
                  onUpdate({ interval: [zone.interval[0], null] });
                } else {
                  onUpdate({ interval: [zone.interval[0], zone.interval[0] + 10] });
                }
              }}
            />
            <Label htmlFor={`unbounded-${index}`} className="text-xs text-muted-foreground cursor-pointer">
              {t("zoneEditor.untilEnd")}
            </Label>
          </div>
        )}
      </div>

      {/* Row 3: Color picker */}
      <div className="pl-6">
        <ZoneColorPicker
          value={zone.color}
          onChange={(color) => onUpdate({ color })}
        />
      </div>
    </div>
  );
});
