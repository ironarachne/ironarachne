import { describe, expect, it } from 'vitest';
import { drawScene, renderSceneToDataUrl } from '$lib/renderers/canvas2d_scene_draw';
import { drawPlanetSpherePatch } from '$lib/renderers/planets/canvas2d_planet_draw';
import { buildStarSystemScene } from '$lib/renderers/astronomical_scene';
import type {
  AstronomicalScene,
  ScenePlanet,
  SceneStar,
} from '$lib/renderers/astronomical_scene_types';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';

/**
 * A 2D context that records what was drawn and the style state in force at the time. The backend
 * only ever calls context methods and assigns style properties, so recording both is enough to
 * assert on the drawing without a DOM — the technique from
 * `src/lib/dungeon/render/classic_module_map.test.ts`, extended to capture gradients, since this
 * backend says almost everything through them.
 */
type Gradient = {
  kind: 'radial' | 'linear';
  args: number[];
  stops: Array<{ offset: number; color: string }>;
  addColorStop: (offset: number, color: string) => void;
};

type DrawCall = {
  op: string;
  args: number[];
  fillStyle: string | Gradient;
  strokeStyle: string;
  globalAlpha: number;
};

function isGradient(value: string | Gradient): value is Gradient {
  return typeof value !== 'string';
}

function makeGradient(kind: 'radial' | 'linear', args: number[]): Gradient {
  const gradient: Gradient = {
    kind,
    args,
    stops: [],
    addColorStop(offset, color) {
      gradient.stops.push({ offset, color });
    },
  };
  return gradient;
}

function recordingContext(width = 512, height = 512) {
  const calls: DrawCall[] = [];
  const state = {
    fillStyle: '' as string | Gradient,
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    globalAlpha: 1,
  };

  const record = (op: string, args: unknown[]) => {
    calls.push({
      op,
      args: args.filter((a): a is number => typeof a === 'number'),
      fillStyle: state.fillStyle,
      strokeStyle: state.strokeStyle,
      globalAlpha: state.globalAlpha,
    });
  };

  const ctx = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (prop === 'canvas') return { width, height };
      if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
        return (...args: unknown[]) => {
          record(prop, args);
          return makeGradient(
            prop === 'createRadialGradient' ? 'radial' : 'linear',
            args.filter((a): a is number => typeof a === 'number'),
          );
        };
      }
      if (prop === 'getImageData') {
        return (_x: number, _y: number, w: number, h: number) => {
          record('getImageData', [_x, _y, w, h]);
          return { data: new Uint8ClampedArray(w * h * 4) };
        };
      }
      if (prop in state) return state[prop as keyof typeof state];
      return (...args: unknown[]) => record(prop, args);
    },
    set(_target, prop: string, value: unknown) {
      if (prop in state) {
        (state as Record<string, unknown>)[prop] = value;
      }
      record(`set:${prop}`, [value]);
      return true;
    },
  });

  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

function opsOf(calls: DrawCall[], op: string): DrawCall[] {
  return calls.filter((call) => call.op === op);
}

function indexOfOp(calls: DrawCall[], op: string, nth = 0): number {
  return calls
    .map((call) => call.op)
    .reduce<number[]>((found, current, index) => {
      if (current === op) found.push(index);
      return found;
    }, [])[nth];
}

const PALETTE = {
  main: { r: 0.4, g: 0.5, b: 0.6 },
  band1: { r: 0.2, g: 0.3, b: 0.4 },
  band2: { r: 0.6, g: 0.7, b: 0.8 },
};

const SHADING = {
  seedFloat: 42.5,
  lightDir: [0.5, 1.0, 0.5] as [number, number, number],
  cloudCoverage: 0.6,
  stormActivity: 0.4,
};

function scenePlanet(overrides: Partial<ScenePlanet> = {}): ScenePlanet {
  return {
    kind: 'planet',
    centerX: 100,
    centerY: 120,
    radiusPx: 40,
    classification: 'ocean planet',
    isGasGiant: false,
    palette: PALETTE,
    shading: SHADING,
    ...overrides,
  };
}

