/**
 * The WebGL backend's half that is not GPU submission: an {@link AstronomicalScene} in, a draw
 * list out.
 *
 * It computes nothing about the picture. Every position, radius, colour, angle and seed was
 * resolved by the scene builder, which is what holds this backend and the Canvas2D one to the same
 * answer. What is decided here is only how the picture is cut into draws — plane sizes, blending,
 * order — because that is a question about GPUs, not about the planet.
 *
 * Sizes are the one thing worth reading twice: a plane's size in pixels is also the `resolution`
 * uniform its shader converts UVs with, so a plane too small does not scale its body down, it
 * crops it.
 */

import * as THREE from 'three';
import * as PlanetShaders from '$lib/shaders/planets/planets';
import SceneFillShader from '$lib/shaders/background/scene_fill.frag';
import StarShader from '$lib/shaders/stars/star.frag';
import { BACKGROUND_STAR_COLOR } from '$lib/renderers/astronomical/background_star_color';
import { rgbFromHexCss } from '$lib/graphics/rgb_color_ops';
import type RGBColor from '$lib/graphics/rgb_color';
import type {
  AstronomicalScene,
  ScenePlanet,
  SceneStar,
} from '$lib/renderers/astronomical_scene_types';
import type {
  WebGLDrawItem,
  WebGLPlaneItem,
  WebGLPointsItem,
} from '$lib/renderers/webgl_scene_types';

/**
 * The one home for RGB-to-vector conversion. It was three functions in three files —
 * `rgbColorToVector3` twice and `vectorTripletFromRgbTriplet` a third time over a triplet — which
 * is the shape a divergence takes before it is one.
 */
function vector3FromRgb(color: RGBColor): THREE.Vector3 {
  return new THREE.Vector3(color.r, color.g, color.b);
}

/**
 * A planet's plane. Eight radii across: the shader's rings reach 3.6 radii from the centre, and
 * its atmosphere glow a further 24px past the limb, which is what the second term covers for a
 * planet small enough that a flat multiple of its radius would not.
 */
function planetPlaneSizePx(planet: ScenePlanet): number {
  return Math.max(planet.radiusPx * 8, planet.radiusPx * 2.1 + 56);
}

/**
 * A star's plane, matching the extent of the halo the Canvas2D backend draws. The shader's corona
 * stops dead at 2.5 corona widths, so this leaves margin rather than cutting a square edge across
 * a glow.
 */
function starPlaneSizePx(star: SceneStar): number {
  return (star.radiusPx + star.coronaWidthPx * 4) * 2;
}

/** The renderer's y axis points up and the scene's points down. */
function worldY(scene: AstronomicalScene, sceneY: number): number {
  return scene.height - sceneY;
}

function buildFillItem(scene: AstronomicalScene): WebGLPlaneItem {
  return {
    kind: 'plane',
    widthPx: scene.width,
    heightPx: scene.height,
    centerX: scene.width / 2,
    centerY: scene.height / 2,
    fragmentShader: SceneFillShader,
    uniforms: {
      fill_color: { value: vector3FromRgb(rgbFromHexCss(scene.background.fillColor)) },
    },
    blending: 'normal',
  };
}

/** A sky with no stars in it is no draw at all, rather than a points object with nothing to draw. */
function buildBackgroundStarsItem(scene: AstronomicalScene): WebGLPointsItem | undefined {
  const stars = scene.background.stars;
  if (stars.length === 0) return undefined;

  const positions = new Float32Array(stars.length * 3);
  const radii = new Float32Array(stars.length);
  const alphas = new Float32Array(stars.length);

  stars.forEach((star, index) => {
    positions[index * 3] = star.x;
    positions[index * 3 + 1] = worldY(scene, star.y);
    positions[index * 3 + 2] = 0;
    radii[index] = star.radiusPx;
    alphas[index] = star.alpha;
  });

  return {
    kind: 'points',
    positions,
    radii,
    alphas,
    color: vector3FromRgb(BACKGROUND_STAR_COLOR),
  };
}

/**
 * `render_background` is 0 on every body: the background is one pass of its own, from the star
 * positions the scene carries, and a body that generated its own would be painting a second sky
 * over the first.
 */
function buildStarItem(scene: AstronomicalScene, star: SceneStar): WebGLPlaneItem {
  const planeSize = starPlaneSizePx(star);

  return {
    kind: 'plane',
    widthPx: planeSize,
    heightPx: planeSize,
    centerX: star.centerX,
    centerY: worldY(scene, star.centerY),
    fragmentShader: StarShader,
    uniforms: {
      seed: { value: star.seedFloat },
      render_background: { value: 0 },
      resolution: { value: new THREE.Vector2(planeSize, planeSize) },
      corona_width: { value: star.coronaWidthPx },
      glow_color: { value: vector3FromRgb(star.glow) },
      corona_color: { value: vector3FromRgb(star.corona) },
      star_color: { value: vector3FromRgb(star.photosphere) },
      star_radius: { value: star.radiusPx },
    },
    // A corona is light, not a surface: it adds to the sky behind it rather than replacing it.
    blending: 'additive',
  };
}

/**
 * Every uniform here reads off the scene. The palette in particular: the WebGL path used to roll
 * `getRandomGasGiantRgbTriplet` for itself and hand gas-giant colours to every planet, whatever
 * its classification, while the Canvas2D path resolved a palette from that classification.
 *
 * A planet with no ring still carries the three ring uniforms, because the shader declares them
 * and a missing uniform is a GL error rather than a default. `has_rings` is what turns them off.
 */
function buildPlanetItem(scene: AstronomicalScene, planet: ScenePlanet): WebGLPlaneItem {
  const planeSize = planetPlaneSizePx(planet);
  const ring = planet.ring;

  return {
    kind: 'plane',
    widthPx: planeSize,
    heightPx: planeSize,
    centerX: planet.centerX,
    centerY: worldY(scene, planet.centerY),
    fragmentShader: PlanetShaders.getFragmentShaderByName(planet.classification),
    uniforms: {
      seed: { value: planet.shading.seedFloat },
      render_background: { value: 0 },
      resolution: { value: new THREE.Vector2(planeSize, planeSize) },
      planet_radius: { value: planet.radiusPx },
      light_direction: { value: new THREE.Vector3(...planet.shading.lightDir) },
      main_color: { value: vector3FromRgb(planet.palette.main) },
      band_color_1: { value: vector3FromRgb(planet.palette.band1) },
      band_color_2: { value: vector3FromRgb(planet.palette.band2) },
      cloud_coverage: { value: planet.shading.cloudCoverage },
      storm_activity: { value: planet.shading.stormActivity },
      has_rings: { value: ring === undefined ? 0 : 1 },
      ring_angle: { value: ring?.angleRad ?? 0 },
      ring_tilt: { value: ring?.tilt ?? 0 },
      ring_color: { value: vector3FromRgb(ring?.color ?? { r: 0, g: 0, b: 0 }) },
    },
    blending: 'normal',
  };
}

/**
 * Background fill, then the background stars, then the bodies in scene order — the same
 * back-to-front sequence `drawScene` issues on a 2D context.
 */
export function buildWebGLDrawList(scene: AstronomicalScene): WebGLDrawItem[] {
  const items: WebGLDrawItem[] = [buildFillItem(scene)];

  const stars = buildBackgroundStarsItem(scene);
  if (stars !== undefined) items.push(stars);

  for (const body of scene.bodies) {
    items.push(body.kind === 'star' ? buildStarItem(scene, body) : buildPlanetItem(scene, body));
  }

  return items;
}
