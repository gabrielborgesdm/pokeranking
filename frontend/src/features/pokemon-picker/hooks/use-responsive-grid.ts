import { useState, useEffect, useCallback, useRef } from "react";
import { POKEMON_PICKER_DEFAULTS, POKEMON_PICKER_COMPACT } from "../constants";
import { useScreenSize } from "@/providers/screen-size-provider";
import type { ResponsiveGridConfig } from "../types";

interface UseResponsiveGridOptions {
  /** Maximum number of columns (caps responsive behavior) */
  maxColumns?: number;
  minCardWidth?: number;
  gap?: number;
  rowHeight?: number;
  itemCount: number;
  /** Horizontal padding to account for when calculating available width */
  paddingX?: number;
}

export function useResponsiveGrid({
  maxColumns,
  minCardWidth: minCardWidthProp,
  gap: gapProp,
  rowHeight: rowHeightProp,
  itemCount,
  paddingX = 0,
}: UseResponsiveGridOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Use small screen detection for responsive grid sizing
  const { isSmall } = useScreenSize();
  const [config, setConfig] = useState<ResponsiveGridConfig>({
    containerWidth: 0,
    columnCount: 1,
    columnWidth: POKEMON_PICKER_DEFAULTS.MIN_CARD_WIDTH,
    rowHeight: POKEMON_PICKER_DEFAULTS.ROW_HEIGHT,
    gap: POKEMON_PICKER_DEFAULTS.GAP,
  });

  const calculateGrid = useCallback(
    (width: number): ResponsiveGridConfig => {
      // Use small screen or desktop defaults based on viewport breakpoint
      const minCardWidth =
        minCardWidthProp ??
        (isSmall
          ? POKEMON_PICKER_COMPACT.MIN_CARD_WIDTH
          : POKEMON_PICKER_DEFAULTS.MIN_CARD_WIDTH);
      const gap =
        gapProp ??
        (isSmall ? POKEMON_PICKER_COMPACT.GAP : POKEMON_PICKER_DEFAULTS.GAP);
      const rowHeight =
        rowHeightProp ??
        (isSmall
          ? POKEMON_PICKER_COMPACT.ROW_HEIGHT
          : POKEMON_PICKER_DEFAULTS.ROW_HEIGHT);

      if (width === 0) {
        return {
          containerWidth: 0,
          columnCount: 1,
          columnWidth: minCardWidth,
          rowHeight,
          gap,
        };
      }

      // Account for horizontal padding when calculating available width
      const availableWidth = width - paddingX * 2;

      // Responsive mode - calculate how many columns can fit
      // Formula: availableWidth = (columnCount * columnWidth) + ((columnCount - 1) * gap)
      // Solving for columnCount: columnCount = floor((availableWidth + gap) / (minCardWidth + gap))
      const rawColumnCount = Math.floor(
        (availableWidth + gap) / (minCardWidth + gap)
      );
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
    [maxColumns, minCardWidthProp, gapProp, rowHeightProp, paddingX, isSmall]
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

  // Calculate the actual content width (cards + gaps, excluding padding)
  const gridContentWidth =
    config.columnCount * config.columnWidth +
    (config.columnCount - 1) * config.gap;

  return {
    containerRef,
    config,
    rowCount,
    gridContentWidth,
    isSmall,
  };
}
