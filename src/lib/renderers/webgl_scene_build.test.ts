import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import * as PlanetShaders from '$lib/shaders/planets/planets';
import StarShader from '$lib/shaders/stars/star.frag';
import { buildWebGLDrawList } from './webgl_scene_build';
import { buildPlanetScene, buildStarSystemScene } from './astronomical_scene';
import type { AstronomicalScene, ScenePlanet, SceneStar } from './astronomical_scene_types';
import type { WebGLPlaneItem, WebGLPointsItem } from './webgl_scene_types';
import type { AstronomicalBody, StarSystem } from '$lib/astronomical_bodies';

/**
 * These are the WebGL half of step 2's draw-call tests: the uniforms a scene produces, asserted
 * without a GL context. They exist because a backend that silently ignores a field it was handed
 * is exactly the bug the scene was introduced to close — the scene-equality test next door proves
 * both backends were given the same data, and this proves this one used it.
 */

const PALETTE = {
  main: { r: 0.4, g: 0.5, b: 0.6 },
  band1: { r: 0.2, g: 0.3, b: 0.4 },
  band2: { r: 0.6, g: 0.7, b: 0.8 },
};

const SHADING = {
  seedFloat: 42.5,
  lightDir: [0.45, 1.0, 0.5] as [number, number, number],
  cloudCoverage: 0.62,
  stormActivity: 0.38,
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
    seedFloat: 12.5,
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

function planesOf(items: ReturnType<typeof buildWebGLDrawList>): WebGLPlaneItem[] {
  return items.filter((item): item is WebGLPlaneItem => item.kind === 'plane');
}

function pointsOf(items: ReturnType<typeof buildWebGLDrawList>): WebGLPointsItem[] {
  return items.filter((item): item is WebGLPointsItem => item.kind === 'points');
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

describe('the draw list', () => {
  it('is background fill, then background stars, then the bodies in scene order', () => {
    const items = buildWebGLDrawList(
      scene({
        background: { fillColor: '#05060a', stars: [{ x: 1, y: 2, radiusPx: 0.5, alpha: 0.3 }] },
        bodies: [sceneStar(), scenePlanet()],
      }),
    );

    expect(items.map((item) => item.kind)).toEqual(['plane', 'points', 'plane', 'plane']);
    expect(planesOf(items)[1].fragmentShader).toBe(StarShader);
    expect(planesOf(items)[2].fragmentShader).toBe(
      PlanetShaders.getFragmentShaderByName('ocean planet'),
    );
  });

  it('covers the canvas with the scene fill colour', () => {
    const [fill] = planesOf(buildWebGLDrawList(scene({ bodies: [sceneStar()] })));

    expect(fill.widthPx).toBe(512);
    expect(fill.heightPx).toBe(256);
    expect(fill.centerX).toBe(256);
    expect(fill.centerY).toBe(128);
    expect(fill.uniforms.fill_color.value).toEqual(new THREE.Vector3(5 / 255, 6 / 255, 10 / 255));
  });

  it('draws no points at all for a sky with no stars', () => {
    expect(pointsOf(buildWebGLDrawList(scene({ bodies: [sceneStar()] })))).toHaveLength(0);
  });
});

describe('the background stars', () => {
  const stars = [
    { x: 10, y: 20, radiusPx: 0.5, alpha: 0.3 },
    { x: 30, y: 40, radiusPx: 1, alpha: 0.45 },
  ];
  const [points] = pointsOf(
    buildWebGLDrawList(scene({ background: { fillColor: '#05060a', stars } })),
  );

  it('carries one point per scene star, y flipped into the renderer axis', () => {
    // The scene's y points down and the renderer's points up, over a 256px canvas.
    expect(Array.from(points.positions)).toEqual([10, 236, 0, 30, 216, 0]);
  });

  it('carries each star radius and alpha rather than re-rolling them', () => {
    expect(Array.from(points.radii)).toEqual([0.5, 1]);
    // The attribute is a Float32Array, so the alphas arrive at single precision.
    expect(points.alphas[0]).toBeCloseTo(0.3, 6);
    expect(points.alphas[1]).toBeCloseTo(0.45, 6);
  });

  it('uses the one background star colour both backends share', () => {
    expect(points.color).toEqual(new THREE.Vector3(210 / 255, 220 / 255, 250 / 255));
  });
});

describe('a star plane', () => {
  const star = sceneStar();
  const [plane] = planesOf(buildWebGLDrawList(scene({ bodies: [star] }))).slice(1);

  it('takes every uniform off the scene star', () => {
    expect(plane.uniforms.seed.value).toBe(star.seedFloat);
    expect(plane.uniforms.star_radius.value).toBe(star.radiusPx);
    expect(plane.uniforms.corona_width.value).toBe(star.coronaWidthPx);
    expect(plane.uniforms.star_color.value).toEqual(new THREE.Vector3(1, 1, 0));
    expect(plane.uniforms.corona_color.value).toEqual(new THREE.Vector3(0.55, 0.35, 0));
    expect(plane.uniforms.glow_color.value).toEqual(new THREE.Vector3(1, 1, 0.5));
  });

  it('sits where the scene puts it, y flipped', () => {
    expect(plane.centerX).toBe(60);
    expect(plane.centerY).toBe(256 - 70);
  });

  it('generates no background of its own', () => {
    expect(plane.uniforms.render_background.value).toBe(0);
  });

  it('adds its light to the sky rather than replacing it', () => {
    expect(plane.blending).toBe('additive');
  });

  it('is large enough for the halo, and says so in its resolution', () => {
    // The shader's corona stops at 2.5 corona widths past the limb: 20 + 4 * 2.5 = 30.
    expect(plane.widthPx / 2).toBeGreaterThanOrEqual(30);
    expect(plane.uniforms.resolution.value).toEqual(
      new THREE.Vector2(plane.widthPx, plane.heightPx),
    );
  });
});

describe('a planet plane', () => {
  const ring = { angleRad: 1.1, tilt: 0.3, color: { r: 0.7, g: 0.75, b: 0.8 } };
  const planet = scenePlanet({ ring });
  const [plane] = planesOf(buildWebGLDrawList(scene({ bodies: [planet] }))).slice(1);

  it('takes its palette off the scene', () => {
    expect(plane.uniforms.main_color.value).toEqual(new THREE.Vector3(0.4, 0.5, 0.6));
    expect(plane.uniforms.band_color_1.value).toEqual(new THREE.Vector3(0.2, 0.3, 0.4));
    expect(plane.uniforms.band_color_2.value).toEqual(new THREE.Vector3(0.6, 0.7, 0.8));
  });

  it('takes its shading off the scene', () => {
    expect(plane.uniforms.seed.value).toBe(42.5);
    expect(plane.uniforms.light_direction.value).toEqual(new THREE.Vector3(0.45, 1.0, 0.5));
    expect(plane.uniforms.cloud_coverage.value).toBe(0.62);
    expect(plane.uniforms.storm_activity.value).toBe(0.38);
    expect(plane.uniforms.planet_radius.value).toBe(40);
  });

  it('takes its ring off the scene', () => {
    expect(plane.uniforms.has_rings.value).toBe(1);
    expect(plane.uniforms.ring_angle.value).toBe(1.1);
    expect(plane.uniforms.ring_tilt.value).toBe(0.3);
    expect(plane.uniforms.ring_color.value).toEqual(new THREE.Vector3(0.7, 0.75, 0.8));
  });

  it('still carries the ring uniforms when there is no ring, switched off', () => {
    const [ringless] = planesOf(buildWebGLDrawList(scene({ bodies: [scenePlanet()] }))).slice(1);

    expect(ringless.uniforms.has_rings.value).toBe(0);
    expect(ringless.uniforms.ring_angle.value).toBe(0);
    expect(ringless.uniforms.ring_tilt.value).toBe(0);
    expect(ringless.uniforms.ring_color.value).toEqual(new THREE.Vector3(0, 0, 0));
  });

  it('occludes what is behind it', () => {
    expect(plane.blending).toBe('normal');
  });

  it('is wide enough for the rings the shader draws', () => {
    // The shader's rings reach 3.6 planet radii from the centre.
    expect(plane.widthPx / 2).toBeGreaterThanOrEqual(40 * 3.6);
  });

  it('is wide enough for the atmosphere glow of a planet too small for that to follow', () => {
    // The glow runs to 24px past a limb that is 1.05 radii out, which for a 3px planet is most of
    // what there is to see.
    const [tiny] = planesOf(
      buildWebGLDrawList(scene({ bodies: [scenePlanet({ radiusPx: 3 })] })),
    ).slice(1);

    expect(tiny.widthPx / 2).toBeGreaterThanOrEqual(3 * 1.05 + 24);
  });
});

describe('the palette a planet is drawn with', () => {
  it('is the classification palette, not a gas giant one', () => {
    // The regression this whole step exists for: the WebGL path handed every planet the colours
    // `getRandomGasGiantRgbTriplet` rolled for it, whatever the planet was.
    const built = buildPlanetScene(mockBody({ classification: 'ocean planet' }), 256, 256, 'seed');
    const [plane] = planesOf(buildWebGLDrawList(built)).slice(1);
    const oceanPalette = (built.bodies[0] as ScenePlanet).palette;

    expect(plane.uniforms.main_color.value).toEqual(
      new THREE.Vector3(oceanPalette.main.r, oceanPalette.main.g, oceanPalette.main.b),
    );
    expect(oceanPalette.main.b).toBeGreaterThan(oceanPalette.main.r);
  });

  it('differs between two gas giants in one system', () => {
    const system = {
      name: 'S',
      description: '',
      stars: [mockBody({ radius: 695700 })],
      planets: [
        mockBody({ classification: 'gas giant planet' }),
        mockBody({ classification: 'gas giant planet' }),
      ],
    } as unknown as StarSystem;

    const planes = planesOf(buildWebGLDrawList(buildStarSystemScene(system, 640, 160, 'seed')));
    const [first, second] = planes.slice(2);

    expect(first.uniforms.main_color.value).not.toEqual(second.uniforms.main_color.value);
  });
});
