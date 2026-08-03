/**
 * The Canvas2D backend: walks an {@link AstronomicalScene} issuing context calls.
 *
 * It computes nothing. Every position, radius, colour and angle was resolved by the scene builder,
 * which is what holds this backend and the WebGL one to the same answer. If something here needs a
 * number the scene does not carry, the number belongs in the builder.
 */

import { rgbaCss } from '$lib/graphics/rgb_color_ops';
import {
  drawRingEllipsePatch,
  drawScenePlanetDisk,
} from '$lib/renderers/planets/canvas2d_planet_draw';
import { drawStarPreviewDisk } from '$lib/renderers/stars/canvas2d_star_draw';
import type {
  AstronomicalScene,
  SceneBackground,
  ScenePlanet,
} from '$lib/renderers/astronomical_scene_types';

/**
 * The scene carries a background star's position, radius and alpha, but not its colour — so there
 * is one colour, here. The three renderers each had their own slightly different blue-white before
 * (200,210,240 / 210,220,250 / 220,230,255); this is the middle one, and now both backends use it.
 */
const BACKGROUND_STAR_COLOR = { r: 210 / 255, g: 220 / 255, b: 250 / 255 };

function drawBackground(
  ctx: CanvasRenderingContext2D,
  background: SceneBackground,
  width: number,
  height: number,
): void {
  ctx.fillStyle = background.fillColor;
  ctx.fillRect(0, 0, width, height);

  for (const star of background.stars) {
    ctx.fillStyle = rgbaCss(BACKGROUND_STAR_COLOR, star.alpha);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radiusPx, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Back ring, then the planet over it, then the front ring over that. */
function drawPlanetWithRings(ctx: CanvasRenderingContext2D, planet: ScenePlanet): void {
  drawRingEllipsePatch(ctx, planet, 'back');
  drawScenePlanetDisk(ctx, planet);
  drawRingEllipsePatch(ctx, planet, 'front');
}

export function drawScene(ctx: CanvasRenderingContext2D, scene: AstronomicalScene): void {
  drawBackground(ctx, scene.background, scene.width, scene.height);

  for (const body of scene.bodies) {
    if (body.kind === 'star') {
      drawStarPreviewDisk(ctx, body);
    } else {
      drawPlanetWithRings(ctx, body);
    }
  }
}

/**
 * Draws a scene onto a throwaway canvas and returns it as a PNG data URL.
 *
 * A scene with no bodies renders as an empty string rather than an empty sky — callers treat that
 * as "nothing to show", which is what the star-system renderer did before the scene existed.
 */
export function renderSceneToDataUrl(document: Document, scene: AstronomicalScene): string {
  if (scene.bodies.length === 0) return '';

  const canvas = document.createElement('canvas');
  canvas.width = scene.width;
  canvas.height = scene.height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Could not get 2D context');
  }

  drawScene(ctx, scene);

  const data = canvas.toDataURL('image/png');
  canvas.remove();
  return data;
}
