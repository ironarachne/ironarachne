import { afterEach, describe, expect, it } from 'vitest';
import {
  acquireWebGLRenderer,
  heldWebGLRendererCount,
  releaseWebGLRenderers,
} from './webgl_renderer_cache';
import type * as THREE from 'three';

/**
 * The cache is the whole of the fix for #135, and none of it needs a GPU: what it has to get right
 * is how many renderers exist, when one is thrown away, and whether the `webglcontextlost` listener
 * is attached at the moment a release fires that event. So the renderer here is a stand-in that
 * records calls, and `createRenderer` being a parameter rather than an import is what makes that
 * possible.
 */
type FakeRenderer = {
  disposed: number;
  forcedContextLoss: number;
};

type FakeCanvas = {
  listeners: Map<string, Set<() => void>>;
  /** Dispatches like the browser does when `WEBGL_lose_context.loseContext()` is called. */
  loseContext: () => void;
};

function fakeEnvironment() {
  const renderers: FakeRenderer[] = [];
  const canvases: FakeCanvas[] = [];

  function createCanvas(): FakeCanvas & HTMLCanvasElement {
    const listeners = new Map<string, Set<() => void>>();
    const canvas = {
      listeners,
      addEventListener: (type: string, listener: () => void) => {
        const forType = listeners.get(type) ?? new Set<() => void>();
        forType.add(listener);
        listeners.set(type, forType);
      },
      removeEventListener: (type: string, listener: () => void) => {
        listeners.get(type)?.delete(listener);
      },
      loseContext: () => {
        for (const listener of [...(listeners.get('webglcontextlost') ?? [])]) listener();
      },
    };
    canvases.push(canvas as unknown as FakeCanvas);
    return canvas as unknown as FakeCanvas & HTMLCanvasElement;
  }

  function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer: FakeRenderer = { disposed: 0, forcedContextLoss: 0 };
    renderers.push(renderer);
    return {
      domElement: canvas,
      dispose: () => {
        renderer.disposed += 1;
      },
      // The trap this module exists around: releasing a context dispatches the loss event.
      forceContextLoss: () => {
        renderer.forcedContextLoss += 1;
        (canvas as unknown as FakeCanvas).loseContext();
      },
    } as unknown as THREE.WebGLRenderer;
  }

  return {
    document: { createElement: () => createCanvas() } as unknown as Document,
    renderers,
    canvases,
    createRenderer,
  };
}

afterEach(() => {
  releaseWebGLRenderers();
});

describe('acquiring a renderer', () => {
  it('builds one renderer per antialias setting and reuses it after that', () => {
    const fake = fakeEnvironment();

    const first = acquireWebGLRenderer(fake.document, true, fake.createRenderer);
    const again = acquireWebGLRenderer(fake.document, true, fake.createRenderer);
    const other = acquireWebGLRenderer(fake.document, false, fake.createRenderer);

    expect(again).toBe(first);
    expect(other).not.toBe(first);
    // The bug this replaces: one context per preview image, none of them released.
    expect(fake.renderers).toHaveLength(2);
    expect(heldWebGLRendererCount()).toBe(2);
  });

  it('holds two contexts however many previews are drawn', () => {
    const fake = fakeEnvironment();

    for (let index = 0; index < 200; index++) {
      acquireWebGLRenderer(fake.document, index % 2 === 0, fake.createRenderer);
    }

    expect(fake.renderers).toHaveLength(2);
  });

  it('notifies whoever asked most recently, not whoever asked first', () => {
    const fake = fakeEnvironment();
    const seen: string[] = [];

    acquireWebGLRenderer(fake.document, true, fake.createRenderer, () => seen.push('first'));
    acquireWebGLRenderer(fake.document, true, fake.createRenderer, () => seen.push('second'));
    fake.canvases[0].loseContext();

    // There is one context, so there is one thing to say about it: that it is gone, said once.
    expect(seen).toEqual(['second']);
  });

  it('carries on without a listener when nobody asked for one', () => {
    const fake = fakeEnvironment();

    acquireWebGLRenderer(fake.document, true, fake.createRenderer, () => {});
    acquireWebGLRenderer(fake.document, true, fake.createRenderer);

    expect(() => fake.canvases[0].loseContext()).not.toThrow();
    expect(heldWebGLRendererCount()).toBe(0);
  });
});

describe('a lost context', () => {
  it('is discarded, so the next render builds a fresh one', () => {
    const fake = fakeEnvironment();

    acquireWebGLRenderer(fake.document, true, fake.createRenderer);
    fake.canvases[0].loseContext();

    expect(heldWebGLRendererCount()).toBe(0);
    expect(fake.renderers[0].disposed).toBe(1);

    acquireWebGLRenderer(fake.document, true, fake.createRenderer);
    expect(fake.renderers).toHaveLength(2);
  });

  it('takes its listener with it, so a second event cannot report it twice', () => {
    const fake = fakeEnvironment();
    let losses = 0;

    acquireWebGLRenderer(fake.document, true, fake.createRenderer, () => {
      losses += 1;
    });
    fake.canvases[0].loseContext();
    fake.canvases[0].loseContext();

    expect(losses).toBe(1);
    expect(fake.canvases[0].listeners.get('webglcontextlost')?.size ?? 0).toBe(0);
  });

  it('leaves the renderer for the other tier alone', () => {
    const fake = fakeEnvironment();

    const antialiased = acquireWebGLRenderer(fake.document, true, fake.createRenderer);
    acquireWebGLRenderer(fake.document, false, fake.createRenderer);
    fake.canvases[1].loseContext();

    expect(heldWebGLRendererCount()).toBe(1);
    expect(acquireWebGLRenderer(fake.document, true, fake.createRenderer)).toBe(antialiased);
  });

  it('empties the cache before it says so, so a redraw finds nothing dead in it', () => {
    const fake = fakeEnvironment();
    let heldWhenNotified = -1;

    acquireWebGLRenderer(fake.document, true, fake.createRenderer, () => {
      heldWhenNotified = heldWebGLRendererCount();
    });
    fake.canvases[0].loseContext();

    expect(heldWhenNotified).toBe(0);
  });
});

describe('releasing', () => {
  it('hands every context back and forgets them', () => {
    const fake = fakeEnvironment();

    acquireWebGLRenderer(fake.document, true, fake.createRenderer);
    acquireWebGLRenderer(fake.document, false, fake.createRenderer);
    releaseWebGLRenderers();

    expect(heldWebGLRendererCount()).toBe(0);
    expect(fake.renderers.map((renderer) => renderer.forcedContextLoss)).toEqual([1, 1]);
    expect(fake.renderers.map((renderer) => renderer.disposed)).toEqual([1, 1]);
  });

  it('does not report the loss it asked for', () => {
    // `forceContextLoss()` dispatches a real `webglcontextlost`, so a release that left the
    // listener attached would tell the session WebGL had failed every time it tidied up — which is
    // the trap that makes the obvious one-line version of this fix worse than the bug.
    const fake = fakeEnvironment();
    let losses = 0;

    acquireWebGLRenderer(fake.document, true, fake.createRenderer, () => {
      losses += 1;
    });
    releaseWebGLRenderers();

    expect(losses).toBe(0);
  });

  it('is safe with nothing held', () => {
    expect(() => releaseWebGLRenderers()).not.toThrow();
    expect(heldWebGLRendererCount()).toBe(0);
  });
});
