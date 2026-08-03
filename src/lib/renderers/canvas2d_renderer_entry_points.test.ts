import { describe, expect, it } from 'vitest';
import { render as renderPlanet } from '$lib/renderers/planets/canvas2d_planet_renderer';
import { render as renderStar } from '$lib/renderers/stars/canvas2d_star_renderer';
import { render as renderStarSystem } from '$lib/renderers/star_systems/canvas2d_star_system_renderer';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';

/**
 * The three entry points are pure delegation — build the right scene, hand it to the Canvas2D
 * walker. These tests hold that wiring: which builder each one reaches for is not something the
 * type system can check, since all three builders return an `AstronomicalScene`.
 */
type Recorded = { op: string; args: unknown[] };

function fakeDocument() {
  const calls: Recorded[] = [];
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (_t, prop: string) => {
      if (prop === 'canvas') return { width: 0, height: 0 };
      if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
        return (...args: unknown[]) => {
          calls.push({ op: prop, args });
          // The stops go into the same list, so two runs compare by value. Returning a stub with
          // its own `addColorStop` would compare by function identity and never be equal.
          return {
            addColorStop: (offset: number, color: string) =>
              calls.push({ op: 'addColorStop', args: [offset, color] }),
          };
        };
      }
      return (...args: unknown[]) => calls.push({ op: prop, args });
    },
    set: (_t, prop: string, value: unknown) => {
      calls.push({ op: `set:${prop}`, args: [typeof value === 'object' ? '[gradient]' : value] });
      return true;
    },
  });

  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    toDataURL: () => 'data:image/png;base64,STUB',
    remove: () => {},
  };

  return {
    document: { createElement: () => canvas } as unknown as Document,
    canvas,
    calls,
  };
}

function countOf(calls: Recorded[], op: string): number {
  return calls.filter((call) => call.op === op).length;
}

function mockBody(overrides: Partial<AstronomicalBody>): AstronomicalBody {
  return {
    name: 'Test',
    description: '',
    classification: 'ocean planet',
    radius: 6371,
    surface_temperature: 5778,
    has_ring_system: false,
    ...overrides,
  } as unknown as AstronomicalBody;
}

describe('the Canvas2D planet renderer', () => {
  it('renders one planet at the canvas size it was given', () => {
    const fake = fakeDocument();
    const url = renderPlanet(fake.document, mockBody({}), 256, 128, 'seed');

    expect(url).toBe('data:image/png;base64,STUB');
    expect(fake.canvas.width).toBe(256);
    expect(fake.canvas.height).toBe(128);
    // Surface and terminator, and nothing else — a star would add a halo and a core.
    expect(countOf(fake.calls, 'createRadialGradient')).toBe(2);
  });

  it('is deterministic for a seed', () => {
    const a = fakeDocument();
    const b = fakeDocument();
    renderPlanet(a.document, mockBody({ has_ring_system: true }), 256, 128, 'seed');
    renderPlanet(b.document, mockBody({ has_ring_system: true }), 256, 128, 'seed');
    expect(a.calls).toEqual(b.calls);
  });

  it('draws a different planet for a different seed', () => {
    const a = fakeDocument();
    const b = fakeDocument();
    renderPlanet(a.document, mockBody({ has_ring_system: true }), 256, 128, 'one');
    renderPlanet(b.document, mockBody({ has_ring_system: true }), 256, 128, 'two');
    expect(a.calls).not.toEqual(b.calls);
  });
});

describe('the Canvas2D star renderer', () => {
  it('renders one star, halo and core', () => {
    const fake = fakeDocument();
    const url = renderStar(fake.document, mockBody({ radius: 695700 }), 256, 256, 'seed');

    expect(url).toBe('data:image/png;base64,STUB');
    expect(countOf(fake.calls, 'createRadialGradient')).toBe(2);
    // A star has no rings and no banding, so nothing is stroked or clipped.
    expect(countOf(fake.calls, 'stroke')).toBe(0);
    expect(countOf(fake.calls, 'clip')).toBe(0);
  });
});

describe('the Canvas2D star system renderer', () => {
  const system = {
    name: 'S',
    description: '',
    stars: [mockBody({ radius: 695700 })],
    planets: [mockBody({}), mockBody({ classification: 'gas giant planet' })],
  } as unknown as StarSystem;

  it('renders every body in the system', () => {
    const fake = fakeDocument();
    const url = renderStarSystem(fake.document, system, 640, 160, 'seed');

    expect(url).toBe('data:image/png;base64,STUB');
    // One star plus two planets, two radial gradients each.
    expect(countOf(fake.calls, 'createRadialGradient')).toBe(6);
    // Banding for the gas giant only.
    expect(countOf(fake.calls, 'createLinearGradient')).toBe(1);
  });

  it('returns an empty string for a system with no bodies', () => {
    const empty = { name: 'S', description: '', stars: [], planets: [] } as unknown as StarSystem;
    const fake = fakeDocument();

    expect(renderStarSystem(fake.document, empty, 640, 160, 'seed')).toBe('');
    expect(fake.calls).toHaveLength(0);
  });
});
