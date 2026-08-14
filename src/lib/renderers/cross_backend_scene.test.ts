import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AstronomicalScene } from './astronomical_scene_types';
import type { RendererDecision } from './renderer_decision_types';
import type { AstronomicalBody, StarSystem } from '$lib/astronomical_bodies';

/**
 * The contract test the design document asks for: for a set of seeds, build the scene once and
 * assert both backends were handed the identical object.
 *
 * Equality is on the scene, never on the images. Two backends that draw the same data at different
 * fidelity are working as intended — decision 1 — while two backends handed different data are the
 * bug this library was reorganised to close: the renderer toggle changed the planet rather than
 * just how it was drawn.
 *
 * Both backends are stubbed at their draw step, so this runs with no canvas and no GL context and
 * pulls neither three nor the shaders into the test. What is exercised is the real dispatch in
 * `astronomical_preview.ts` and the real entry points behind it.
 */

const handed: { canvas2d: AstronomicalScene[]; webgl: AstronomicalScene[] } = {
  canvas2d: [],
  webgl: [],
};

vi.mock('$lib/renderers/canvas2d_scene_draw', () => ({
  renderSceneToDataUrl: (_document: Document, scene: AstronomicalScene) => {
    handed.canvas2d.push(scene);
    return 'data:image/png;base64,CANVAS2D';
  },
}));

vi.mock('$lib/renderers/webgl_scene_draw', () => ({
  renderSceneToDataUrl: (_document: Document, scene: AstronomicalScene) => {
    handed.webgl.push(scene);
    return 'data:image/png;base64,WEBGL';
  },
}));

const { renderPlanetPreviewImage, renderStarPreviewImage, renderStarSystemPreviewImage } =
  await import('$lib/renderers/astronomical_preview');

const SEEDS = ['alpha', 'bravo', 'charlie', 'delta', '', '42'];

const document = {} as unknown as Document;

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

const system = {
  name: 'S',
  description: '',
  stars: [mockBody({ radius: 695700 }), mockBody({ radius: 340000, surface_temperature: 3200 })],
  planets: [
    mockBody({}),
    mockBody({ classification: 'gas giant planet', radius: 69911, has_ring_system: true }),
    mockBody({ classification: 'ice planet', radius: 2440 }),
  ],
} as unknown as StarSystem;

/**
 * The decision each backend is driven with. Both are `user_override`, which is the one reason a
 * caller can produce deliberately, and both are `full`, so the only thing that differs between the
 * two runs is the backend.
 */
function decisionFor(backend: 'canvas2d' | 'webgl'): RendererDecision {
  return { backend, quality: 'full', reason: 'user_override' };
}

/** The two calls a backend pair makes, and the two scenes they were handed. */
function scenesFor(
  render: (decision: RendererDecision) => string,
): [AstronomicalScene, AstronomicalScene] {
  render(decisionFor('canvas2d'));
  render(decisionFor('webgl'));
  expect(handed.canvas2d).toHaveLength(1);
  expect(handed.webgl).toHaveLength(1);
  return [handed.canvas2d[0], handed.webgl[0]];
}

beforeEach(() => {
  handed.canvas2d = [];
  handed.webgl = [];
});

describe.each(SEEDS)('for seed "%s"', (seed) => {
  it('hands both backends the same planet scene', () => {
    const [canvas2d, webgl] = scenesFor((decision) =>
      renderPlanetPreviewImage(
        document,
        mockBody({ classification: 'gas giant planet', has_ring_system: true }),
        512,
        512,
        seed,
        decision,
      ),
    );

    expect(canvas2d).toEqual(webgl);
  });

  it('hands both backends the same star scene', () => {
    const [canvas2d, webgl] = scenesFor((decision) =>
      renderStarPreviewImage(document, mockBody({ radius: 695700 }), 512, 512, seed, decision),
    );

    expect(canvas2d).toEqual(webgl);
  });

  it('hands both backends the same star system scene', () => {
    const [canvas2d, webgl] = scenesFor((decision) =>
      renderStarSystemPreviewImage(document, system, 640, 160, seed, decision),
    );

    expect(canvas2d).toEqual(webgl);
  });
});

describe('the scene both backends get', () => {
  it('does not depend on the canvas size for anything but the canvas size', () => {
    // The background star count is `floor(area / pixelsPerStar)`, and the Canvas2D path used to
    // draw those stars from the same RNG as the rings — so the same seed at two preview sizes gave
    // the same planet a different ring. Nothing but the background may move with the canvas now.
    const wide = scenesFor((decision) =>
      renderPlanetPreviewImage(
        document,
        mockBody({ has_ring_system: true }),
        512,
        512,
        'seed',
        decision,
      ),
    )[0];
    handed.canvas2d = [];
    handed.webgl = [];
    const narrow = scenesFor((decision) =>
      renderPlanetPreviewImage(
        document,
        mockBody({ has_ring_system: true }),
        256,
        256,
        'seed',
        decision,
      ),
    )[0];

    expect(narrow.bodies[0]).toEqual({
      ...wide.bodies[0],
      centerX: 128,
      centerY: 128,
      radiusPx: 64,
    });
  });

  it('is what each entry point builds, not a scene of some other kind', () => {
    const planet = scenesFor((decision) =>
      renderPlanetPreviewImage(document, mockBody({}), 512, 512, 'seed', decision),
    )[0];
    handed.canvas2d = [];
    handed.webgl = [];
    const star = scenesFor((decision) =>
      renderStarPreviewImage(document, mockBody({ radius: 695700 }), 512, 512, 'seed', decision),
    )[0];
    handed.canvas2d = [];
    handed.webgl = [];
    const wholeSystem = scenesFor((decision) =>
      renderStarSystemPreviewImage(document, system, 640, 160, 'seed', decision),
    )[0];

    expect(planet.bodies.map((body) => body.kind)).toEqual(['planet']);
    expect(star.bodies.map((body) => body.kind)).toEqual(['star']);
    expect(wholeSystem.bodies.map((body) => body.kind)).toEqual([
      'star',
      'star',
      'planet',
      'planet',
      'planet',
    ]);
  });
});
