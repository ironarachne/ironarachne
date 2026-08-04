import { buildStarScene } from '$lib/renderers/astronomical_scene';
import { renderSceneToDataUrl } from '$lib/renderers/webgl_scene_draw';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';

export function render(
  document: Document,
  star: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
): string {
  return renderSceneToDataUrl(document, buildStarScene(star, width, height, seed));
}
