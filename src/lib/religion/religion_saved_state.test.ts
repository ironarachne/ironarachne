import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateReligion, getDefaultReligionGenerationConfig } from './religion_generation';
import {
  loadSavedReligionSnapshots,
  readReligionSavePayload,
  RELIGION_SAVE_PAYLOAD_VERSION,
  RELIGION_SAVE_SCOPE_ID,
} from './religion_saved_state';
import { toReligionSnapshot, type ReligionGeneratorOptionsSnapshot } from './religion_snapshot';
import { SAVE_STORAGE_PREFIX, writeScopedJson } from '$lib/persistent_save';

const sampleGeneratorOptions: ReligionGeneratorOptionsSnapshot = {
  lockSeed: false,
  selectedCategories: ['polytheism'],
  selectedSpecies: ['human'],
  polytheisticStanding: 'random',
  spiritCosmologyDepth: 'random',
  useSavedCulture: false,
};

describe('religion_saved_state', () => {
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

  it('returns empty religions when storage is missing', () => {
    expect(readReligionSavePayload().religions).toEqual([]);
    expect(loadSavedReligionSnapshots()).toEqual([]);
  });

  it('returns empty religions for invalid payload', () => {
    writeScopedJson(RELIGION_SAVE_SCOPE_ID, { payloadVersion: 99, religions: [] });
    expect(readReligionSavePayload().religions).toEqual([]);
  });

  it('reads religion snapshots left by an older build', () => {
    const config = getDefaultReligionGenerationConfig();
    const religion = generateReligion('saved-seed', config);
    const snapshot = toReligionSnapshot(religion, 'saved-seed', sampleGeneratorOptions);
    // Written straight to the scope: it is read-only as of #44, so no writer is left to call.
    writeScopedJson(RELIGION_SAVE_SCOPE_ID, {
      payloadVersion: RELIGION_SAVE_PAYLOAD_VERSION,
      religions: [snapshot],
    });

    const loaded = loadSavedReligionSnapshots();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].seed).toBe('saved-seed');
    expect(loaded[0].name).toBe(religion.name);
    expect(store.has(`${SAVE_STORAGE_PREFIX}${RELIGION_SAVE_SCOPE_ID}`)).toBe(true);
  });
});
