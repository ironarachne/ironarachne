import { RNG } from '@ironarachne/rng';
import type RGBColor from '$lib/graphics/rgb_color';
import { getRandomGasGiantRgbTriplet } from '$lib/renderers/astronomical/gas_giant_palette';

export type PlanetCanvasTheme = {
  main: RGBColor;
  band1: RGBColor;
  band2: RGBColor;
};

/** Deterministic-ish accent colors for rings (0–1). */
export function randomRingRgb(seed: string): RGBColor {
  const rng = new RNG(`${seed}:ring`);
  return { r: rng.float(0.6, 0.9), g: rng.float(0.6, 0.9), b: rng.float(0.6, 0.9) };
}

/**
 * Base palettes by shader classification name; gas giants use the same RNG scheme as WebGL previews.
 */
export function resolvePlanetCanvasTheme(classification: string, seed: string): PlanetCanvasTheme {
  if (classification === 'gas giant planet') {
    const [main, band1, band2] = getRandomGasGiantRgbTriplet(seed);
    return { main, band1, band2 };
  }

  const fixed = classificationTheme(classification);
  if (fixed !== undefined) return fixed;

  const [main, band1, band2] = getRandomGasGiantRgbTriplet(seed);
  return { main, band1, band2 };
}

function classificationTheme(classification: string): PlanetCanvasTheme | undefined {
  switch (classification) {
    case 'arid planet':
      return {
        main: { r: 0.75, g: 0.55, b: 0.28 },
        band1: { r: 0.55, g: 0.38, b: 0.18 },
        band2: { r: 0.42, g: 0.32, b: 0.2 },
      };
    case 'barren planet':
      return {
        main: { r: 0.45, g: 0.42, b: 0.4 },
        band1: { r: 0.3, g: 0.28, b: 0.26 },
        band2: { r: 0.55, g: 0.52, b: 0.48 },
      };
    case 'garden planet':
      return {
        main: { r: 0.2, g: 0.55, b: 0.35 },
        band1: { r: 0.15, g: 0.4, b: 0.55 },
        band2: { r: 0.35, g: 0.65, b: 0.4 },
      };
    case 'ice planet':
      return {
        main: { r: 0.85, g: 0.92, b: 0.95 },
        band1: { r: 0.55, g: 0.72, b: 0.85 },
        band2: { r: 0.7, g: 0.82, b: 0.9 },
      };
    case 'jungle planet':
      return {
        main: { r: 0.12, g: 0.42, b: 0.18 },
        band1: { r: 0.25, g: 0.5, b: 0.22 },
        band2: { r: 0.08, g: 0.3, b: 0.35 },
      };
    case 'ocean planet':
      return {
        main: { r: 0.08, g: 0.35, b: 0.65 },
        band1: { r: 0.05, g: 0.25, b: 0.5 },
        band2: { r: 0.2, g: 0.55, b: 0.75 },
      };
    case 'swamp planet':
      return {
        main: { r: 0.25, g: 0.35, b: 0.22 },
        band1: { r: 0.35, g: 0.42, b: 0.2 },
        band2: { r: 0.18, g: 0.28, b: 0.25 },
      };
    case 'toxic planet':
      return {
        main: { r: 0.45, g: 0.25, b: 0.55 },
        band1: { r: 0.35, g: 0.55, b: 0.25 },
        band2: { r: 0.25, g: 0.35, b: 0.2 },
      };
    case 'volcanic planet':
      return {
        main: { r: 0.55, g: 0.12, b: 0.08 },
        band1: { r: 0.35, g: 0.1, b: 0.05 },
        band2: { r: 0.75, g: 0.35, b: 0.1 },
      };
    default:
      return undefined;
  }
}
