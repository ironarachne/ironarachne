import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RENDER_BUDGET_MS,
  getRendererDecision,
  getRendererSession,
  invalidateRendererSession,
  noteRendererContextLost,
  recordRenderDuration,
  resetRendererSession,
  resolveRendererDecision,
} from '$lib/renderers/renderer_decision';
import {
  writeBackendOverride,
  writeQualityOverride,
} from '$lib/renderers/renderer_preference_storage';
import type { RendererProbe } from '$lib/renderers/renderer_decision_types';

const probeMock = vi.hoisted(() => ({
  result: { webglAvailable: true, softwareRasterizer: false },
}));

vi.mock('$lib/renderers/renderer_probe', () => ({
  probeRendererCapability: () => probeMock.result,
}));

const CAPABLE: RendererProbe = { webglAvailable: true, softwareRasterizer: false };
const NO_WEBGL: RendererProbe = { webglAvailable: false, softwareRasterizer: false };
const SOFTWARE: RendererProbe = {
  webglAvailable: true,
  softwareRasterizer: true,
  unmaskedRenderer: 'Google SwiftShader',
};

describe('resolving a decision', () => {
  it('runs the shaders where the machine can run them', () => {
    expect(resolveRendererDecision(CAPABLE)).toEqual({
      backend: 'webgl',
      quality: 'full',
      reason: 'capable',
    });
  });

  it('falls back to Canvas2D only when WebGL is unavailable', () => {
    // The one genuine backend fallback: slow beats nothing.
    expect(resolveRendererDecision(NO_WEBGL)).toEqual({
      backend: 'canvas2d',
      quality: 'full',
      reason: 'webgl_unavailable',
    });
  });

  it('keeps a software rasterizer on WebGL and turns the detail down', () => {
    // The case the old toggle got backwards. A CPU-rasterized WebGL context is still faster than a
    // per-pixel JavaScript loop, so the answer is less work, not a different backend.
    expect(resolveRendererDecision(SOFTWARE)).toEqual({
      backend: 'webgl',
      quality: 'reduced',
      reason: 'software_rasterizer',
    });
  });

  it('honours a backend override', () => {
    expect(resolveRendererDecision(CAPABLE, { backendOverride: 'canvas2d' })).toEqual({
      backend: 'canvas2d',
      quality: 'full',
      reason: 'user_override',
    });
  });

  it('honours a quality override, in both directions', () => {
    expect(resolveRendererDecision(CAPABLE, { qualityOverride: 'reduced' })).toEqual({
      backend: 'webgl',
      quality: 'reduced',
      reason: 'user_override',
    });
    // Someone who has seen the reduced tier and wants the full one back can say so, even on a
    // machine the probe is unimpressed by.
    expect(resolveRendererDecision(SOFTWARE, { qualityOverride: 'full' })).toEqual({
      backend: 'webgl',
      quality: 'full',
      reason: 'user_override',
    });
  });

  it('will not hand someone a backend their browser does not have', () => {
    // Forcing WebGL where `getContext` fails would trade a working picture for a broken one, and
    // the reason has to keep saying why so the settings UI can explain the override not taking.
    expect(resolveRendererDecision(NO_WEBGL, { backendOverride: 'webgl' })).toEqual({
      backend: 'canvas2d',
      quality: 'full',
      reason: 'webgl_unavailable',
    });
  });

  it('still applies a quality override when the backend override is refused', () => {
    expect(
      resolveRendererDecision(NO_WEBGL, { backendOverride: 'webgl', qualityOverride: 'reduced' }),
    ).toEqual({ backend: 'canvas2d', quality: 'reduced', reason: 'user_override' });
  });
});

describe('the session', () => {
  const store = new Map<string, string>();
  const document = {} as unknown as Document;

  beforeEach(() => {
    store.clear();
    probeMock.result = CAPABLE;
    resetRendererSession();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    resetRendererSession();
    vi.unstubAllGlobals();
  });

  it('probes once and answers from what it found', () => {
    expect(getRendererDecision(document).backend).toBe('webgl');

    probeMock.result = NO_WEBGL;
    // A second ask does not re-probe, so the changed probe is not visible.
    expect(getRendererDecision(document).backend).toBe('webgl');
    expect(getRendererSession()?.probed).toBe(true);
  });

  it('re-resolves after a preference changes', () => {
    getRendererDecision(document);
    writeBackendOverride('canvas2d');
    invalidateRendererSession();

    expect(getRendererDecision(document)).toEqual({
      backend: 'canvas2d',
      quality: 'full',
      reason: 'user_override',
    });
  });

  it('drops to reduced when a render overruns the budget', () => {
    expect(getRendererDecision(document).quality).toBe('full');

    recordRenderDuration(RENDER_BUDGET_MS + 1);

    expect(getRendererDecision(document)).toEqual({
      backend: 'webgl',
      quality: 'reduced',
      reason: 'budget_exceeded',
    });
    expect(getRendererSession()?.lastRenderMs).toBe(RENDER_BUDGET_MS + 1);
  });

  it('stays at full quality for a render inside the budget', () => {
    getRendererDecision(document);
    recordRenderDuration(RENDER_BUDGET_MS);

    expect(getRendererDecision(document).quality).toBe('full');
  });

  it('does not overrule someone who asked for a quality', () => {
    writeQualityOverride('full');
    expect(getRendererDecision(document).quality).toBe('full');

    recordRenderDuration(RENDER_BUDGET_MS * 10);

    expect(getRendererDecision(document).quality).toBe('full');
  });

  it('keeps nothing it measured where a reload could find it', () => {
    getRendererDecision(document);
    recordRenderDuration(RENDER_BUDGET_MS + 1);

    expect(getRendererSession()?.lastRenderMs).toBe(RENDER_BUDGET_MS + 1);
    expect([...store.values()].join()).not.toContain('lastRenderMs');
    expect(store.size).toBe(0);
  });

  it('times a render nobody asked about without falling over', () => {
    // Nothing has resolved a decision yet, which is the case when a caller passes its own.
    expect(() => recordRenderDuration(RENDER_BUDGET_MS + 1)).not.toThrow();
    expect(getRendererSession()).toBeUndefined();
  });

  it('leaves WebGL for the rest of the session once a context is lost', () => {
    expect(getRendererDecision(document).backend).toBe('webgl');

    noteRendererContextLost();

    // The probe still says WebGL is available — it always will, a context is easy to get — so the
    // session has to remember that this one was taken back.
    expect(getRendererDecision(document)).toEqual({
      backend: 'canvas2d',
      quality: 'full',
      reason: 'context_lost',
    });
    expect(getRendererSession()?.contextLost).toBe(true);
  });

  it('keeps the reduced tier through a lost context', () => {
    probeMock.result = SOFTWARE;
    expect(getRendererDecision(document).quality).toBe('reduced');

    noteRendererContextLost();

    expect(getRendererDecision(document)).toEqual({
      backend: 'canvas2d',
      quality: 'reduced',
      reason: 'context_lost',
    });
  });

  it('does not report a lost context as an override when someone had chosen Canvas2D anyway', () => {
    writeBackendOverride('canvas2d');
    noteRendererContextLost();

    expect(getRendererDecision(document)).toEqual({
      backend: 'canvas2d',
      quality: 'full',
      reason: 'user_override',
    });
  });
});