function sceneStar(overrides: Partial<SceneStar> = {}): SceneStar {
  return {
    kind: 'star',
    centerX: 60,
    centerY: 70,
    radiusPx: 20,
    photosphere: { r: 1, g: 1, b: 0 },
    corona: { r: 0.55, g: 0.35, b: 0 },
    glow: { r: 1, g: 1, b: 0.5 },
    coronaWidthPx: 4,
    ...overrides,
  };
}

function scene(overrides: Partial<AstronomicalScene> = {}): AstronomicalScene {
  return {
    width: 512,
    height: 256,
    seed: 'seed',
    quality: 'full',
    background: { fillColor: '#05060a', stars: [] },
    bodies: [],
    ...overrides,
  };
}

describe('the background', () => {
  it('fills the whole canvas with the scene fill colour, first', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ background: { fillColor: '#123456', stars: [] } }));

    const fill = opsOf(calls, 'fillRect')[0];
    expect(fill.fillStyle).toBe('#123456');
    expect(fill.args).toEqual([0, 0, 512, 256]);
  });

  it('draws one arc per background star, at the position the scene gave it', () => {
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({
        background: {
          fillColor: '#000',
          stars: [
            { x: 10, y: 20, radiusPx: 0.5, alpha: 0.3 },
            { x: 30, y: 40, radiusPx: 0.8, alpha: 0.5 },
          ],
        },
      }),
    );

    const arcs = opsOf(calls, 'arc');
    expect(arcs).toHaveLength(2);
    expect(arcs[0].args).toEqual([10, 20, 0.5, 0, Math.PI * 2]);
    expect(arcs[1].args).toEqual([30, 40, 0.8, 0, Math.PI * 2]);
  });

  it('carries each star’s alpha into its fill colour', () => {
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({
        background: { fillColor: '#000', stars: [{ x: 1, y: 2, radiusPx: 1, alpha: 0.42 }] },
      }),
    );

    // The scene has no per-star colour, so the backend supplies one and varies only the alpha.
    expect(opsOf(calls, 'arc')[0].fillStyle).toBe('rgba(210,220,250,0.42)');
  });

  it('draws no stars for an empty starfield', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({}));
    expect(opsOf(calls, 'arc')).toHaveLength(0);
  });

  it('draws the background before any body', () => {
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({
        background: { fillColor: '#000', stars: [{ x: 1, y: 2, radiusPx: 1, alpha: 0.3 }] },
        bodies: [scenePlanet()],
      }),
    );

    expect(indexOfOp(calls, 'fillRect')).toBeLessThan(indexOfOp(calls, 'createRadialGradient'));
  });
});

describe('drawing a star', () => {
  it('draws a halo out to the corona width and a core at the disk radius', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [sceneStar()] }));

    const gradients = opsOf(calls, 'createRadialGradient');
    expect(gradients).toHaveLength(2);
    // haloR = radiusPx + coronaWidthPx * 4 = 20 + 16 = 36
    expect(gradients[0].args).toEqual([60, 70, 4, 60, 70, 36]);
    // The core highlight is offset up and to the left of centre.
    expect(gradients[1].args).toEqual([56, 67, 0, 60, 70, 20]);
  });

  it('fades the halo to transparent at its edge', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [sceneStar()] }));

    const halo = opsOf(calls, 'fill')[0].fillStyle;
    expect(isGradient(halo)).toBe(true);
    if (!isGradient(halo)) return;
    expect(halo.stops.map((stop) => stop.offset)).toEqual([0, 0.35, 0.65, 1]);
    expect(halo.stops[0].color).toBe('rgba(255,255,0,1)');
    expect(halo.stops[3].color).toBe('rgba(0,0,0,0)');
  });

  it('lightens the core toward the highlight and darkens it at the limb', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [sceneStar()] }));

    const core = opsOf(calls, 'fill')[1].fillStyle;
    if (!isGradient(core)) throw new Error('expected a gradient');
    expect(core.stops[0].color).toBe('rgba(255,255,64,1)'); // photosphere lightened by 0.25
    expect(core.stops[1].color).toBe('rgba(255,255,0,1)');
    expect(core.stops[2].color).toBe('rgba(166,166,0,1)'); // darkened by 0.35
  });

  it('draws a star with no gradients other than its own two', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [sceneStar(), sceneStar({ centerX: 200 })] }));
    expect(opsOf(calls, 'createRadialGradient')).toHaveLength(4);
  });
});

