/**
 * What the site knows about the machine, what it decided from that, and which half of it survives
 * the tab closing.
 *
 * These types are the "The capability decision" class diagram in `docs/renderers.md`. That document
 * is the authority: if an implementation needs a shape the diagram does not have, amend the diagram
 * first.
 *
 * The distinction the whole design rests on: **backend choice is a capability question with one
 * right answer, and quality is a budget question with a dial.** WebGL being unavailable is a real
 * fallback, because slow beats nothing. A weak GPU is not — swapping to a per-pixel JavaScript loop
 * makes that worse, and the answer is less work, not different work.
 */

import type { RenderQuality } from '$lib/renderers/astronomical_scene_types';
import type { RendererBackend } from '$lib/renderers/renderer_backend';

/** What one look at the machine found. Cheap enough to redo, and it is redone rather than stored. */
export type RendererProbe = {
  webglAvailable: boolean;
  softwareRasterizer: boolean;
  unmaskedRenderer?: string;
};

/**
 * Why a decision came out the way it did. Carried so the settings UI can say *why* — "Canvas2D,
 * because WebGL is unavailable" is a different message from "Canvas2D, because you chose it" — and
 * so a bug report can tell them apart.
 */
export type DecisionReason =
  | 'capable'
  | 'webgl_unavailable'
  | 'context_lost'
  | 'software_rasterizer'
  | 'budget_exceeded'
  | 'user_override';

export type RendererDecision = {
  backend: RendererBackend;
  quality: RenderQuality;
  reason: DecisionReason;
};

/**
 * The runtime holder: one module-level value in `renderer_decision.ts`, resolved on first use and
 * re-resolved after a lost context. It lives for the page session and starts over on reload.
 *
 * `lastRenderMs` is here and deliberately not on {@link RendererPreference}. A render timing is a
 * fact about a machine at a moment — thermal state, what else held the GPU, whether the tab was
 * backgrounded — and persisting it would let one unlucky first render pin a capable machine to
 * `reduced` forever, with no way for its owner to find out why. See decision 6.
 */
export type RendererSession = {
  decision: RendererDecision;
  lastRenderMs?: number;
  probed: boolean;
  /**
   * Whether this session has seen a WebGL context go away. Not part of the diagram's shape but of
   * its behaviour: it is what makes the fallback stick for the rest of the session rather than
   * flapping back to a backend that has already failed once.
   */
  contextLost: boolean;
};

/**
 * The persisted half, and only what a person set deliberately and can unset the same way. Both
 * fields absent means "decide for me", which is the default and the case the design is built for.
 */
export type RendererPreference = {
  backendOverride?: RendererBackend;
  qualityOverride?: RenderQuality;
};
