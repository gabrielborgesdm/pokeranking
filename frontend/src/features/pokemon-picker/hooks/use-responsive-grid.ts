import { useState, useEffect, useCallback, useRef } from "react";
import { POKEMON_PICKER_DEFAULTS } from "../constants";
import type { ResponsiveGridConfig } from "../types";

interface UseResponsiveGridOptions {
  /** Maximum number of columns (caps responsive behavior) */
  maxColumns?: number;
  minCardWidth?: number;
  gap?: number;
  rowHeight?: number;
  itemCount: number;
}

export function useResponsiveGrid({
  maxColumns,
  minCardWidth = POKEMON_PICKER_DEFAULTS.MIN_CARD_WIDTH,
  gap = POKEMON_PICKER_DEFAULTS.GAP,
  rowHeight = POKEMON_PICKER_DEFAULTS.ROW_HEIGHT,
  itemCount,
}: UseResponsiveGridOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ResponsiveGridConfig>({
    containerWidth: 0,
    columnCount: 1,
    columnWidth: minCardWidth,
    rowHeight,
    gap,
  });

  const calculateGrid = useCallback(
    (width: number): ResponsiveGridConfig => {
      if (width === 0) {
        return {
          containerWidth: 0,
          columnCount: 1,
          columnWidth: minCardWidth,
          rowHeight,
          gap,
        };
      }

      // Responsive mode - calculate how many columns can fit
      // Formula: width = (columnCount * columnWidth) + ((columnCount - 1) * gap)
      // Solving for columnCount: columnCount = floor((width + gap) / (minCardWidth + gap))
      const rawColumnCount = Math.floor((width + gap) / (minCardWidth + gap));
      const maxCols = maxColumns ?? POKEMON_PICKER_DEFAULTS.MAX_COLUMNS;
      const columnCount = Math.max(
        POKEMON_PICKER_DEFAULTS.MIN_COLUMNS,
        Math.min(rawColumnCount, maxCols)
      );

      // Use fixed card width instead of stretching to fill space
      const columnWidth = minCardWidth;

      return {
        containerWidth: width,
        columnCount,
        columnWidth,
        rowHeight,
        gap,
      };
    },
    [maxColumns, minCardWidth, gap, rowHeight]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const width = entry.contentRect.width;
        setConfig(calculateGrid(width));
      }
    });

    resizeObserver.observe(container);

    // Initial calculation
    setConfig(calculateGrid(container.clientWidth));

    return () => resizeObserver.disconnect();
  }, [calculateGrid]);

  const rowCount = Math.ceil(itemCount / config.columnCount);

  return {
    containerRef,
    config,
    rowCount,
  };
}