describe('drawing a planet', () => {
  it('draws a surface gradient and a terminator gradient over the disk', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet()] }));

    const gradients = opsOf(calls, 'createRadialGradient');
    expect(gradients).toHaveLength(2);
    // highlight = (100 + 40 * 0.5 * 0.8, 120 - 40 * 1.0 * 0.4) = (116, 104)
    expect(gradients[0].args).toEqual([116, 104, 0, 100, 120, 40]);
    // The terminator starts at 0.35 of the radius from the same highlight.
    expect(gradients[1].args).toEqual([116, 104, 14, 100, 120, 40]);
  });

  it('runs the surface from a lightened highlight to a darkened limb', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet()] }));

    const surface = opsOf(calls, 'fill')[0].fillStyle;
    if (!isGradient(surface)) throw new Error('expected a gradient');
    expect(surface.stops).toEqual([
      { offset: 0, color: 'rgba(158,184,209,1)' }, // main lightened by 0.22
      { offset: 0.55, color: 'rgba(102,128,153,1)' }, // main
      { offset: 1, color: 'rgba(0,20,46,1)' }, // main darkened by 0.42
    ]);
  });

  it('fades the terminator from clear at the highlight to dark at the limb', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet()] }));

    const terminator = opsOf(calls, 'fill')[1].fillStyle;
    if (!isGradient(terminator)) throw new Error('expected a gradient');
    expect(terminator.stops).toEqual([
      { offset: 0, color: 'rgba(0,0,0,0)' },
      { offset: 1, color: 'rgba(0,0,0,0.55)' },
    ]);
  });

  it('places the highlight according to the scene’s light direction', () => {
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({
        bodies: [scenePlanet({ shading: { ...SHADING, lightDir: [0.3, 1.0, 0.5] } })],
      }),
    );
    // 100 + 40 * 0.3 * 0.8 = 109.6, against 116 for lightDir[0] = 0.5.
    expect(opsOf(calls, 'createRadialGradient')[0].args[0]).toBeCloseTo(109.6, 10);
  });

  it('lights the planet from the same side the shader does', () => {
    // The composition contract, and the one part of the lighting this path reproduces. The shader
    // builds its normal as vec3(x, y, z) from pixelCoords whose y increases UP the screen, so a
    // positive light vector lights the upper right of the disk. Canvas y increases DOWN. Getting
    // either sign wrong mirrors the illumination when the renderer toggle is flipped, which is the
    // exact class of divergence this design exists to close.
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({ bodies: [scenePlanet({ shading: { ...SHADING, lightDir: [0.6, 1, 0.5] } })] }),
    );

    const [highlightX, highlightY] = opsOf(calls, 'createRadialGradient')[0].args;
    expect(highlightX).toBeGreaterThan(100); // right of centre, as lightDir[0] > 0
    expect(highlightY).toBeLessThan(120); // above centre, as lightDir[1] > 0
  });

  it('never touches the pixel buffer', () => {
    // Decision 3: the per-pixel FBM path is gone from the default fallback. It cost 1–4.7 seconds
    // per planet on the main thread, on exactly the hardware Canvas2D exists to serve.
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet(), scenePlanet({ isGasGiant: true })] }));

    expect(opsOf(calls, 'getImageData')).toHaveLength(0);
    expect(opsOf(calls, 'putImageData')).toHaveLength(0);
  });
});

