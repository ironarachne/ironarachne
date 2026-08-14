import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readScopedJson, writeScopedJson } from '$lib/persistent_save';

import {
  emptyLegacyAdoptionRecord,
  LEGACY_ADOPTION_SAVE_SCOPE_ID,
  readLegacyAdoptionRecord,
  writeLegacyAdoptionRecord,
} from './legacy_adoption_saved_state';
import {
  LEGACY_ADOPTION_PAYLOAD_VERSION,
  type LegacyAdoptionRecord,
} from './legacy_adoption_types';

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

const notice = { projectId: 'project-1', adoptedCount: 3, skippedCount: 1, at: 1_000 };

describe('readLegacyAdoptionRecord', () => {
  it('reads an untouched browser as an empty record', () => {
    expect(readLegacyAdoptionRecord()).toEqual(emptyLegacyAdoptionRecord());
  });

  it('round-trips what was written', () => {
    const record: LegacyAdoptionRecord = {
      payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION,
      projectId: 'project-1',
      adoptedKeys: ['generator.culture:Aurelian'],
      notice,
    };

    writeLegacyAdoptionRecord(record);

    expect(readLegacyAdoptionRecord()).toEqual(record);
  });

  it.each([
    ['a non-object', 'nonsense'],
    ['a wrong version', { payloadVersion: 99, adoptedKeys: [] }],
    ['a missing key list', { payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION }],
    [
      'a key list holding something other than strings',
      { payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION, adoptedKeys: [1] },
    ],
  ])('reads %s as empty rather than throwing', (_label, stored) => {
    writeScopedJson(LEGACY_ADOPTION_SAVE_SCOPE_ID, stored);

    expect(readLegacyAdoptionRecord()).toEqual(emptyLegacyAdoptionRecord());
  });

  it('keeps the adopted keys when only the notice is damaged', () => {
    // The keys are what stops a second run duplicating everything. Discarding them because an
    // adjacent field is malformed would trade a cosmetic loss for a real one.
    writeScopedJson(LEGACY_ADOPTION_SAVE_SCOPE_ID, {
      payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION,
      projectId: 'project-1',
      adoptedKeys: ['generator.culture:Aurelian'],
      notice: { projectId: 'project-1', adoptedCount: 'three', skippedCount: 0, at: 1 },
    });

    const record = readLegacyAdoptionRecord();

    expect(record.adoptedKeys).toEqual(['generator.culture:Aurelian']);
    expect(record.notice).toBeNull();
  });

  it('reads a blank project id as none, so nothing is filed under an empty string', () => {
    writeScopedJson(LEGACY_ADOPTION_SAVE_SCOPE_ID, {
      payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION,
      projectId: '',
      adoptedKeys: [],
      notice: null,
    });

    expect(readLegacyAdoptionRecord().projectId).toBeNull();
  });

  it('stores under a scope of its own', () => {
    writeLegacyAdoptionRecord(emptyLegacyAdoptionRecord());

    expect(readScopedJson(LEGACY_ADOPTION_SAVE_SCOPE_ID)).not.toBeNull();
    expect(LEGACY_ADOPTION_SAVE_SCOPE_ID).toBe('workshop.legacy_adoption');
  });
});
