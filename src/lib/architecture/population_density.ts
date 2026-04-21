import type { PopulationDensityBand } from './architectural_style_types';

/** Maps 0–1 scalar to bands: below 0.35 low, below 0.7 medium, else high. */
export function populationDensityToBand(value: number): PopulationDensityBand {
  const v = Math.min(1, Math.max(0, value));
  if (v < 0.35) {
    return 'low';
  }
  if (v < 0.7) {
    return 'medium';
  }
  return 'high';
}
