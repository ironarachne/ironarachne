import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  applyImportedScopes,
  buildExportPayload,
  parseSaveExportPayload,
} from './save_file_export';
import {
  SAVE_STORAGE_PREFIX,
  clearAllScopedStorageKeys,
  listScopedEntries,
  readScopedJson,
  removeScopedJson,
  writeScopedJson,
} from './scoped_local_storage';

describe('scoped_local_storage', () => {
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

  it('writes and reads JSON round-trip', () => {
    writeScopedJson('generator.test', { n: 1 });
    expect(readScopedJson('generator.test')).toEqual({ n: 1 });
  });

  it('prefixes keys', () => {
    writeScopedJson('foo', { a: true });
    expect(store.has(`${SAVE_STORAGE_PREFIX}foo`)).toBe(true);
  });

  it('returns null for missing key', () => {
    expect(readScopedJson('missing')).toBeNull();
  });

  it('removeScopedJson clears entry', () => {
    writeScopedJson('x', [1]);
    removeScopedJson('x');
    expect(readScopedJson('x')).toBeNull();
  });

  it('listScopedEntries sorts by scope id', () => {
    writeScopedJson('z', 1);
    writeScopedJson('a', 2);
    expect(listScopedEntries().map((e) => e.scopeId)).toEqual(['a', 'z']);
  });

  it('clearAllScopedStorageKeys removes only prefixed keys', () => {
    store.set('other-app.key', 'x');
    writeScopedJson('one', 1);
    writeScopedJson('two', 2);
    clearAllScopedStorageKeys();
    expect(readScopedJson('one')).toBeNull();
    expect(store.get('other-app.key')).toBe('x');
  });

  it('skips invalid JSON when listing', () => {
    store.set(`${SAVE_STORAGE_PREFIX}bad`, '{');
    writeScopedJson('good', { ok: true });
    expect(listScopedEntries()).toEqual([{ scopeId: 'good', value: { ok: true } }]);
  });
});

describe('save_file_export', () => {
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

  it('buildExportPayload exports all scopes when omitted', () => {
    writeScopedJson('generator.a', { x: 1 });
    writeScopedJson('generator.b', { y: 2 });
    const payload = buildExportPayload();
    expect(payload.ironarachneExport).toBe(true);
    expect(payload.scopes['generator.a']).toEqual({ x: 1 });
    expect(payload.scopes['generator.b']).toEqual({ y: 2 });
  });

  it('buildExportPayload filters by scope ids', () => {
    writeScopedJson('generator.a', { x: 1 });
    writeScopedJson('generator.b', { y: 2 });
    const payload = buildExportPayload(['generator.b']);
    expect(Object.keys(payload.scopes)).toEqual(['generator.b']);
  });

  it('parseSaveExportPayload rejects invalid blobs', () => {
    expect(parseSaveExportPayload(null)).toBeNull();
    expect(parseSaveExportPayload({})).toBeNull();
    expect(parseSaveExportPayload({ ironarachneExport: true })).toBeNull();
  });

  it('applyImportedScopes merge writes scopes', () => {
    writeScopedJson('existing', { keep: true });
    const file = {
      ironarachneExport: true as const,
      formatVersion: 1 as const,
      exportedAt: 't',
      scopes: { imported: { n: 3 }, existing: { updated: 1 } },
    };
    const result = applyImportedScopes(file, 'merge');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.appliedScopes).toEqual(['existing', 'imported']);
    }
    expect(readScopedJson('imported')).toEqual({ n: 3 });
    expect(readScopedJson('existing')).toEqual({ updated: 1 });
  });

  it('applyImportedScopes replaceAll clears prefix keys first', () => {
    writeScopedJson('old', { x: 1 });
    const file = {
      ironarachneExport: true as const,
      formatVersion: 1 as const,
      exportedAt: 't',
      scopes: { only: { y: 2 } },
    };
    const result = applyImportedScopes(file, 'replaceAll');
    expect(result.ok).toBe(true);
    expect(readScopedJson('old')).toBeNull();
    expect(readScopedJson('only')).toEqual({ y: 2 });
  });
});
