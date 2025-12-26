import type { Zone } from './types';

/**
 * Default zones for ranking display
 * Works well for ~1000+ Pokemon with 6 tiers
 */
export const DEFAULT_ZONES: readonly Zone[] = [
  { name: 'S', interval: [1, 10], color: '#ef4444' },
  { name: 'A', interval: [11, 150], color: '#f97316' },
  { name: 'B', interval: [151, 400], color: '#eab308' },
  { name: 'C', interval: [401, 700], color: '#22c55e' },
  { name: 'D', interval: [701, 1000], color: '#3b82f6' },
  { name: 'F', interval: [1001, null], color: '#6b7280' },
] as const;
