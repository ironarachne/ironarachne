/**
 * One WebGL context per antialias setting, held for as long as the page lives.
 *
 * The pipeline used to build a fresh canvas and a fresh `THREE.WebGLRenderer` for every preview
 * image and never hand either back, because `renderer.dispose()` does not release a context — it
 * frees three's own caches and listeners. The only thing that reclaimed a preview context was
 * garbage collection of its canvas, at a time nobody controls, so a page that drew enough previews
 * eventually had contexts taken back by the browser. Those evictions fired `webglcontextlost` on
 * canvases whose picture had already been captured, and the site read that bookkeeping about a dead
 * canvas as evidence that this machine cannot run WebGL (#135).
 *
 * Reuse fixes it at the source: two contexts for the whole session, however many previews are
 * drawn. The key is `antialias` because that is a context-creation attribute — it cannot be changed
 * on a renderer that already exists, and it follows the quality tier, so a session that switches
 * tiers holds one context per tier and no page holds a third.
 *
 * The trap to know about before editing this file: `forceContextLoss()`, the call that *does*
 * release a context, works by invoking `WEBGL_lose_context.loseContext()`, which dispatches a real
 * `webglcontextlost` event. So every path that releases a context detaches the listener first —
 * otherwise releasing trips the very fallback the reuse exists to avoid.
 */

import type * as THREE from 'three';

type CachedRenderer = {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  handleContextLost: () => void;
  /** The most recent caller's notification, replaced on every acquire. */
  notify: (() => void) | undefined;
};

const cached = new Map<boolean, CachedRenderer>();

function detachListener(entry: CachedRenderer): void {
  entry.canvas.removeEventListener('webglcontextlost', entry.handleContextLost);
}

/**
 * Drops a context that has genuinely gone away, so the next render builds a fresh one, and only
 * then tells the caller. That order matters: a notification that provokes another render should
 * find the cache empty rather than find the dead renderer still in it.
 *
 * Nothing calls `forceContextLoss()` here — the context is already lost, and asking for it again on
 * a canvas whose listener is being removed in the same breath would be noise.
 */
function discardLostRenderer(antialias: boolean): void {
  const entry = cached.get(antialias);
  if (entry === undefined) return;

  cached.delete(antialias);
  detachListener(entry);
  entry.renderer.dispose();
  entry.notify?.();
}

/**
 * The renderer for this antialias setting, built on first use and returned unchanged after that.
 *
 * `createRenderer` is passed in rather than imported so this module needs no runtime dependency on
 * three — the caller owns the construction options, and a test can hand over a stand-in without a
 * GL context.
 *
 * `onContextLost` fires if the context goes away, which can happen long after the render that
 * registered it has returned. It belongs to whoever asked most recently, not to a particular
 * render: there is one context and one thing to say about it.
 */
export function acquireWebGLRenderer(
  document: Document,
  antialias: boolean,
  createRenderer: (canvas: HTMLCanvasElement) => THREE.WebGLRenderer,
  onContextLost?: () => void,
): THREE.WebGLRenderer {
  const existing = cached.get(antialias);
  if (existing !== undefined) {
    existing.notify = onContextLost;
    return existing.renderer;
  }

  const canvas = document.createElement('canvas');
  const entry: CachedRenderer = {
    renderer: createRenderer(canvas),
    canvas,
    handleContextLost: () => discardLostRenderer(antialias),
    notify: onContextLost,
  };

  canvas.addEventListener('webglcontextlost', entry.handleContextLost);
  cached.set(antialias, entry);
  return entry.renderer;
}

/**
 * Hands every held context back to the browser.
 *
 * The app does not call this — the point of the cache is that the contexts outlive every render —
 * but a caller that knows it is finished with WebGL can, and a test that made real renderers must.
 * No notification goes out: this loss was asked for, and reporting it would tell the session that
 * WebGL had failed when nothing failed.
 */
export function releaseWebGLRenderers(): void {
  const entries = [...cached.values()];
  cached.clear();

  for (const entry of entries) {
    detachListener(entry);
    entry.renderer.forceContextLoss();
    entry.renderer.dispose();
  }
}

/** How many contexts are held right now. For tests and for anything reporting on the session. */
export function heldWebGLRendererCount(): number {
  return cached.size;
}
