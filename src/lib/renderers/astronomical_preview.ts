/**
 * The public render entry points: a body or a system in, a PNG data URL out.
 *
 * Choosing a backend is not a question the caller is asked any more. Each entry point resolves the
 * decision for the page session — probe once, honour any override, drop a tier if the machine
 * cannot keep up — and a caller that wants a specific one passes it in. They stay synchronous and
 * keep returning a data URL; capability detection needed the pipeline to be *stateful*, which is
 * not the same as needing it to be asynchronous. See decision 5 in `docs/renderers.md`.
 */

import * as WebGLSceneDraw from '$lib/renderers/webgl_scene_draw';
import * as Canvas2dSceneDraw from '$lib/renderers/canvas2d_scene_draw';
import {
  buildPlanetScene,
  buildStarScene,
  buildStarSystemScene,
} from '$lib/renderers/astronomical_scene';
import {
  getRendererDecision,
  noteRendererContextLost,
  noteRendererRenderFailed,
  recordRenderDuration,
} from '$lib/renderers/renderer_decision';
import type { AstronomicalScene } from '$lib/renderers/astronomical_scene_types';
import type { RendererDecision } from '$lib/renderers/renderer_decision_types';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';

/** Builds the scene at the decided quality, draws it on the decided backend, and times the result. */
function renderScene(
  document: Document,
  decision: RendererDecision,
  build: (quality: RendererDecision['quality']) => AstronomicalScene,
): string {
  const scene = build(decision.quality);
  const startedAt = performance.now();
  const data = drawOnBackend(document, decision, scene);
  recordRenderDuration(performance.now() - startedAt);
  return data;
}

/**
 * A WebGL render that throws is a different failure from a context that goes away, and the two are
 * reported differently. A lost context is recoverable — the renderer is rebuilt and the next
 * preview draws on a fresh one — while a render that could not get a context or could not submit
 * has nothing left to try, so it ends WebGL for the session and falls back here rather than showing
 * nothing.
 */
function drawOnBackend(
  document: Document,
  decision: RendererDecision,
  scene: AstronomicalScene,
): string {
  if (decision.backend === 'canvas2d') {
    return Canvas2dSceneDraw.renderSceneToDataUrl(document, scene);
  }

  try {
    return WebGLSceneDraw.renderSceneToDataUrl(document, scene, noteRendererContextLost);
  } catch {
    noteRendererRenderFailed();
    return Canvas2dSceneDraw.renderSceneToDataUrl(document, scene);
  }
}

export function renderPlanetPreviewImage(
  document: Document,
  planet: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
  decision: RendererDecision = getRendererDecision(document),
): string {
  return renderScene(document, decision, (quality) =>
    buildPlanetScene(planet, width, height, seed, quality),
  );
}

export function renderStarPreviewImage(
  document: Document,
  star: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
  decision: RendererDecision = getRendererDecision(document),
): string {
  return renderScene(document, decision, (quality) =>
    buildStarScene(star, width, height, seed, quality),
  );
}

export function renderStarSystemPreviewImage(
  document: Document,
  system: StarSystem,
  width: number,
  height: number,
  seed: string,
  decision: RendererDecision = getRendererDecision(document),
): string {
  return renderScene(document, decision, (quality) =>
    buildStarSystemScene(system, width, height, seed, quality),
  );
}
