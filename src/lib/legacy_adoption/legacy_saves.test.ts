import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CULTURE_ARTIFACT_KIND,
  CULTURE_SAVE_PAYLOAD_VERSION,
  CULTURE_SAVE_SCOPE_ID,
  type CultureSavePayload,
} from '$lib/culture';
import {
  HERALDRY_ARTIFACT_KIND,
  HERALDRY_SAVE_PAYLOAD_VERSION,
  HERALDRY_SAVE_SCOPE_ID,
  type HeraldrySavePayload,
} from '$lib/heraldry';
import { writeScopedJson } from '$lib/persistent_save';
import {
  RELIGION_ARTIFACT_KIND,
  RELIGION_SAVE_PAYLOAD_VERSION,
  RELIGION_SAVE_SCOPE_ID,
  type ReligionSavePayload,
} from '$lib/religion';
import { ARTIFACT_KINDS } from '$lib/workshop';

import type { LegacySaveScope } from './legacy_adoption_types';
import {
  LEGACY_SAVE_SCOPES,
  legacyItemIdentity,
  legacyItemKey,
  readLegacyScope,
  readLegacyScopes,
} from './legacy_saves';

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

function scopeFor(scopeId: string): LegacySaveScope {
  const scope = LEGACY_SAVE_SCOPES.find((candidate) => candidate.scopeId === scopeId);
  if (scope === undefined) {
    throw new Error(`no legacy scope for ${scopeId}`);
  }
  return scope;
}

/**
 * `legacy_saves.ts` writes the three scopes out rather than importing them, so that adoption does
 * not load `$lib/names` on every page view or trip heraldry's dedupe-and-write-back reader. These
 * are the checks that pay for that copy: every field of it is asserted against what the owning
 * library exports, so a rename over there fails here instead of quietly adopting nothing.
 *
 * The `itemsField` checks go through `satisfies`, which is what makes them real: the object has to
 * be assignable to the library's own save payload type, so a field renamed in that type stops
 * compiling here.
 */
describe('LEGACY_SAVE_SCOPES', () => {
  it('covers the three generators that could save, and nothing else', () => {
    expect(LEGACY_SAVE_SCOPES.map((scope) => scope.scopeId)).toEqual([
      HERALDRY_SAVE_SCOPE_ID,
      CULTURE_SAVE_SCOPE_ID,
      RELIGION_SAVE_SCOPE_ID,
    ]);
  });

  it('names a kind the registry actually has', () => {
    for (const scope of LEGACY_SAVE_SCOPES) {
      expect(ARTIFACT_KINDS.byKind.has(scope.kind)).toBe(true);
    }
    expect(LEGACY_SAVE_SCOPES.map((scope) => scope.kind)).toEqual([
      HERALDRY_ARTIFACT_KIND,
      CULTURE_ARTIFACT_KIND,
      RELIGION_ARTIFACT_KIND,
    ]);
  });

  it('names the array field each library stores its items under', () => {
    const heraldry = {
      payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION,
      heraldries: [],
    } satisfies HeraldrySavePayload;
    const culture = {
      payloadVersion: CULTURE_SAVE_PAYLOAD_VERSION,
      cultures: [],
    } satisfies CultureSavePayload;
    const religion = {
      payloadVersion: RELIGION_SAVE_PAYLOAD_VERSION,
      religions: [],
    } satisfies ReligionSavePayload;

    expect(Object.keys(heraldry)).toContain(scopeFor(HERALDRY_SAVE_SCOPE_ID).itemsField);
    expect(Object.keys(culture)).toContain(scopeFor(CULTURE_SAVE_SCOPE_ID).itemsField);
    expect(Object.keys(religion)).toContain(scopeFor(RELIGION_SAVE_SCOPE_ID).itemsField);
  });

  it('gives every scope a distinct id and a usable pair of fields', () => {
    const ids = LEGACY_SAVE_SCOPES.map((scope) => scope.scopeId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const scope of LEGACY_SAVE_SCOPES) {
      expect(scope.itemsField).not.toBe('');
      expect(scope.identityField).not.toBe('');
    }
  });
});

