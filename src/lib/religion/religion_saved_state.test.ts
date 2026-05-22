import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateReligion, getDefaultReligionGenerationConfig } from '$lib/religion/religion_generation';
import {
  appendSavedReligion,
  deleteSavedReligionBySeed,
  loadSavedReligionSnapshots,
  readReligionSavePayload,
  RELIGION_SAVE_SCOPE_ID,
} from '$lib/religion/religion_saved_state';
import {
  toReligionSnapshot,
  type ReligionGeneratorOptionsSnapshot,
} from '$lib/religion/religion_snapshot';
import { SAVE_STORAGE_PREFIX, writeScopedJson } from '$lib/persistent_save/scoped_local_storage';

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

  it('appends and reads religion snapshots', () => {
    const config = getDefaultReligionGenerationConfig();
    const religion = generateReligion('saved-seed', config);
    const snapshot = toReligionSnapshot(religion, 'saved-seed', sampleGeneratorOptions);
    appendSavedReligion(snapshot);

    const loaded = loadSavedReligionSnapshots();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].seed).toBe('saved-seed');
    expect(loaded[0].name).toBe(religion.name);
    expect(store.has(`${SAVE_STORAGE_PREFIX}${RELIGION_SAVE_SCOPE_ID}`)).toBe(true);
  });

  it('deletes saved religion by seed', () => {
    const config = getDefaultReligionGenerationConfig();
    const religion = generateReligion('saved-seed', config);
    const snapshot = toReligionSnapshot(religion, 'saved-seed', sampleGeneratorOptions);
    appendSavedReligion(snapshot);

    expect(deleteSavedReligionBySeed('saved-seed')).toBe(true);
    expect(loadSavedReligionSnapshots()).toEqual([]);
  });

  it('returns false when deleting religion by unknown seed', () => {
    expect(deleteSavedReligionBySeed('unknown-seed')).toBe(false);
  });
});
