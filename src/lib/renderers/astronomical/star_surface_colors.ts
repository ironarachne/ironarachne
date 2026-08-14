import type { RGBColor } from '$lib/graphics';

/** Photosphere, corona, and glow samples (same bucketing as legacy star fragment shader). */
export function getRgbColorsFromStarSurfaceTemperature(
  surfaceTemperatureK: number,
): [RGBColor, RGBColor, RGBColor] {
  const t = surfaceTemperatureK;
  if (t < 3700) {
    return [
      { r: 1.0, g: 0.0, b: 0.0 },
      { r: 0.5, g: 0.0, b: 0.0 },
      { r: 1.0, g: 0.0, b: 0.0 },
    ];
  }
  if (t < 5200) {
    return [
      { r: 1.0, g: 0.39, b: 0.0 },
      { r: 0.7, g: 0.13, b: 0.0 },
      { r: 1.0, g: 1.0, b: 0.0 },
    ];
  }
  if (t < 6000) {
    return [
      { r: 1.0, g: 1.0, b: 0.0 },
      { r: 0.55, g: 0.35, b: 0.0 },
      { r: 1.0, g: 1.0, b: 0.5 },
    ];
  }
  if (t < 7500) {
    return [
      { r: 1.0, g: 1.0, b: 0.9 },
      { r: 0.95, g: 0.95, b: 0.7 },
      { r: 1.0, g: 1.0, b: 1.0 },
    ];
  }
  if (t < 10000) {
    return [
      { r: 1.0, g: 1.0, b: 1.0 },
      { r: 0.95, g: 0.95, b: 0.95 },
      { r: 1.0, g: 1.0, b: 1.0 },
    ];
  }
  if (t < 30000) {
    return [
      { r: 0.85, g: 0.9, b: 1.0 },
      { r: 0.7, g: 0.75, b: 0.95 },
      { r: 1.0, g: 1.0, b: 1.0 },
    ];
  }
  return [
    { r: 0.0, g: 0.0, b: 1.0 },
    { r: 0.0, g: 0.0, b: 0.75 },
    { r: 0.0, g: 0.2, b: 1.0 },
  ];
}
