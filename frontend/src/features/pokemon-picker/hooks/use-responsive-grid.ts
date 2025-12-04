import { useState, useEffect, useCallback, useRef } from "react";
import { POKEMON_PICKER_DEFAULTS } from "../constants";
import type { ResponsiveGridConfig } from "../types";

interface UseResponsiveGridOptions {
  /** Fixed number of columns (overrides responsive behavior) */
  columns?: number;
  minCardWidth?: number;
  gap?: number;
  rowHeight?: number;
  itemCount: number;
}

export function useResponsiveGrid({
  columns,
  minCardWidth = POKEMON_PICKER_DEFAULTS.MIN_CARD_WIDTH,
  gap = POKEMON_PICKER_DEFAULTS.GAP,
  rowHeight = POKEMON_PICKER_DEFAULTS.ROW_HEIGHT,
  itemCount,
}: UseResponsiveGridOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ResponsiveGridConfig>({
    containerWidth: 0,
    columnCount: columns || 1,
    columnWidth: minCardWidth,
    rowHeight,
    gap,
  });

  const calculateGrid = useCallback(
    (width: number): ResponsiveGridConfig => {
      if (width === 0) {
        return {
          containerWidth: 0,
          columnCount: columns || 1,
          columnWidth: minCardWidth,
          rowHeight,
          gap,
        };
      }

      let columnCount: number;

      if (columns) {
        // Fixed columns mode
        columnCount = columns;
      } else {
        // Responsive mode - calculate how many columns can fit
        // Formula: width = (columnCount * columnWidth) + ((columnCount - 1) * gap)
        // Solving for columnCount: columnCount = floor((width + gap) / (minCardWidth + gap))
        const rawColumnCount = Math.floor((width + gap) / (minCardWidth + gap));
        columnCount = Math.max(
          POKEMON_PICKER_DEFAULTS.MIN_COLUMNS,
          Math.min(rawColumnCount, POKEMON_PICKER_DEFAULTS.MAX_COLUMNS)
        );
      }

      // Calculate actual column width to fill available space
      // columnWidth = (width - (columnCount - 1) * gap) / columnCount
      const columnWidth = Math.min(
        POKEMON_PICKER_DEFAULTS.MAX_CARD_WIDTH,
        Math.floor((width - (columnCount - 1) * gap) / columnCount)
      );

      return {
        containerWidth: width,
        columnCount,
        columnWidth,
        rowHeight,
        gap,
      };
    },
    [columns, minCardWidth, gap, rowHeight]
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
