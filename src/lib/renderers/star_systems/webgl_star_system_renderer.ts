import { buildStarSystemScene } from '$lib/renderers/astronomical_scene';
import { renderSceneToDataUrl } from '$lib/renderers/webgl_scene_draw';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';

export function render(
  document: Document,
  system: StarSystem,
  width: number,
  height: number,
  seed: string,
): string {
  return renderSceneToDataUrl(document, buildStarSystemScene(system, width, height, seed));
}
