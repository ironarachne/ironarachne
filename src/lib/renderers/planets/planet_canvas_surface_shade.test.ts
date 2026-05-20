import { describe, expect, it } from 'vitest';
import { shadePlanetDiskPixel } from './planet_canvas_surface_shade';
import type { PlanetCanvasTheme } from '$lib/renderers/astronomical/planet_canvas_theme';

describe('shadePlanetDiskPixel', () => {
  const theme: PlanetCanvasTheme = {
    main: { r: 0.6, g: 0.4, b: 0.2 },
    band1: { r: 0.5, g: 0.35, b: 0.15 },
    band2: { r: 0.45, g: 0.3, b: 0.12 },
  };

  const params = {
    seedFloat: 42.5,
    lightDir: [0.45, 1.0, 0.5] as [number, number, number],
    cloudCoverage: 0.6,
    stormActivity: 0.45,
  };

  it('center pixel is lit (not black)', () => {
    const c = shadePlanetDiskPixel(0, 0, 50, theme, params, 'garden planet');
    const sum = c[0] + c[1] + c[2];
    expect(sum).toBeGreaterThan(0.15);
  });

  it('outside disk returns black', () => {
    const c = shadePlanetDiskPixel(60, 0, 50, theme, params, 'garden planet');
    expect(c[0] + c[1] + c[2]).toBe(0);
  });

  it('limb is darker than subsolar-ish point', () => {
    const bright = shadePlanetDiskPixel(-20, 0, 50, theme, params, 'garden planet');
    const limb = shadePlanetDiskPixel(0, 48, 50, theme, params, 'garden planet');
    const b1 = bright[0] + bright[1] + bright[2];
    const b2 = limb[0] + limb[1] + limb[2];
    expect(b2).toBeLessThan(b1 * 0.95);
  });

  it('gas giant shading differs from terrestrial for same seed and theme', () => {
    const px = 5;
    const py = 12;
    const g = shadePlanetDiskPixel(px, py, 50, theme, params, 'gas giant planet');
    const t = shadePlanetDiskPixel(px, py, 50, theme, params, 'garden planet');
    const diff = Math.abs(g[0] - t[0]) + Math.abs(g[1] - t[1]) + Math.abs(g[2] - t[2]);
    expect(diff).toBeGreaterThan(0.02);
  });
});
