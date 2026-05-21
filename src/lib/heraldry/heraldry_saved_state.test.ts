import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateHeraldry } from '$lib/heraldry/generator.js';
import { mergeHeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import {
  appendSavedHeraldry,
  HERALDRY_SAVE_SCOPE_ID,
  loadSavedHeraldrySnapshots,
  readHeraldrySavePayload,
} from '$lib/heraldry/heraldry_saved_state.js';
import { toHeraldrySnapshot, type HeraldryGeneratorOptionsSnapshot } from '$lib/heraldry/heraldry_snapshot.js';
import { SAVE_STORAGE_PREFIX, writeScopedJson } from '$lib/persistent_save/scoped_local_storage.js';

const sampleGeneratorOptions: HeraldryGeneratorOptionsSnapshot = {
  heraldryTag: 'any',
  chargeTinctureName: 'any',
  numberOfChargesOption: 'any',
  chargePosition: 'normal',
  lockSeed: false,
};

describe('heraldry_saved_state', () => {
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

  it('returns empty heraldries when storage is missing', () => {
    expect(readHeraldrySavePayload().heraldries).toEqual([]);
    expect(loadSavedHeraldrySnapshots()).toEqual([]);
  });

  it('returns empty heraldries for invalid payload', () => {
    writeScopedJson(HERALDRY_SAVE_SCOPE_ID, { payloadVersion: 99, heraldries: [] });
    expect(readHeraldrySavePayload().heraldries).toEqual([]);
  });

  it('appends and reads heraldry snapshots', () => {
    const arms = generateHeraldry(mergeHeraldryGeneratorConfig({ chargeCount: 1 }));
    const snapshot = toHeraldrySnapshot(arms, 'saved-seed', sampleGeneratorOptions);
    appendSavedHeraldry(snapshot);

    const loaded = loadSavedHeraldrySnapshots();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].seed).toBe('saved-seed');
    expect(loaded[0].blazon).toBe(arms.blazon);
    expect(store.has(`${SAVE_STORAGE_PREFIX}${HERALDRY_SAVE_SCOPE_ID}`)).toBe(true);
  });
});
