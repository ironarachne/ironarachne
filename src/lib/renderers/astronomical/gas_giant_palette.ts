import { RNG } from '@ironarachne/rng';
import type { RGBColor } from '$lib/graphics';

export function getRandomGasGiantRgbTriplet(seed: string): [RGBColor, RGBColor, RGBColor] {
  const rng = new RNG(seed);
  return [
    { r: rng.float(0.1, 0.8), g: rng.float(0.1, 0.8), b: rng.float(0.1, 0.8) },
    { r: rng.float(0.1, 0.8), g: rng.float(0.1, 0.8), b: rng.float(0.1, 0.8) },
    { r: rng.float(0.1, 0.8), g: rng.float(0.1, 0.8), b: rng.float(0.1, 0.8) },
  ];
}
