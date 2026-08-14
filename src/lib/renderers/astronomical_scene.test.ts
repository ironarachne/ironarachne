import { describe, expect, it } from 'vitest';
import { buildPlanetScene, buildStarScene, buildStarSystemScene } from './astronomical_scene';
import type { ScenePlanet, SceneStar } from './astronomical_scene_types';
import type { AstronomicalBody, StarSystem } from '$lib/astronomical_bodies';

const SUN_RADIUS_KM = 695700;
const EARTH_RADIUS_KM = 6371;

function mockBody(overrides: Partial<AstronomicalBody>): AstronomicalBody {
  return {
    name: 'Test',
    description: '',
    classification: 'ocean planet',
    radius: EARTH_RADIUS_KM,
    surface_temperature: 5778,
    has_ring_system: false,
    ...overrides,
  } as unknown as AstronomicalBody;
}

function mockSystem(overrides: Partial<StarSystem>): StarSystem {
  return {
    name: 'Test System',
    description: '',
    stars: [],
    planets: [],
    ...overrides,
  } as unknown as StarSystem;
}

function planetsIn(bodies: Array<SceneStar | ScenePlanet>): ScenePlanet[] {
  return bodies.filter((body): body is ScenePlanet => body.kind === 'planet');
}

function starsIn(bodies: Array<SceneStar | ScenePlanet>): SceneStar[] {
  return bodies.filter((body): body is SceneStar => body.kind === 'star');
}

