import { describe, expect, it } from 'vitest';
import { computeStarSystemLayout } from './star_system_layout';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';

function mockStarSystem(overrides: Partial<StarSystem>): StarSystem {
  return {
    name: 'Test',
    description: '',
    stars: [],
    planets: [],
    ...overrides,
  } as StarSystem;
}

describe('computeStarSystemLayout', () => {
  it('returns empty items when there are no bodies', () => {
    const r = computeStarSystemLayout(mockStarSystem({}), 400, 128);
    expect(r.items).toHaveLength(0);
    expect(r.totalUnits).toBe(0);
  });

  it('places one star at the center of its cell horizontally', () => {
    const system = mockStarSystem({
      stars: [
        {
          name: 'Sol',
          classification: 'G',
          radius: 695700,
          mass: 1,
          luminosity: 1,
          surface_temperature: 5778,
          description: '',
        },
      ],
      planets: [],
    });
    const r = computeStarSystemLayout(system, 400, 128);
    expect(r.items).toHaveLength(1);
    expect(r.items[0]?.kind).toBe('star');
    if (r.items[0]?.kind === 'star') {
      expect(r.items[0].centerX).toBeGreaterThan(0);
      expect(r.items[0].bodySizePixels).toBeGreaterThan(0);
    }
  });

  it('includes planets after stars with distinct positions', () => {
    const system = mockStarSystem({
      stars: [
        {
          name: 'Sol',
          classification: 'G',
          radius: 695700,
          mass: 1,
          luminosity: 1,
          surface_temperature: 5778,
          description: '',
        },
      ],
      planets: [
        {
          name: 'P1',
          classification: 'rocky planet',
          radius: 5000,
          mass: 1,
          orbital_distance: 1,
          orbital_period: 365,
          rotation_period: 24,
          surface_pressure: 1,
          surface_temperature: 280,
          gravity: 10,
          description: '',
          has_ring_system: false,
        },
      ],
    });
    const r = computeStarSystemLayout(system, 500, 128);
    expect(r.items.length).toBe(2);
    const star = r.items.find((i) => i.kind === 'star');
    const planet = r.items.find((i) => i.kind === 'planet');
    expect(star).toBeDefined();
    expect(planet).toBeDefined();
    if (star && planet && star.kind === 'star' && planet.kind === 'planet') {
      expect(planet.centerX).not.toBe(star.centerX);
      expect(planet.bodySizePixels).toBeLessThan(star.bodySizePixels);
    }
  });
});
