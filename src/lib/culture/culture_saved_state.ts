import { RNG } from '@ironarachne/rng';

import { cultureFromSnapshot, type CultureSnapshot } from './culture_snapshot';
import type { Culture } from './culture_types';
import { readScopedJson, writeScopedJson } from '$lib/persistent_save';

/**
 * Cultures saved the way the site saved them before projects existed: every culture the user ever
 * kept, in one global `localStorage` scope, keyed by name.
 *
 * **Nothing writes new cultures here any more.** The culture generator saves into a project
 * through the artifact store (#40), which is where a culture is durable, nameable, referenceable,
 * and editable. What is left is the read side and a delete, because this scope still holds work
 * from before the move: `/saved-data` browses it, legacy adoption copies it into a project, and
 * the character generators offer it for naming alongside what a project holds.
 *
 * It goes when `/saved-data` does (#44), deliberately a release or two after adoption shipped —
 * removing the old page in the same release that migrates the data would leave a bug in the
 * migration with no fallback the user could reach.
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

export function writeCultureSavePayload(payload: CultureSavePayload): void {
  writeScopedJson(CULTURE_SAVE_SCOPE_ID, payload);
}

export function loadSavedCultureSnapshots(): CultureSnapshot[] {
  return readCultureSavePayload().cultures;
}

export function loadSavedCultures(): Culture[] {
  return loadSavedCultureSnapshots().map((snapshot, index) =>
    cultureFromSnapshot(snapshot, new RNG(`culture-load-${index}-${snapshot.name}`)),
  );
}

export function saveCultureSnapshots(cultures: CultureSnapshot[]): void {
  writeCultureSavePayload({
    payloadVersion: CULTURE_SAVE_PAYLOAD_VERSION,
    cultures,
  });
}

/**
 * Delete one culture from the legacy scope, by name.
 *
 * The one write left, and it exists because `/saved-data` offers it: a user must be able to clear
 * out work they no longer want from the place that still shows it to them. Names are what this
 * format has instead of ids, so two cultures sharing one go together.
 */
export function deleteSavedCultureByName(name: string): boolean {
  const payload = readCultureSavePayload();
  const next = payload.cultures.filter((item) => item.name !== name);
  if (next.length === payload.cultures.length) {
    return false;
  }
  saveCultureSnapshots(next);
  return true;
}
