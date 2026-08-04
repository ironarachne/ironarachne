import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LEGACY_RENDERER_STORAGE_KEY,
  RENDERER_PREFERENCE_STORAGE_KEY,
  readRendererPreference,
  writeBackendOverride,
  writeQualityOverride,
  writeRendererPreference,
} from '$lib/renderers/renderer_preference_storage';

describe('the renderer preference', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
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
    vi.unstubAllGlobals();
  });

  it('is empty until someone chooses something', () => {
    expect(readRendererPreference()).toEqual({});
  });

  it('round-trips both overrides', () => {
    writeRendererPreference({ backendOverride: 'canvas2d', qualityOverride: 'reduced' });
    expect(readRendererPreference()).toEqual({
      backendOverride: 'canvas2d',
      qualityOverride: 'reduced',
    });
  });

  it('sets one override without disturbing the other', () => {
    writeBackendOverride('canvas2d');
    writeQualityOverride('full');
    expect(readRendererPreference()).toEqual({
      backendOverride: 'canvas2d',
      qualityOverride: 'full',
    });

    writeBackendOverride(undefined);
    expect(readRendererPreference()).toEqual({ qualityOverride: 'full' });
  });

  it('leaves no trace once every override is cleared', () => {
    writeQualityOverride('reduced');
    writeQualityOverride(undefined);

    // "Decide for me" is the state a browser starts in; returning to it must look the same, or the
    // next reader has to tell an empty choice from no choice.
    expect(store.has(RENDERER_PREFERENCE_STORAGE_KEY)).toBe(false);
    expect(readRendererPreference()).toEqual({});
  });

  it('stores nothing that was measured', () => {
    // Decision 6: a render timing is a fact about a machine at a moment, and persisting one would
    // let a single unlucky render pin a capable machine to reduced quality for good.
    writeRendererPreference({ backendOverride: 'webgl', qualityOverride: 'full' });
    const stored: unknown = JSON.parse(store.get(RENDERER_PREFERENCE_STORAGE_KEY) ?? '{}');

    expect(Object.keys(stored as object).sort()).toEqual(['backendOverride', 'qualityOverride']);
  });

  it('ignores values it cannot read, rather than trusting them', () => {
    store.set(RENDERER_PREFERENCE_STORAGE_KEY, '{ not json');
    expect(readRendererPreference()).toEqual({});

    store.set(RENDERER_PREFERENCE_STORAGE_KEY, JSON.stringify({ backendOverride: 'vulkan' }));
    expect(readRendererPreference()).toEqual({});

    store.set(RENDERER_PREFERENCE_STORAGE_KEY, JSON.stringify({ qualityOverride: 'ultra' }));
    expect(readRendererPreference()).toEqual({});

    store.set(RENDERER_PREFERENCE_STORAGE_KEY, JSON.stringify({ lastRenderMs: 900 }));
    expect(readRendererPreference()).toEqual({});
  });

  it('has no opinion where there is no storage at all', () => {
    vi.unstubAllGlobals();
    expect(readRendererPreference()).toEqual({});
    expect(() => writeBackendOverride('canvas2d')).not.toThrow();
  });

  describe('migrating the key it replaces', () => {
    it('reads an old backend name as a deliberate override, once', () => {
      store.set(LEGACY_RENDERER_STORAGE_KEY, 'canvas2d');

      expect(readRendererPreference()).toEqual({ backendOverride: 'canvas2d' });
      // The old key held the only choice there was, so someone who set it chose a backend. It is
      // consumed on the way past: the next read comes from the new key.
      expect(store.has(LEGACY_RENDERER_STORAGE_KEY)).toBe(false);
      expect(readRendererPreference()).toEqual({ backendOverride: 'canvas2d' });
    });

    it('drops an old value it cannot read', () => {
      store.set(LEGACY_RENDERER_STORAGE_KEY, 'metal');

      expect(readRendererPreference()).toEqual({});
      expect(store.has(LEGACY_RENDERER_STORAGE_KEY)).toBe(false);
    });

    it('does not run once a new preference exists', () => {
      writeRendererPreference({ qualityOverride: 'reduced' });
      store.set(LEGACY_RENDERER_STORAGE_KEY, 'canvas2d');

      expect(readRendererPreference()).toEqual({ qualityOverride: 'reduced' });
      expect(store.get(LEGACY_RENDERER_STORAGE_KEY)).toBe('canvas2d');
    });
  });
});
