import { describe, expect, it } from 'vitest';
import { resolvePlanetPalette } from './planet_palette';

describe('resolvePlanetPalette', () => {
  it('uses fixed palette for ocean planet', () => {
    const t = resolvePlanetPalette('ocean planet', 'seed-a');
    expect(t.main.b).toBeGreaterThan(t.main.r);
  });

  it('uses random palette for gas giant seeded consistently', () => {
    const a = resolvePlanetPalette('gas giant planet', 'same');
    const b = resolvePlanetPalette('gas giant planet', 'same');
    expect(a.main.r).toBe(b.main.r);
  });

  it('falls back to random triplet for unknown classification', () => {
    const t = resolvePlanetPalette('unknown planet type', 'fallback-seed');
    expect(t.main.r).toBeGreaterThanOrEqual(0.1);
    expect(t.main.r).toBeLessThanOrEqual(0.8);
  });
});