describe('gas giant banding', () => {
  it('clips to the disk and lays a vertical gradient across it', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ isGasGiant: true })] }));

    expect(opsOf(calls, 'clip')).toHaveLength(1);
    const bands = opsOf(calls, 'createLinearGradient')[0];
    // Pole to pole: centre x, centre y ± radius.
    expect(bands.args).toEqual([100, 80, 100, 160]);
    expect(opsOf(calls, 'fillRect')[1].args).toEqual([60, 80, 80, 80]);
  });

  it('draws no bands on a terrestrial planet', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ isGasGiant: false })] }));

    expect(opsOf(calls, 'clip')).toHaveLength(0);
    expect(opsOf(calls, 'createLinearGradient')).toHaveLength(0);
  });

  it('sets the band strength from storm activity', () => {
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({
        bodies: [scenePlanet({ isGasGiant: true, shading: { ...SHADING, stormActivity: 0.6 } })],
      }),
    );
    // 0.25 + 0.6 * 0.45 = 0.52
    expect(opsOf(calls, 'fillRect')[1].globalAlpha).toBeCloseTo(0.52, 10);
  });

  it('rotates the band sequence by the seed, so two gas giants are not twins', () => {
    const stopsFor = (seedFloat: number) => {
      const { ctx, calls } = recordingContext();
      drawScene(
        ctx,
        scene({ bodies: [scenePlanet({ isGasGiant: true, shading: { ...SHADING, seedFloat } })] }),
      );
      const bands = opsOf(calls, 'fillRect')[1].fillStyle;
      if (!isGradient(bands)) throw new Error('expected a gradient');
      return bands.stops.map((stop) => stop.color);
    };

    expect(stopsFor(42.5)).not.toEqual(stopsFor(42.0));
    // Seven evenly spaced stops either way, drawn from the palette's three colours.
    expect(stopsFor(42.5)).toHaveLength(7);
    expect(new Set(stopsFor(42.5)).size).toBeLessThanOrEqual(3);
  });

  it('keeps the gradient stops in increasing order', () => {
    // A rotation that wrapped the offsets instead of the colours would put them out of order.
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({
        bodies: [scenePlanet({ isGasGiant: true, shading: { ...SHADING, seedFloat: 99.9 } })],
      }),
    );
    const bands = opsOf(calls, 'fillRect')[1].fillStyle;
    if (!isGradient(bands)) throw new Error('expected a gradient');
    const offsets = bands.stops.map((stop) => stop.offset);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBe(1);
  });

  it('restores only after the bands are painted, so they stay inside the disk', () => {
    // Restoring right after `clip` would leave the counts and the save→clip→restore ordering
    // intact while painting a full-alpha square of band colour over the background.
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ isGasGiant: true })] }));

    expect(opsOf(calls, 'save')).toHaveLength(1);
    expect(opsOf(calls, 'restore')).toHaveLength(1);
    expect(indexOfOp(calls, 'save')).toBeLessThan(indexOfOp(calls, 'clip'));
    // The band fill is the second fillRect; the first is the background.
    expect(indexOfOp(calls, 'restore')).toBeGreaterThan(indexOfOp(calls, 'fillRect', 1));
  });
});

