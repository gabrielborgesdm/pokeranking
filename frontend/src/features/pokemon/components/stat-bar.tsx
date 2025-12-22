"use client";

import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  animate?: boolean;
}

const STAT_COLORS: Record<string, string> = {
  hp: "bg-emerald-500",
  attack: "bg-red-500",
  defense: "bg-orange-500",
  "special-attack": "bg-blue-500",
  "special-defense": "bg-purple-500",
  speed: "bg-yellow-400",
};

export const StatBar = memo(function StatBar({
  label,
  value,
  maxValue = 255,
  color,
  animate = true,
}: StatBarProps) {
  const [width, setWidth] = useState(animate ? 0 : (value / maxValue) * 100);
  const percentage = (value / maxValue) * 100;

  useEffect(() => {
    if (animate) {
      const timer = requestAnimationFrame(() => {
        setWidth(percentage);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [animate, percentage]);

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            color
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-10 text-sm font-medium text-right tabular-nums">{value}</span>
    </div>
  );
});

export const getStatColor = (statName: string): string => {
  const normalized = statName.toLowerCase().replace(/\s+/g, "-");
  return STAT_COLORS[normalized] || "bg-gray-500";
};

export { STAT_COLORS };
