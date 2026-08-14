import { describe, expect, it } from 'vitest';
import {
  renderPlanetPreviewImage,
  renderStarPreviewImage,
  renderStarSystemPreviewImage,
} from './astronomical_preview';
import type { RendererDecision } from './renderer_decision_types';
import type { AstronomicalBody, StarSystem } from '$lib/astronomical_bodies';

/**
 * The three entry points, driven on the Canvas2D backend with an explicit decision so no probe
 * runs and no GL context is needed. Which builder each one reaches for is not something the type
 * system can check — all three return an `AstronomicalScene` — so these tests hold that wiring,
 * along with what `reduced` quality does to the canvas.
 */
type Recorded = { op: string; args: unknown[] };

type FakeCanvas = {
  width: number;
  height: number;
  getContext: () => unknown;
  toDataURL: () => string;
  remove: () => void;
};

function fakeDocument() {
  const calls: Recorded[] = [];
  const canvases: FakeCanvas[] = [];

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

  // A canvas per `createElement`, because a reduced-quality render makes a second one to scale the
  // first onto, and the two have different sizes.
  function createCanvas(): FakeCanvas {
    const canvas: FakeCanvas = {
      width: 0,
      height: 0,
      getContext: () => ctx,
      toDataURL: () => 'data:image/png;base64,STUB',
      remove: () => {},
    };
    canvases.push(canvas);
    return canvas;
  }

  return {
    document: { createElement: () => createCanvas() } as unknown as Document,
    canvases,
    calls,
  };
}

function countOf(calls: Recorded[], op: string): number {
  return calls.filter((call) => call.op === op).length;
}

function callsOf(calls: Recorded[], op: string): Recorded[] {
  return calls.filter((call) => call.op === op);
}

const ON_CANVAS2D: RendererDecision = {
  backend: 'canvas2d',
  quality: 'full',
  reason: 'user_override',
};

const REDUCED_ON_CANVAS2D: RendererDecision = { ...ON_CANVAS2D, quality: 'reduced' };

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

describe('the planet entry point', () => {
  it('renders one planet at the canvas size it was given', () => {
    const fake = fakeDocument();
    const url = renderPlanetPreviewImage(
      fake.document,
      mockBody({}),
      256,
      128,
      'seed',
      ON_CANVAS2D,
    );

    expect(url).toBe('data:image/png;base64,STUB');
    expect(fake.canvases).toHaveLength(1);
    expect(fake.canvases[0].width).toBe(256);
    expect(fake.canvases[0].height).toBe(128);
    // Surface and terminator, and nothing else — a star would add a halo and a core.
    expect(countOf(fake.calls, 'createRadialGradient')).toBe(2);
  });

  it('is deterministic for a seed', () => {
    const a = fakeDocument();
    const b = fakeDocument();
    const body = mockBody({ has_ring_system: true });
    renderPlanetPreviewImage(a.document, body, 256, 128, 'seed', ON_CANVAS2D);
    renderPlanetPreviewImage(b.document, body, 256, 128, 'seed', ON_CANVAS2D);
    expect(a.calls).toEqual(b.calls);
  });

  it('draws a different planet for a different seed', () => {
    const a = fakeDocument();
    const b = fakeDocument();
    const body = mockBody({ has_ring_system: true });
    renderPlanetPreviewImage(a.document, body, 256, 128, 'one', ON_CANVAS2D);
    renderPlanetPreviewImage(b.document, body, 256, 128, 'two', ON_CANVAS2D);
    expect(a.calls).not.toEqual(b.calls);
  });
});

describe('the star entry point', () => {
  it('renders one star, halo and core', () => {
    const fake = fakeDocument();
    const url = renderStarPreviewImage(
      fake.document,
      mockBody({ radius: 695700 }),
      256,
      256,
      'seed',
      ON_CANVAS2D,
    );

    expect(url).toBe('data:image/png;base64,STUB');
    expect(countOf(fake.calls, 'createRadialGradient')).toBe(2);
    // A star has no rings and no banding, so nothing is stroked or clipped.
    expect(countOf(fake.calls, 'stroke')).toBe(0);
    expect(countOf(fake.calls, 'clip')).toBe(0);
  });
});

describe('the star system entry point', () => {
  const system = {
    name: 'S',
    description: '',
    stars: [mockBody({ radius: 695700 })],
    planets: [mockBody({}), mockBody({ classification: 'gas giant planet' })],
  } as unknown as StarSystem;

  it('renders every body in the system', () => {
    const fake = fakeDocument();
    const url = renderStarSystemPreviewImage(fake.document, system, 640, 160, 'seed', ON_CANVAS2D);

    expect(url).toBe('data:image/png;base64,STUB');
    // One star plus two planets, two radial gradients each.
    expect(countOf(fake.calls, 'createRadialGradient')).toBe(6);
    // Banding for the gas giant only.
    expect(countOf(fake.calls, 'createLinearGradient')).toBe(1);
  });

  it('returns an empty string for a system with no bodies', () => {
    const empty = { name: 'S', description: '', stars: [], planets: [] } as unknown as StarSystem;
    const fake = fakeDocument();

    expect(renderStarSystemPreviewImage(fake.document, empty, 640, 160, 'seed', ON_CANVAS2D)).toBe(
      '',
    );
    expect(fake.calls).toHaveLength(0);
  });
});

describe('reduced quality', () => {
  it('rasterizes at half linear scale and scales the result back up', () => {
    const fake = fakeDocument();
    const url = renderPlanetPreviewImage(
      fake.document,
      mockBody({}),
      512,
      256,
      'seed',
      REDUCED_ON_CANVAS2D,
    );

    expect(url).toBe('data:image/png;base64,STUB');
    // The render canvas is half size; the second one is the size the caller asked for.
    expect(fake.canvases.map((canvas) => [canvas.width, canvas.height])).toEqual([
      [256, 128],
      [512, 256],
    ]);
    expect(callsOf(fake.calls, 'scale')[0].args).toEqual([0.5, 0.5]);
    expect(callsOf(fake.calls, 'drawImage')[0].args.slice(1)).toEqual([0, 0, 512, 256]);
  });

  it('draws the same scene as full quality, only smaller', () => {
    // The scene is not rebuilt at the smaller size — the tier is a budget, not a second picture —
    // so the drawing is identical bar the context scale and the upscale at the end.
    const full = fakeDocument();
    const reduced = fakeDocument();
    const body = mockBody({ has_ring_system: true });
    renderPlanetPreviewImage(full.document, body, 512, 256, 'seed', ON_CANVAS2D);
    renderPlanetPreviewImage(reduced.document, body, 512, 256, 'seed', REDUCED_ON_CANVAS2D);

    const ignorable = new Set(['scale', 'drawImage', 'set:imageSmoothingEnabled']);
    const drawing = (calls: Recorded[]) => calls.filter((call) => !ignorable.has(call.op));

    expect(drawing(reduced.calls)).toEqual(drawing(full.calls));
  });
});
