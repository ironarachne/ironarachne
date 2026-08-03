/**
 * Builds an {@link AstronomicalScene} from a body or a system plus a seed.
 *
 * These are pure functions: no DOM, no canvas, no drawing. Everything that decides *what* a
 * preview contains happens here exactly once, so the Canvas2D and WebGL backends agree by
 * construction rather than by discipline. See `docs/renderers.md`.
 */

import { RNG } from '@ironarachne/rng';
import { isGasGiantPlanetClassification } from '$lib/renderers/astronomical/planet_canvas_classification';
import { resolvePlanetCanvasTheme } from '$lib/renderers/astronomical/planet_canvas_theme';
import {
  planetRadiusKmToPreviewPixels,
  starCoronaWidthPixelsFromDiskRadius,
  starRadiusKmToPreviewPixels,
} from '$lib/renderers/astronomical/image_body_scale';
import { getRgbColorsFromStarSurfaceTemperature } from '$lib/renderers/astronomical/star_surface_colors';
import { computeStarSystemLayout } from '$lib/renderers/astronomical/star_system_layout';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';
import type {
  AstronomicalScene,
  BackgroundStar,
  RenderQuality,
  SceneBackground,
  ScenePlanet,
  SceneRing,
  SceneStar,
} from '$lib/renderers/astronomical_scene_types';

/**
 * How dense and how dark a given kind of preview's starfield is. The three differ deliberately —
 * a whole system reads better against a busier sky than a single planet does — so they are stated
 * as data here rather than left as three near-identical loops in three renderers.
 */
type BackgroundSpec = {
  fillColor: string;
  maxStars: number;
  pixelsPerStar: number;
  minAlpha: number;
  maxAlpha: number;
  minRadiusPx: number;
  maxRadiusPx: number;
};

const PLANET_BACKGROUND: BackgroundSpec = {
  fillColor: '#05060a',
  maxStars: 180,
  pixelsPerStar: 900,
  minAlpha: 0.12,
  maxAlpha: 0.5,
  minRadiusPx: 0.35,
  maxRadiusPx: 1,
};

const STAR_BACKGROUND: BackgroundSpec = {
  fillColor: '#030308',
  maxStars: 220,
  pixelsPerStar: 800,
  minAlpha: 0.15,
  maxAlpha: 0.65,
  minRadiusPx: 0.4,
  maxRadiusPx: 1.2,
};

const STAR_SYSTEM_BACKGROUND: BackgroundSpec = {
  fillColor: '#030308',
  maxStars: 380,
  pixelsPerStar: 500,
  minAlpha: 0.12,
  maxAlpha: 0.55,
  minRadiusPx: 0.35,
  maxRadiusPx: 1.1,
};

/**
 * The two backends previously disagreed on ring tilt by range as well as by draw order: Canvas2D
 * rolled 0.15–0.45 and WebGL 0.1–0.4. This is the Canvas2D range, because the Canvas2D ellipse
 * floors its minor radius at 0.22 of the planet radius — under the WebGL range more than a third
 * of the rolls would flatten to that floor and become indistinguishable from each other, while the
 * shader, which has no such floor, would keep showing the difference.
 */
const RING_MIN_TILT = 0.15;
const RING_MAX_TILT = 0.45;

/**
 * Each planet draws from its own RNG, seeded from the scene seed and the planet's ordinal. One
 * long sequence shared across the scene would make a planet's appearance depend on everything
 * drawn before it, so adding a star to a system would repaint every planet in it. Stars need no
 * seed at all — their colours follow from surface temperature.
 */
function planetSeed(seed: string, planetIndex: number): string {
  return `${seed}:planet${planetIndex}`;
}

function buildBackground(
  spec: BackgroundSpec,
  width: number,
  height: number,
  rng: RNG,
): SceneBackground {
  const count = Math.min(spec.maxStars, Math.floor((width * height) / spec.pixelsPerStar));
  const stars: BackgroundStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rng.float(0, width),
      y: rng.float(0, height),
      alpha: rng.float(spec.minAlpha, spec.maxAlpha),
      radiusPx: rng.float(spec.minRadiusPx, spec.maxRadiusPx),
    });
  }
  return { fillColor: spec.fillColor, stars };
}

