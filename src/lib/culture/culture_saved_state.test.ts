import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  appendSavedCulture,
  CULTURE_SAVE_SCOPE_ID,
  deleteSavedCultureByName,
  generateCulture,
  getDefaultCultureGenerationConfig,
  loadSavedCultureSnapshots,
  readCultureSavePayload,
} from '$lib/culture';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { SAVE_STORAGE_PREFIX, writeScopedJson } from '$lib/persistent_save/scoped_local_storage';
import { RNG } from '@ironarachne/rng';

describe('culture_saved_state', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      get length() {
        return store.size;
      },
      key: (i: number) => [...store.keys()][i] ?? null,
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty cultures when storage is missing', () => {
    expect(readCultureSavePayload().cultures).toEqual([]);
    expect(loadSavedCultureSnapshots()).toEqual([]);
  });

  it('returns empty cultures for invalid payload', () => {
    writeScopedJson(CULTURE_SAVE_SCOPE_ID, { payloadVersion: 99, cultures: [] });
    expect(readCultureSavePayload().cultures).toEqual([]);
  });

  it('appends and reads culture snapshots', () => {
    const rng = new RNG('test');
    const config = getDefaultCultureGenerationConfig();
    config.nameGenerators = getFantasyNameGeneratorSet('human', rng);
    const culture = generateCulture('saved-seed', config);
    appendSavedCulture(culture);

    const loaded = loadSavedCultureSnapshots();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe(culture.name);
    expect(store.has(`${SAVE_STORAGE_PREFIX}${CULTURE_SAVE_SCOPE_ID}`)).toBe(true);
  });

  it('deletes saved culture by name', () => {
    const rng = new RNG('test');
    const config = getDefaultCultureGenerationConfig();
    config.nameGenerators = getFantasyNameGeneratorSet('human', rng);
    const culture = generateCulture('saved-seed', config);
    appendSavedCulture(culture);

    expect(deleteSavedCultureByName(culture.name)).toBe(true);
    expect(loadSavedCultureSnapshots()).toEqual([]);
  });

  it('returns false when deleting culture by unknown name', () => {
    expect(deleteSavedCultureByName('Unknown Culture')).toBe(false);
  });
});
