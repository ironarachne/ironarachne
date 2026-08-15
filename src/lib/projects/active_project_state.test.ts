import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SAVE_STORAGE_PREFIX } from '$lib/persistent_save';

import {
  ACTIVE_PROJECT_SAVE_SCOPE_ID,
  readActiveProjectPayload,
  writeActiveProjectPayload,
} from './active_project_state';

const store = new Map<string, string>();

function storageKey(scopeId: string): string {
  return `${SAVE_STORAGE_PREFIX}${scopeId}`;
}

function storeRaw(scopeId: string, value: unknown): void {
  store.set(storageKey(scopeId), JSON.stringify(value));
}

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    get length() {
      return store.size;
    },
    key: (i: number) => [...store.keys()][i] ?? null,
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

describe('readActiveProjectPayload', () => {
  it('reads null when nothing is stored', () => {
    expect(readActiveProjectPayload()).toEqual({ payloadVersion: 1, activeProjectId: null });
  });

  it('reads back what was written, including a cleared selection', () => {
    writeActiveProjectPayload('p1');
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');

    writeActiveProjectPayload(null);
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('reads null for a wrong version, a malformed envelope, or a non-string id', () => {
    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, { payloadVersion: 99, activeProjectId: 'p1' });
    expect(readActiveProjectPayload().activeProjectId).toBeNull();

    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, 'p1');
    expect(readActiveProjectPayload().activeProjectId).toBeNull();

    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, { payloadVersion: 1, activeProjectId: 7 });
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('reads null when the stored JSON is damaged', () => {
    store.set(storageKey(ACTIVE_PROJECT_SAVE_SCOPE_ID), '{');
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('treats an empty stored id as no selection', () => {
    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, { payloadVersion: 1, activeProjectId: '' });
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('survives storage being unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => writeActiveProjectPayload('p1')).not.toThrow();
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });
});
