import * as WebGLPlanetRenderer from '$lib/renderers/planets/webgl_planet_renderer';
import * as Canvas2dPlanetRenderer from '$lib/renderers/planets/canvas2d_planet_renderer';
import * as WebGLStarRenderer from '$lib/renderers/stars/webgl_star_renderer';
import * as Canvas2dStarRenderer from '$lib/renderers/stars/canvas2d_star_renderer';
import * as WebGLStarSystemRenderer from '$lib/renderers/star_systems/webgl_star_system_renderer';
import * as Canvas2dStarSystemRenderer from '$lib/renderers/star_systems/canvas2d_star_system_renderer';
import type { AstronomicalRendererKind } from '$lib/renderers/astronomical_renderer_kind';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';

export function renderPlanetPreviewImage(
  document: Document,
  planet: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
  kind: AstronomicalRendererKind,
): string {
  if (kind === 'canvas2d') {
    return Canvas2dPlanetRenderer.render(document, planet, width, height, seed);
  }
  return WebGLPlanetRenderer.render(document, planet, width, height, seed);
}

export function renderStarPreviewImage(
  document: Document,
  star: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
  kind: AstronomicalRendererKind,
): string {
  if (kind === 'canvas2d') {
    return Canvas2dStarRenderer.render(document, star, width, height, seed);
  }
  return WebGLStarRenderer.render(document, star, width, height, seed);
}

export function renderStarSystemPreviewImage(
  document: Document,
  system: StarSystem,
  width: number,
  height: number,
  seed: string,
  kind: AstronomicalRendererKind,
): string {
  if (kind === 'canvas2d') {
    return Canvas2dStarSystemRenderer.render(document, system, width, height, seed);
  }
  return WebGLStarSystemRenderer.render(document, system, width, height, seed);
}