describe('rings', () => {
  const RING = { angleRad: 0.5, tilt: 0.3, color: { r: 0.8, g: 0.7, b: 0.6 } };

  it('strokes a semicircle behind the planet and another in front of it', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ ring: RING })] }));

    const strokes = opsOf(calls, 'stroke');
    expect(strokes).toHaveLength(2);
    expect(strokes[0].strokeStyle).toBe('rgba(204,179,153,0.35)'); // back pass, fainter
    expect(strokes[1].strokeStyle).toBe('rgba(204,179,153,0.75)'); // front pass
  });

  it('draws the back half, then the planet, then the front half', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ ring: RING })] }));

    const planetFill = indexOfOp(calls, 'fill');
    expect(indexOfOp(calls, 'stroke', 0)).toBeLessThan(planetFill);
    expect(indexOfOp(calls, 'stroke', 1)).toBeGreaterThan(planetFill);
  });

  it('derives the ellipse from the planet radius and the ring tilt', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ ring: RING })] }));

    // rx = 40 * 2.4 = 96; ry = max(40 * 0.22, 40 * 0.3) = 12; oy = -40 * 0.05 = -2
    const ellipse = opsOf(calls, 'ellipse')[0];
    expect(ellipse.args.slice(0, 5)).toEqual([0, -2, 96, 12, 0]);
  });

  it('floors the minor radius, so a very flat ring stays visible', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ ring: { ...RING, tilt: 0.05 } })] }));
    // max(40 * 0.22, 40 * 0.05) = 8.8, not 2.
    expect(opsOf(calls, 'ellipse')[0].args[3]).toBeCloseTo(8.8, 10);
  });

  it('rotates the ring by its angle about the planet centre', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet({ ring: RING })] }));

    expect(opsOf(calls, 'translate')[0].args).toEqual([100, 120]);
    expect(opsOf(calls, 'rotate')[0].args).toEqual([0.5]);
  });

  it('draws nothing at all for a planet with no ring', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ bodies: [scenePlanet()] }));

    expect(opsOf(calls, 'ellipse')).toHaveLength(0);
    expect(opsOf(calls, 'stroke')).toHaveLength(0);
  });

  it('balances save and restore, so the transform does not leak onto the next body', () => {
    // Each ring pass translates and rotates the context. An unbalanced restore would draw every
    // later body offset by this planet's centre and rotated by its ring angle — mostly off-canvas,
    // and invisible to an e2e check that only asserts a canvas is present.
    const { ctx, calls } = recordingContext();
    drawScene(
      ctx,
      scene({
        bodies: [scenePlanet({ ring: RING }), sceneStar({ centerX: 300, centerY: 120 })],
      }),
    );

    expect(opsOf(calls, 'translate')).toHaveLength(2);
    expect(opsOf(calls, 'rotate')).toHaveLength(2);
    expect(opsOf(calls, 'save')).toHaveLength(opsOf(calls, 'restore').length);
    // Both ring passes are closed before the star is drawn.
    expect(indexOfOp(calls, 'restore', 1)).toBeLessThan(
      indexOfOp(calls, 'createRadialGradient', 2),
    );
  });
});

describe('walking a whole scene', () => {
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

  it('draws every body a real system scene contains, in order', () => {
    const system = {
      name: 'S',
      description: '',
      stars: [mockBody({ radius: 695700 })],
      planets: [mockBody({}), mockBody({ classification: 'gas giant planet' })],
    } as unknown as StarSystem;

    const { ctx, calls } = recordingContext(640, 160);
    drawScene(ctx, buildStarSystemScene(system, 640, 160, 'seed'));

    // One star (two gradients) then two planets (two each).
    expect(opsOf(calls, 'createRadialGradient')).toHaveLength(6);
    // Only the gas giant bands.
    expect(opsOf(calls, 'createLinearGradient')).toHaveLength(1);
    expect(opsOf(calls, 'getImageData')).toHaveLength(0);
  });

  it('draws only the background for a scene with no bodies', () => {
    const { ctx, calls } = recordingContext();
    drawScene(ctx, scene({ background: { fillColor: '#000', stars: [] } }));

    expect(opsOf(calls, 'fillRect')).toHaveLength(1);
    expect(opsOf(calls, 'createRadialGradient')).toHaveLength(0);
  });
});