describe('buildPlanetScene', () => {
  it('carries the scene dimensions, seed, and quality', () => {
    const scene = buildPlanetScene(mockBody({}), 512, 384, 'seed');
    expect(scene.width).toBe(512);
    expect(scene.height).toBe(384);
    expect(scene.seed).toBe('seed');
    expect(scene.quality).toBe('full');
    expect(buildPlanetScene(mockBody({}), 512, 384, 'seed', 'reduced').quality).toBe('reduced');
  });

  it('centres the planet and scales its radius from the shorter side', () => {
    // One Earth radius at 512px: 512 / 4 = 128, below the 512 / 2.5 cap.
    const scene = buildPlanetScene(mockBody({}), 512, 512, 'seed');
    const planet = planetsIn(scene.bodies)[0];
    expect(planet.centerX).toBe(256);
    expect(planet.centerY).toBe(256);
    expect(planet.radiusPx).toBe(128);
  });

  it('caps the radius for a very large planet', () => {
    const scene = buildPlanetScene(mockBody({ radius: 60000 }), 512, 512, 'seed');
    expect(planetsIn(scene.bodies)[0].radiusPx).toBe(204.8); // 512 / 2.5
  });

  it('fills the background and counts stars from the canvas area', () => {
    const scene = buildPlanetScene(mockBody({}), 512, 512, 'seed');
    expect(scene.background.fillColor).toBe('#05060a');
    // floor(512 * 512 / 900) = 291, clamped to the 180 ceiling.
    expect(scene.background.stars).toHaveLength(180);
  });

  it('drops below the ceiling on a small canvas', () => {
    const scene = buildPlanetScene(mockBody({}), 100, 100, 'seed');
    expect(scene.background.stars).toHaveLength(11); // floor(10000 / 900)
  });

  it('places background stars at fixed positions for a seed', () => {
    // Pinned rather than merely bounded: the whole point of carrying positions instead of a count
    // is that both backends get these exact stars, so a change of draw order must fail here.
    const scene = buildPlanetScene(mockBody({}), 512, 512, 'probe-seed');
    expect(scene.background.stars[0]).toEqual({
      x: 88.12498784065247,
      y: 430.2133708000183,
      alpha: 0.22043706565164028,
      radiusPx: 0.5333683303557336,
    });
    expect(scene.background.stars[1]).toEqual({
      x: 180.48124611377716,
      y: 304.65575528144836,
      alpha: 0.1200387889612466,
      radiusPx: 0.3563336548861116,
    });
  });

  it('keeps every background star inside the canvas and within its alpha and radius ranges', () => {
    const scene = buildPlanetScene(mockBody({}), 320, 240, 'seed');
    for (const star of scene.background.stars) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(320);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(240);
      expect(star.alpha).toBeGreaterThanOrEqual(0.12);
      expect(star.alpha).toBeLessThanOrEqual(0.5);
      expect(star.radiusPx).toBeGreaterThanOrEqual(0.35);
      expect(star.radiusPx).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic for a seed and varies with it', () => {
    const a = buildPlanetScene(mockBody({ has_ring_system: true }), 256, 256, 'alpha');
    const b = buildPlanetScene(mockBody({ has_ring_system: true }), 256, 256, 'alpha');
    const c = buildPlanetScene(mockBody({ has_ring_system: true }), 256, 256, 'beta');
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('resolves the shading parameters within their ranges', () => {
    const planet = planetsIn(buildPlanetScene(mockBody({}), 256, 256, 'seed').bodies)[0];
    expect(planet.shading.seedFloat).toBeGreaterThanOrEqual(0);
    expect(planet.shading.seedFloat).toBeLessThanOrEqual(100);
    expect(planet.shading.lightDir[0]).toBeGreaterThanOrEqual(0.3);
    expect(planet.shading.lightDir[0]).toBeLessThanOrEqual(0.6);
    expect(planet.shading.lightDir[1]).toBe(1.0);
    expect(planet.shading.lightDir[2]).toBe(0.5);
    expect(planet.shading.cloudCoverage).toBeGreaterThanOrEqual(0.5);
    expect(planet.shading.cloudCoverage).toBeLessThanOrEqual(0.75);
    expect(planet.shading.stormActivity).toBeGreaterThanOrEqual(0.2);
    expect(planet.shading.stormActivity).toBeLessThanOrEqual(0.6);
  });

  it('pins the shading parameters for a seed', () => {
    const planet = planetsIn(buildPlanetScene(mockBody({}), 512, 512, 'probe-seed').bodies)[0];
    expect(planet.shading).toEqual({
      seedFloat: 53.08919588569552,
      lightDir: [0.43904163159895687, 1, 0.5],
      cloudCoverage: 0.5780893481569365,
      stormActivity: 0.45469745667651296,
    });
  });

  it('uses the fixed palette for a classification that has one', () => {
    const planet = planetsIn(
      buildPlanetScene(mockBody({ classification: 'ocean planet' }), 256, 256, 'seed').bodies,
    )[0];
    expect(planet.palette).toEqual({
      main: { r: 0.08, g: 0.35, b: 0.65 },
      band1: { r: 0.05, g: 0.25, b: 0.5 },
      band2: { r: 0.2, g: 0.55, b: 0.75 },
    });
  });

  it('gives the same fixed palette whatever the seed', () => {
    const one = planetsIn(buildPlanetScene(mockBody({}), 256, 256, 'one').bodies)[0];
    const two = planetsIn(buildPlanetScene(mockBody({}), 256, 256, 'two').bodies)[0];
    expect(one.palette).toEqual(two.palette);
    expect(one.shading).not.toEqual(two.shading);
  });

  it('rolls a random palette for a gas giant, inside the gas-giant range', () => {
    const planet = planetsIn(
      buildPlanetScene(mockBody({ classification: 'gas giant planet' }), 256, 256, 'seed').bodies,
    )[0];
    for (const color of [planet.palette.main, planet.palette.band1, planet.palette.band2]) {
      for (const channel of [color.r, color.g, color.b]) {
        expect(channel).toBeGreaterThanOrEqual(0.1);
        expect(channel).toBeLessThanOrEqual(0.8);
      }
    }
  });

  it('rolls a random palette for a classification with no fixed theme', () => {
    const planet = planetsIn(
      buildPlanetScene(mockBody({ classification: 'not a real planet' }), 256, 256, 'seed').bodies,
    )[0];
    expect(planet.palette).not.toEqual(
      planetsIn(buildPlanetScene(mockBody({}), 256, 256, 'seed').bodies)[0].palette,
    );
  });

  it('marks a gas giant only on the exact classification string', () => {
    // `isGasGiantPlanetClassification` is an exact match on 'gas giant planet'. Renaming that
    // classification would silently shade every gas giant as terrestrial, so the string is named
    // here on purpose: this test is what a rename has to walk past.
    const isGasGiant = (classification: string) =>
      planetsIn(buildPlanetScene(mockBody({ classification }), 256, 256, 'seed').bodies)[0]
        .isGasGiant;

    expect(isGasGiant('gas giant planet')).toBe(true);
    expect(isGasGiant('Gas Giant Planet')).toBe(false);
    expect(isGasGiant('gas giant')).toBe(false);
    expect(isGasGiant('garden planet')).toBe(false);
  });

  it('carries the classification through unchanged', () => {
    const planet = planetsIn(
      buildPlanetScene(mockBody({ classification: 'volcanic planet' }), 256, 256, 'seed').bodies,
    )[0];
    expect(planet.classification).toBe('volcanic planet');
  });

  it('omits the ring when the planet has no ring system', () => {
    const planet = planetsIn(
      buildPlanetScene(mockBody({ has_ring_system: false }), 256, 256, 'seed').bodies,
    )[0];
    expect(planet.ring).toBeUndefined();
    expect('ring' in planet).toBe(false);
  });

  it('builds ring geometry within range when the planet has a ring system', () => {
    const planet = planetsIn(
      buildPlanetScene(mockBody({ has_ring_system: true }), 256, 256, 'seed').bodies,
    )[0];
    expect(planet.ring).toBeDefined();
    expect(planet.ring?.angleRad).toBeGreaterThanOrEqual(0);
    expect(planet.ring?.angleRad).toBeLessThanOrEqual(Math.PI);
    // The Canvas2D range, kept over the WebGL 0.1–0.4 so that low tilts do not all flatten
    // against the Canvas2D minor-radius floor of 0.22.
    expect(planet.ring?.tilt).toBeGreaterThanOrEqual(0.15);
    expect(planet.ring?.tilt).toBeLessThanOrEqual(0.45);
    for (const channel of [planet.ring?.color.r, planet.ring?.color.g, planet.ring?.color.b]) {
      expect(channel).toBeGreaterThanOrEqual(0.6);
      expect(channel).toBeLessThanOrEqual(0.9);
    }
  });

  it('leaves shading identical whether or not the planet has a ring', () => {
    // The ring draws last, so a ringless planet is shaded the same as a ringed one.
    const without = planetsIn(
      buildPlanetScene(mockBody({ has_ring_system: false }), 256, 256, 'seed').bodies,
    )[0];
    const with_ = planetsIn(
      buildPlanetScene(mockBody({ has_ring_system: true }), 256, 256, 'seed').bodies,
    )[0];
    expect(without.shading).toEqual(with_.shading);
  });
});

describe('buildStarScene', () => {
  it('centres the star and scales its radius from the shorter side', () => {
    // One solar radius at 512px: 512 / 6 = 85.33, between the 512 / 8 floor and 512 / 3.5 cap.
    const scene = buildStarScene(mockBody({ radius: SUN_RADIUS_KM }), 512, 512, 'seed');
    const star = starsIn(scene.bodies)[0];
    expect(star.centerX).toBe(256);
    expect(star.centerY).toBe(256);
    expect(star.radiusPx).toBeCloseTo(85.333333, 5);
  });

  it('derives the corona width from the disk radius', () => {
    const star = starsIn(
      buildStarScene(mockBody({ radius: SUN_RADIUS_KM }), 512, 512, 'seed').bodies,
    )[0];
    expect(star.coronaWidthPx).toBeCloseTo(17.066666, 5); // 85.33 * 0.2
  });

  it('holds the corona width at its floor for a small disk', () => {
    const star = starsIn(buildStarScene(mockBody({ radius: 1 }), 64, 64, 'seed').bodies)[0];
    expect(star.radiusPx).toBe(8); // 64 / 8 floor
    expect(star.coronaWidthPx).toBe(4); // max(8 * 0.2, 4)
  });

  it('takes its colours from surface temperature', () => {
    const star = starsIn(
      buildStarScene(mockBody({ radius: SUN_RADIUS_KM, surface_temperature: 5778 }), 512, 512, 's')
        .bodies,
    )[0];
    expect(star.photosphere).toEqual({ r: 1.0, g: 1.0, b: 0.0 });
    expect(star.corona).toEqual({ r: 0.55, g: 0.35, b: 0.0 });
    expect(star.glow).toEqual({ r: 1.0, g: 1.0, b: 0.5 });
  });

  it('seeds the star from its own ordinal, so its surface detail is fixed for a seed', () => {
    const first = starsIn(buildStarScene(mockBody({}), 256, 256, 'seed').bodies)[0];
    const again = starsIn(buildStarScene(mockBody({}), 256, 256, 'seed').bodies)[0];
    const other = starsIn(buildStarScene(mockBody({}), 256, 256, 'other').bodies)[0];

    expect(first.seedFloat).toBe(again.seedFloat);
    expect(first.seedFloat).not.toBe(other.seedFloat);
    expect(first.seedFloat).toBeGreaterThanOrEqual(0);
    expect(first.seedFloat).toBeLessThanOrEqual(100);
  });

  it('gives a hot star different colours from a cool one', () => {
    const cool = starsIn(
      buildStarScene(mockBody({ surface_temperature: 3000 }), 256, 256, 's').bodies,
    )[0];
    const hot = starsIn(
      buildStarScene(mockBody({ surface_temperature: 40000 }), 256, 256, 's').bodies,
    )[0];
    expect(cool.photosphere).toEqual({ r: 1.0, g: 0.0, b: 0.0 });
    expect(hot.photosphere).toEqual({ r: 0.0, g: 0.0, b: 1.0 });
  });

  it('uses the star background spec', () => {
    const scene = buildStarScene(mockBody({}), 512, 512, 'seed');
    expect(scene.background.fillColor).toBe('#030308');
    expect(scene.background.stars).toHaveLength(220); // ceiling; floor(512 * 512 / 800) = 327
  });

  it('places background stars at fixed positions for a seed', () => {
    const scene = buildStarScene(mockBody({}), 512, 512, 'probe-seed');
    expect(scene.background.stars[0]).toEqual({
      x: 88.12498784065247,
      y: 430.2133708000183,
      alpha: 0.2821540337521583,
      radiusPx: 0.6256840988993645,
    });
  });

  it('is deterministic for a seed', () => {
    expect(buildStarScene(mockBody({}), 256, 256, 'seed')).toEqual(
      buildStarScene(mockBody({}), 256, 256, 'seed'),
    );
  });
});

describe('buildStarSystemScene', () => {
  const sun = mockBody({ radius: SUN_RADIUS_KM, surface_temperature: 5778 });
  const earth = mockBody({ radius: EARTH_RADIUS_KM });
  const ringedGiant = mockBody({
    radius: 3000,
    classification: 'gas giant planet',
    has_ring_system: true,
  });

  it('yields no bodies for a system with nothing in it', () => {
    const scene = buildStarSystemScene(mockSystem({}), 640, 160, 'seed');
    expect(scene.bodies).toHaveLength(0);
    // The background is still built, so a backend can choose between an empty sky and no render.
    expect(scene.background.fillColor).toBe('#030308');
  });

  it('orders stars before planets', () => {
    const scene = buildStarSystemScene(
      mockSystem({ stars: [sun], planets: [earth, ringedGiant] }),
      640,
      160,
      'seed',
    );
    expect(scene.bodies.map((body) => body.kind)).toEqual(['star', 'planet', 'planet']);
  });

  it('resolves absolute positions and radii, in pixels', () => {
    // 1 star + 2 planets = 6 units across 640px, so one unit is 106.67px and a star cell is 4 of
    // them. The star sits at the centre of its cell, the planets at the centres of theirs.
    const scene = buildStarSystemScene(
      mockSystem({ stars: [sun], planets: [earth, ringedGiant] }),
      640,
      160,
      'seed',
    );
    expect(scene.bodies[0].centerX).toBeCloseTo(213.333333, 5);
    expect(scene.bodies[1].centerX).toBe(480);
    expect(scene.bodies[2].centerX).toBeCloseTo(586.666666, 5);
    for (const body of scene.bodies) {
      expect(body.centerY).toBe(80);
    }
    expect(scene.bodies[0].radiusPx).toBe(60);
    expect(scene.bodies[1].radiusPx).toBeCloseTo(13.333333, 5);
    // sqrt(3000 / 6371) of the larger planet's size.
    expect(scene.bodies[2].radiusPx).toBeCloseTo(9.149462, 5);
  });

  it('does not leak the layout unit arithmetic into the scene', () => {
    // `baseUnitWidth` and `totalUnits` are working values inside the builder. A backend that could
    // see them could do its own arithmetic with them, which is how the two backends drifted apart.
    const scene = buildStarSystemScene(
      mockSystem({ stars: [sun], planets: [earth] }),
      640,
      160,
      'seed',
    );
    expect(Object.keys(scene).sort()).toEqual([
      'background',
      'bodies',
      'height',
      'quality',
      'seed',
      'width',
    ]);
    expect(Object.keys(scene.bodies[1]).sort()).toEqual([
      'centerX',
      'centerY',
      'classification',
      'isGasGiant',
      'kind',
      'palette',
      'radiusPx',
      'shading',
    ]);
  });

  it('uses the system background spec, which is denser than a single body', () => {
    const scene = buildStarSystemScene(mockSystem({ stars: [sun] }), 640, 160, 'seed');
    expect(scene.background.fillColor).toBe('#030308');
    expect(scene.background.stars).toHaveLength(204); // floor(640 * 160 / 500)
  });

  it('places background stars at fixed positions for a seed', () => {
    const scene = buildStarSystemScene(
      mockSystem({ stars: [sun], planets: [earth] }),
      640,
      160,
      'probe-seed',
    );
    expect(scene.background.stars[0]).toEqual({
      x: 110.15623480081558,
      y: 134.44167837500572,
      alpha: 0.23365246902685613,
      radiusPx: 0.5615788427181542,
    });
  });

  it('rolls the sky independently of what is in front of it', () => {
    // Bodies draw from their own RNGs, so the number of them cannot shift the background. This is
    // exactly what the old Canvas2D path got wrong in reverse — it consumed the scene RNG for
    // background stars part-way through, so canvas size moved the ring geometry.
    const sparse = buildStarSystemScene(
      mockSystem({ stars: [sun], planets: [earth] }),
      640,
      160,
      'seed',
    );
    const dense = buildStarSystemScene(
      mockSystem({ stars: [sun, sun], planets: [earth, ringedGiant, earth] }),
      640,
      160,
      'seed',
    );
    expect(dense.background.stars).toEqual(sparse.background.stars);
  });

  it('gives two planets in one system different shading', () => {
    const scene = buildStarSystemScene(
      mockSystem({ stars: [sun], planets: [earth, earth] }),
      640,
      160,
      'seed',
    );
    const [first, second] = planetsIn(scene.bodies);
    expect(first.shading).not.toEqual(second.shading);
  });

  it('does not repaint a planet when a star is added to the system', () => {
    // Each planet is seeded from its own ordinal, not from its position in the drawing order, so
    // a change elsewhere in the system moves a planet without redrawing it.
    const oneStar = buildStarSystemScene(
      mockSystem({ stars: [sun], planets: [ringedGiant] }),
      640,
      160,
      'seed',
    );
    const twoStars = buildStarSystemScene(
      mockSystem({ stars: [sun, sun], planets: [ringedGiant] }),
      640,
      160,
      'seed',
    );
    const before = planetsIn(oneStar.bodies)[0];
    const after = planetsIn(twoStars.bodies)[0];

    expect(after.shading).toEqual(before.shading);
    expect(after.palette).toEqual(before.palette);
    expect(after.ring).toEqual(before.ring);
    expect(after.centerX).not.toBe(before.centerX);
  });

  it('seeds each star from its own ordinal too', () => {
    const scene = buildStarSystemScene(mockSystem({ stars: [sun, sun] }), 640, 160, 'seed');
    const [first, second] = starsIn(scene.bodies);
    expect(first.seedFloat).not.toBe(second.seedFloat);
    expect(first.seedFloat).toBe(
      starsIn(buildStarScene(sun, 512, 512, 'seed').bodies)[0].seedFloat,
    );
  });

  it('matches the standalone planet scene for the first planet in a system', () => {
    // Same seed derivation either way, so a planet looks the same on its own page as in its
    // system — only its size and position change.
    const system = buildStarSystemScene(mockSystem({ planets: [earth] }), 640, 160, 'seed');
    const alone = buildPlanetScene(earth, 512, 512, 'seed');
    expect(planetsIn(system.bodies)[0].shading).toEqual(planetsIn(alone.bodies)[0].shading);
  });

  it('is deterministic for a seed', () => {
    const system = mockSystem({ stars: [sun], planets: [earth, ringedGiant] });
    expect(buildStarSystemScene(system, 640, 160, 'seed')).toEqual(
      buildStarSystemScene(system, 640, 160, 'seed'),
    );
  });

  it('carries quality through', () => {
    const scene = buildStarSystemScene(mockSystem({ stars: [sun] }), 640, 160, 'seed', 'reduced');
    expect(scene.quality).toBe('reduced');
  });
});
