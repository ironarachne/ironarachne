/**
 * Turns what the machine can do, plus what its owner asked for, into which backend renders at what
 * quality — and holds that answer for the page session.
 *
 * `resolveRendererDecision` is pure and is where the rules live. Everything below it is the session
 * around that function: probe once, remember, re-probe after a lost context. Nothing measured is
 * written to storage; see decision 6 in `docs/renderers.md`.
 */

import { probeRendererCapability } from '$lib/renderers/renderer_probe';
import { readRendererPreference } from '$lib/renderers/renderer_preference_storage';
import type {
  RendererDecision,
  RendererPreference,
  RendererProbe,
  RendererSession,
} from '$lib/renderers/renderer_decision_types';

/**
 * How long one preview may take before the site stops asking this machine for full quality.
 *
 * A preview is a still image someone waits on with nothing else happening, so the budget sits where
 * the wait stops reading as "drawing" and starts reading as "stuck". It is deliberately not a frame
 * budget: nothing here animates.
 */
export const RENDER_BUDGET_MS = 400;

/**
 * WebGL being unavailable is the one case where the backend genuinely changes, because slow beats
 * nothing. A software rasterizer is not that case: it renders, and the answer to a slow renderer is
 * less work, not different work.
 */
function resolveFromProbe(probe: RendererProbe): RendererDecision {
  if (!probe.webglAvailable) {
    return { backend: 'canvas2d', quality: 'full', reason: 'webgl_unavailable' };
  }
  if (probe.softwareRasterizer) {
    return { backend: 'webgl', quality: 'reduced', reason: 'software_rasterizer' };
  }
  return { backend: 'webgl', quality: 'full', reason: 'capable' };
}

/**
 * Overrides sit on top of the probe, with one limit: a person can choose a backend, but not one the
 * machine does not have. Forcing WebGL where `getContext` fails would trade a working picture for a
 * broken one, so the probe wins and the reason stays `webgl_unavailable` — which is exactly what
 * the settings UI needs to say that the override did not take, and why.
 */
export function resolveRendererDecision(
  probe: RendererProbe,
  preference: RendererPreference = {},
): RendererDecision {
  const base = resolveFromProbe(probe);

  const backendOverride =
    preference.backendOverride === 'webgl' && !probe.webglAvailable
      ? undefined
      : preference.backendOverride;
  const overridden = backendOverride !== undefined || preference.qualityOverride !== undefined;

  return {
    backend: backendOverride ?? base.backend,
    quality: preference.qualityOverride ?? base.quality,
    reason: overridden ? 'user_override' : base.reason,
  };
}

/**
 * A context that has gone away once is not trusted again for the rest of the session, whatever the
 * probe now says — a context is easy to get and this one has already been taken back. It is not
 * persisted, though: a lost context is usually a driver hiccup or a machine waking from sleep, not
 * a permanent fact about the hardware, so a reload starts over.
 */
function resolveAfterContextLoss(
  probe: RendererProbe,
  preference: RendererPreference,
): RendererDecision {
  const decision = resolveRendererDecision(probe, preference);
  if (decision.backend === 'canvas2d') return decision;
  return { backend: 'canvas2d', quality: decision.quality, reason: 'context_lost' };
}

let session: RendererSession | undefined;
let contextLostThisSession = false;

function resolveSession(document: Document): RendererSession {
  const probe = probeRendererCapability(document);
  const preference = readRendererPreference();
  return {
    decision: contextLostThisSession
      ? resolveAfterContextLoss(probe, preference)
      : resolveRendererDecision(probe, preference),
    probed: true,
    contextLost: contextLostThisSession,
  };
}

/**
 * The decision for this page session, probing once on first use. Callers may ask on every render;
 * after the first the cost is a property read.
 */
export function getRendererDecision(document: Document): RendererDecision {
  session ??= resolveSession(document);
  return session.decision;
}

/** What the session currently holds, or nothing if it has not probed yet. For the settings UI. */
export function getRendererSession(): RendererSession | undefined {
  return session;
}

/**
 * Drops this session to `reduced` when a render overruns the budget — unless its owner asked for a
 * quality explicitly, because someone who chose `full` and waits for it is not making a mistake.
 *
 * Only a `full` render can overrun into a drop: `reduced` is the bottom of the dial, and timing it
 * again would only restate the same decision with a different reason.
 */
export function recordRenderDuration(milliseconds: number): void {
  if (session === undefined) return;
  session.lastRenderMs = milliseconds;

  if (milliseconds <= RENDER_BUDGET_MS) return;
  if (session.decision.quality !== 'full') return;
  if (readRendererPreference().qualityOverride !== undefined) return;

  session.decision = { ...session.decision, quality: 'reduced', reason: 'budget_exceeded' };
}

/**
 * Called when a WebGL context is lost, and when a WebGL render fails outright — the same thing
 * arriving as an exception rather than as an event. The next render re-probes, and because the
 * session now knows WebGL has failed on this machine, it resolves to Canvas2D.
 */
export function noteRendererContextLost(): void {
  contextLostThisSession = true;
  session = undefined;
}

/**
 * Throws away the resolved decision so the next render re-resolves. This is what a preference
 * change calls; it deliberately keeps what the session has learned about context loss.
 */
export function invalidateRendererSession(): void {
  session = undefined;
}

/** Clears everything this session learned, context loss included. For tests. */
export function resetRendererSession(): void {
  session = undefined;
  contextLostThisSession = false;
}
