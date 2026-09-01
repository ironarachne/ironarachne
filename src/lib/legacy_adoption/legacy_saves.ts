import { asRecord } from '$lib/artifact_kinds';
import { readScopedJson } from '$lib/persistent_save';

import type { LegacySaveScope, LegacyScopeContents } from './legacy_adoption_types';

/**
 * The three scopes users have work in today.
 *
 * Spelled out here rather than imported from the libraries that wrote them, and this is the one
 * place in adoption that repeats knowledge on purpose. `culture_saved_state` reaches
 * `culture_snapshot` and from there `$lib/names`, and adoption runs on page load, so it reads the
 * stored JSON itself and costs nothing to load.
 *
 * **`generator.heraldry` no longer has a writer at all.** `heraldry_saved_state.ts` was retired
 * with #51 — the heraldry generator saves to the vault now — so this entry is the only description
 * of that scope left in the build, and it is what carries a coat of arms saved by an older build
 * across. Do not delete it because nothing writes it: the data is in browsers.
 *
 * `legacy_saves.test.ts` asserts every field here against the constants and types the owning
 * libraries export, and heraldry's against literals for the reason above, so the copy cannot drift
 * without a test saying so.
 */
export const LEGACY_SAVE_SCOPES: readonly LegacySaveScope[] = [
  {
    scopeId: 'generator.heraldry',
    itemsField: 'heraldries',
    kind: 'heraldry',
    identityField: 'blazon',
  },
  {
    scopeId: 'generator.culture',
    itemsField: 'cultures',
    kind: 'culture',
    identityField: 'name',
  },
  {
    scopeId: 'generator.religion',
    itemsField: 'religions',
    kind: 'religion',
    identityField: 'seed',
  },
];

/**
 * Read one legacy scope as it sits in storage.
 *
 * Nothing here validates a snapshot: that is the kind registry's job and the reason the items come
 * back as `unknown`. What is checked is the envelope, because a payload version that is not a
 * number and an items field that is not an array are the two things that would make the rest of
 * adoption guess.
 */
export function readLegacyScope(scope: LegacySaveScope): LegacyScopeContents {
  return legacyScopeContents(scope, readScopedJson(scope.scopeId));
}

/**
 * The same reading, applied to a value from anywhere.
 *
 * Split from {@link readLegacyScope} because these envelopes reach the site by two routes now:
 * sitting in `localStorage` where an old build left them, and inside a `save_file_export` file
 * someone kept (#47). One function decides what a legacy envelope means, so a file restored in two
 * years is read exactly as the same data in storage would be.
 */
export function legacyScopeContents(scope: LegacySaveScope, raw: unknown): LegacyScopeContents {
  if (raw === null || raw === undefined) {
    return { scope, status: 'absent', payloadVersion: 0, items: [] };
  }

  const record = asRecord(raw);
  const items = record === null ? undefined : record[scope.itemsField];
  if (record === null || typeof record.payloadVersion !== 'number' || !Array.isArray(items)) {
    return { scope, status: 'unreadable', payloadVersion: 0, items: [] };
  }

  return { scope, status: 'read', payloadVersion: record.payloadVersion, items };
}

/** Every legacy scope, in {@link LEGACY_SAVE_SCOPES} order. */
export function readLegacyScopes(): LegacyScopeContents[] {
  return LEGACY_SAVE_SCOPES.map(readLegacyScope);
}

/**
 * An item's identity, or null when the snapshot does not carry a usable one.
 *
 * Null only ever reaches a caller for a payload the kind would refuse anyway — every one of the
 * three validators requires the field this reads — so adoption validates first and never has to
 * decide what an unidentifiable item is.
 */
export function legacyItemIdentity(scope: LegacySaveScope, snapshot: unknown): string | null {
  const record = asRecord(snapshot);
  if (record === null) {
    return null;
  }
  const identity = record[scope.identityField];
  if (typeof identity !== 'string' || identity.trim() === '') {
    return null;
  }
  return identity;
}

/**
 * The key adoption records against an item, stable across runs.
 *
 * Identity alone is not quite enough: nothing stopped a browser from holding two cultures with the
 * same name, and keying on the name alone would adopt the first and count the second as already
 * done — losing something the user can see on `/saved-data` today. The ordinal distinguishes them
 * while staying stable when some *other* item is deleted, which a positional key would not be.
 */
export function legacyItemKey(scope: LegacySaveScope, identity: string, ordinal: number): string {
  const base = `${scope.scopeId}:${identity}`;
  return ordinal === 0 ? base : `${base}#${ordinal}`;
}
