import { RNG } from '@ironarachne/rng';

import { cultureFromSnapshot, type CultureSnapshot } from './culture_snapshot';
import type { Culture } from './culture_types';
import { readScopedJson } from '$lib/persistent_save';

/**
 * Cultures saved the way the site saved them before projects existed: every culture the user ever
 * kept, in one global `localStorage` scope, keyed by name.
 *
 * **This scope is read-only.** The culture generator saves into a project through the artifact
 * store (#40), which is where a culture is durable, nameable, referenceable, and editable, and
 * `/saved-data` — the page that browsed and deleted these — is gone (#44). Nothing writes here,
 * and the delete went with the page that offered it.
 *
 * The read side stays because the scope still holds work from before the move: legacy adoption
 * copies it into a project, the character generators offer it for naming alongside what a project
 * holds, and a bookmarked `?name=` link still opens one. It is the fallback #34 deliberately left
 * in place, and a fallback nobody can write to is exactly what a fallback should be.
 */

export const CULTURE_SAVE_SCOPE_ID = 'generator.culture' as const;

export const CULTURE_SAVE_PAYLOAD_VERSION = 1 as const;

export type CultureSavePayload = {
  payloadVersion: typeof CULTURE_SAVE_PAYLOAD_VERSION;
  cultures: CultureSnapshot[];
};

function isCultureSavePayload(value: unknown): value is CultureSavePayload {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.payloadVersion === CULTURE_SAVE_PAYLOAD_VERSION && Array.isArray(record.cultures);
}

export function readCultureSavePayload(): CultureSavePayload {
  const raw = readScopedJson(CULTURE_SAVE_SCOPE_ID);
  if (raw === null) {
    return { payloadVersion: CULTURE_SAVE_PAYLOAD_VERSION, cultures: [] };
  }
  if (!isCultureSavePayload(raw)) {
    return { payloadVersion: CULTURE_SAVE_PAYLOAD_VERSION, cultures: [] };
  }
  return raw;
}

export function loadSavedCultureSnapshots(): CultureSnapshot[] {
  return readCultureSavePayload().cultures;
}

export function loadSavedCultures(): Culture[] {
  return loadSavedCultureSnapshots().map((snapshot, index) =>
    cultureFromSnapshot(snapshot, new RNG(`culture-load-${index}-${snapshot.name}`)),
  );
}