describe('renderSceneToDataUrl', () => {
  function fakeDocument() {
    const { ctx, calls } = recordingContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ctx as CanvasRenderingContext2D | null,
      toDataURL: () => 'data:image/png;base64,STUB',
      remove: () => {
        removed = true;
      },
    };
    let removed = false;
    return {
      document: { createElement: () => canvas } as unknown as Document,
      canvas,
      calls,
      wasRemoved: () => removed,
    };
  }

  it('sizes the canvas from the scene and returns its data URL', () => {
    const fake = fakeDocument();
    const url = renderSceneToDataUrl(fake.document, scene({ bodies: [scenePlanet()] }));

    expect(fake.canvas.width).toBe(512);
    expect(fake.canvas.height).toBe(256);
    expect(url).toBe('data:image/png;base64,STUB');
  });

  it('draws the scene onto the canvas it made', () => {
    const fake = fakeDocument();
    renderSceneToDataUrl(fake.document, scene({ bodies: [sceneStar()] }));

    expect(opsOf(fake.calls, 'fillRect')).toHaveLength(1);
    expect(opsOf(fake.calls, 'createRadialGradient')).toHaveLength(2);
  });

  it('cleans up the canvas it made', () => {
    const fake = fakeDocument();
    renderSceneToDataUrl(fake.document, scene({ bodies: [sceneStar()] }));
    expect(fake.wasRemoved()).toBe(true);
  });

  it('returns an empty string for a scene with no bodies, without drawing', () => {
    // What the star-system renderer did for an empty system before the scene existed.
    const fake = fakeDocument();
    expect(renderSceneToDataUrl(fake.document, scene({ bodies: [] }))).toBe('');
    expect(fake.calls).toHaveLength(0);
  });

  it('throws when a 2D context cannot be obtained', () => {
    const document = {
      createElement: () => ({ width: 0, height: 0, getContext: () => null }),
    } as unknown as Document;

    expect(() => renderSceneToDataUrl(document, scene({ bodies: [sceneStar()] }))).toThrow(
      'Could not get 2D context',
    );
  });
});

describe('the high-fidelity path', () => {
  it('shades the disk pixel by pixel, straight into the image buffer', () => {
    // Kept as an option per the design, for an offline or GPU-free render where seconds per planet
    // are acceptable. Nothing routes to it yet, so this is what holds it to the ScenePlanet shape.
    const { ctx, calls } = recordingContext(64, 64);
    drawPlanetSpherePatch(ctx, scenePlanet({ centerX: 32, centerY: 32, radiusPx: 10 }));

    // Patch is ceil(r) + 2 = 12 either side of centre, so 25 square, clipped to the canvas.
    expect(opsOf(calls, 'getImageData')[0].args).toEqual([20, 20, 25, 25]);
    expect(opsOf(calls, 'putImageData')).toHaveLength(1);
  });

  it('clips the patch to the canvas when the planet runs off the edge', () => {
    const { ctx, calls } = recordingContext(64, 64);
    drawPlanetSpherePatch(ctx, scenePlanet({ centerX: 2, centerY: 2, radiusPx: 10 }));

    const [x, y, w, h] = opsOf(calls, 'getImageData')[0].args;
    expect([x, y]).toEqual([0, 0]);
    expect(w).toBe(15); // -10 .. 15 clipped at 0
    expect(h).toBe(15);
  });

  it('does nothing when the planet is entirely off-canvas', () => {
    const { ctx, calls } = recordingContext(64, 64);
    drawPlanetSpherePatch(ctx, scenePlanet({ centerX: -100, centerY: 32, radiusPx: 10 }));

    expect(opsOf(calls, 'getImageData')).toHaveLength(0);
    expect(opsOf(calls, 'putImageData')).toHaveLength(0);
  });

  it('writes opaque pixels inside the disk and leaves those outside alone', () => {
    const { ctx } = recordingContext(64, 64);
    const written: Array<{ data: Uint8ClampedArray }> = [];
    const spy = new Proxy(ctx, {
      get(target, prop: string) {
        if (prop === 'putImageData') {
          return (image: { data: Uint8ClampedArray }) => written.push(image);
        }
        return target[prop as keyof CanvasRenderingContext2D];
      },
    });
    drawPlanetSpherePatch(spy, scenePlanet({ centerX: 32, centerY: 32, radiusPx: 10 }));

    const { data } = written[0];
    const alphaAt = (col: number, row: number) => data[(row * 25 + col) * 4 + 3];
    expect(alphaAt(12, 12)).toBe(255); // centre of the patch, inside the disk
    expect(alphaAt(0, 0)).toBe(0); // corner of the patch, outside it
  });
});