describe('readLegacyScope', () => {
  it('reports an untouched scope as absent', () => {
    expect(readLegacyScope(scopeFor(CULTURE_SAVE_SCOPE_ID))).toEqual({
      scope: scopeFor(CULTURE_SAVE_SCOPE_ID),
      status: 'absent',
      payloadVersion: 0,
      items: [],
    });
  });

  it('reads the envelope version as stored rather than assuming it', () => {
    writeScopedJson(CULTURE_SAVE_SCOPE_ID, { payloadVersion: 7, cultures: [{ name: 'x' }] });

    const contents = readLegacyScope(scopeFor(CULTURE_SAVE_SCOPE_ID));

    expect(contents.status).toBe('read');
    expect(contents.payloadVersion).toBe(7);
    expect(contents.items).toEqual([{ name: 'x' }]);
  });

  it('reads an empty scope as read rather than absent', () => {
    writeScopedJson(CULTURE_SAVE_SCOPE_ID, { payloadVersion: 1, cultures: [] });

    expect(readLegacyScope(scopeFor(CULTURE_SAVE_SCOPE_ID)).status).toBe('read');
  });

  it.each([
    ['a non-object', 'nonsense'],
    ['an array', [1, 2]],
    ['a missing items field', { payloadVersion: 1 }],
    ['an items field that is not an array', { payloadVersion: 1, cultures: {} }],
    ['a version that is not a number', { payloadVersion: 'one', cultures: [] }],
  ])('reports %s as unreadable', (_label, stored) => {
    writeScopedJson(CULTURE_SAVE_SCOPE_ID, stored);

    expect(readLegacyScope(scopeFor(CULTURE_SAVE_SCOPE_ID))).toMatchObject({
      status: 'unreadable',
      items: [],
    });
  });

  it('does not write anything while reading', () => {
    writeScopedJson(CULTURE_SAVE_SCOPE_ID, { payloadVersion: 1, cultures: [{ name: 'x' }] });
    const before = new Map(store);

    readLegacyScopes();

    expect([...store.entries()]).toEqual([...before.entries()]);
  });
});

describe('legacyItemIdentity', () => {
  const scope = scopeFor(CULTURE_SAVE_SCOPE_ID);

  it('reads the scope identity field', () => {
    expect(legacyItemIdentity(scope, { name: 'Aurelian' })).toBe('Aurelian');
  });

  it.each([
    ['a non-object', 'Aurelian'],
    ['null', null],
    ['an array', ['Aurelian']],
    ['a missing field', { seed: 'Aurelian' }],
    ['a non-string field', { name: 12 }],
    ['a blank field', { name: '   ' }],
  ])('has no identity for %s', (_label, item) => {
    expect(legacyItemIdentity(scope, item)).toBeNull();
  });
});

describe('legacyItemKey', () => {
  const scope = scopeFor(CULTURE_SAVE_SCOPE_ID);

  it('is the scope and the identity for the first item with that identity', () => {
    expect(legacyItemKey(scope, 'Aurelian', 0)).toBe('generator.culture:Aurelian');
  });

  it('distinguishes later items sharing an identity', () => {
    expect(legacyItemKey(scope, 'Aurelian', 1)).not.toBe(legacyItemKey(scope, 'Aurelian', 0));
    expect(legacyItemKey(scope, 'Aurelian', 2)).not.toBe(legacyItemKey(scope, 'Aurelian', 1));
  });

  it('does not collide across scopes', () => {
    expect(legacyItemKey(scope, 'Aurelian', 0)).not.toBe(
      legacyItemKey(scopeFor(RELIGION_SAVE_SCOPE_ID), 'Aurelian', 0),
    );
  });
});
