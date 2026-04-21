import { describe, expect, it } from 'vitest';
import { fbm, fbmMap } from './planet_canvas_surface_noise';

describe('planet_canvas_surface_noise', () => {
  it('fbm is deterministic for the same inputs', () => {
    const a = fbm(1.2, 0.3, -0.8, 4, 0.5, 2, 2);
    const b = fbm(1.2, 0.3, -0.8, 4, 0.5, 2, 2);
    expect(a).toBe(b);
  });

  it('fbmMap returns bounded scalar', () => {
    const m = fbmMap(0.1, 0.2, 0.3);
    expect(m).toBeGreaterThanOrEqual(0);
    expect(m).toBeLessThanOrEqual(1);
  });
});
