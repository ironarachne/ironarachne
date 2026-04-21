import { describe, expect, it } from 'vitest';
import { getRgbColorsFromStarSurfaceTemperature } from './star_surface_colors';

describe('getRgbColorsFromStarSurfaceTemperature', () => {
  it('returns cool M-star reds for low temperature', () => {
    const c = getRgbColorsFromStarSurfaceTemperature(3000);
    expect(c[0].r).toBe(1);
    expect(c[0].g).toBe(0);
    expect(c[0].b).toBe(0);
  });

  it('returns white-hot band for Sun-like temperature', () => {
    const c = getRgbColorsFromStarSurfaceTemperature(5778);
    expect(c[0].r).toBe(1);
    expect(c[0].g).toBeGreaterThan(0.9);
  });

  it('returns blue presets for very hot stars', () => {
    const c = getRgbColorsFromStarSurfaceTemperature(40000);
    expect(c[0].b).toBeGreaterThan(c[0].r);
  });
});