function buildRing(rng: RNG): SceneRing {
  return {
    angleRad: rng.float(0, Math.PI),
    tilt: rng.float(RING_MIN_TILT, RING_MAX_TILT),
    color: { r: rng.float(0.6, 0.9), g: rng.float(0.6, 0.9), b: rng.float(0.6, 0.9) },
  };
}

/**
 * The order the planet's RNG is drawn from is fixed here and nowhere else: shading first, then the
 * ring. Because the ring is last, a planet without one is shaded exactly as it would be with one —
 * which is what the tests pin. The palette is seeded separately and does not touch this sequence.
 */
function buildScenePlanet(
  planet: AstronomicalBody,
  centerX: number,
  centerY: number,
  radiusPx: number,
  seed: string,
): ScenePlanet {
  const rng = new RNG(seed);
  const shading = {
    seedFloat: rng.float(0, 100),
    lightDir: [rng.float(0.3, 0.6), 1.0, 0.5] as [number, number, number],
    cloudCoverage: rng.float(0.5, 0.75),
    stormActivity: rng.float(0.2, 0.6),
  };

  return {
    kind: 'planet',
    centerX,
    centerY,
    radiusPx,
    classification: planet.classification,
    isGasGiant: isGasGiantPlanetClassification(planet.classification),
    palette: resolvePlanetCanvasTheme(planet.classification, `${seed}:palette`),
    shading,
    ...(planet.has_ring_system ? { ring: buildRing(rng) } : {}),
  };
}

function buildSceneStar(
  star: AstronomicalBody,
  centerX: number,
  centerY: number,
  radiusPx: number,
): SceneStar {
  const [photosphere, corona, glow] = getRgbColorsFromStarSurfaceTemperature(
    star.surface_temperature,
  );
  return {
    kind: 'star',
    centerX,
    centerY,
    radiusPx,
    photosphere,
    corona,
    glow,
    coronaWidthPx: starCoronaWidthPixelsFromDiskRadius(radiusPx),
  };
}

export function buildPlanetScene(
  planet: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
  quality: RenderQuality = 'full',
): AstronomicalScene {
  const rng = new RNG(seed);
  const radiusPx = planetRadiusKmToPreviewPixels(planet.radius, Math.min(width, height));
  return {
    width,
    height,
    seed,
    quality,
    background: buildBackground(PLANET_BACKGROUND, width, height, rng),
    bodies: [buildScenePlanet(planet, width / 2, height / 2, radiusPx, planetSeed(seed, 0))],
  };
}

export function buildStarScene(
  star: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
  quality: RenderQuality = 'full',
): AstronomicalScene {
  const rng = new RNG(seed);
  const radiusPx = starRadiusKmToPreviewPixels(star.radius, Math.min(width, height));
  return {
    width,
    height,
    seed,
    quality,
    background: buildBackground(STAR_BACKGROUND, width, height, rng),
    bodies: [buildSceneStar(star, width / 2, height / 2, radiusPx)],
  };
}

/**
 * The layout's `baseUnitWidth` and `totalUnits` are working values and stop here: what leaves the
 * builder is an absolute centre and radius per body.
 *
 * A system with no bodies at all yields a scene with an empty `bodies` array. The background is
 * still built, so a backend that wants to show an empty sky can, and one that wants to decline the
 * render can check `bodies.length`.
 */
export function buildStarSystemScene(
  system: StarSystem,
  width: number,
  height: number,
  seed: string,
  quality: RenderQuality = 'full',
): AstronomicalScene {
  const rng = new RNG(seed);
  const layout = computeStarSystemLayout(system, width, height);
  const centerY = height / 2;

  const bodies = layout.items.map((item) => {
    const radiusPx = item.bodySizePixels / 2;
    if (item.kind === 'star') {
      return buildSceneStar(item.body, item.centerX, centerY, radiusPx);
    }
    return buildScenePlanet(
      item.body,
      item.centerX,
      centerY,
      radiusPx,
      planetSeed(seed, item.planetIndex),
    );
  });

  return {
    width,
    height,
    seed,
    quality,
    background: buildBackground(STAR_SYSTEM_BACKGROUND, width, height, rng),
    bodies,
  };
}
