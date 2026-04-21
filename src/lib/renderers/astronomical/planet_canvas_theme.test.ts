import { describe, expect, it } from 'vitest';
import { resolvePlanetCanvasTheme } from './planet_canvas_theme';

describe('resolvePlanetCanvasTheme', () => {
  it('uses fixed palette for ocean planet', () => {
    const t = resolvePlanetCanvasTheme('ocean planet', 'seed-a');
    expect(t.main.b).toBeGreaterThan(t.main.r);
  });

  it('uses random palette for gas giant seeded consistently', () => {
    const a = resolvePlanetCanvasTheme('gas giant planet', 'same');
    const b = resolvePlanetCanvasTheme('gas giant planet', 'same');
    expect(a.main.r).toBe(b.main.r);
  });

  it('falls back to random triplet for unknown classification', () => {
    const t = resolvePlanetCanvasTheme('unknown planet type', 'fallback-seed');
    expect(t.main.r).toBeGreaterThanOrEqual(0.1);
    expect(t.main.r).toBeLessThanOrEqual(0.8);
  });
});
