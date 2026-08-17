import { readScopedJson } from '$lib/persistent_save';

import type { ReligionSnapshot } from './religion_snapshot.js';

/**
 * Religions saved the way the site saved them before projects existed: every religion the user ever
 * kept, in one global `localStorage` scope, keyed by seed.
 *
 * **This scope is read-only.** The religion generator saves into a project through the artifact
 * store (#41), which is where a religion is durable, nameable, referenceable, and editable, and
 * `/saved-data` — the page that browsed and deleted these — is gone (#44). Nothing writes here,
 * and the delete went with the page that offered it.
 *
 * The read side stays because the scope still holds work from before the move: legacy adoption
 * copies it into a project, and a bookmarked `?seed=` link still opens one in the generator. It is
 * the fallback #34 deliberately left in place, and a fallback nobody can write to is exactly what
 * a fallback should be.
 */

export const RELIGION_SAVE_SCOPE_ID = 'generator.religion' as const;

export const RELIGION_SAVE_PAYLOAD_VERSION = 1 as const;

export type ReligionSavePayload = {
  payloadVersion: typeof RELIGION_SAVE_PAYLOAD_VERSION;
  religions: ReligionSnapshot[];
};

function isReligionSavePayload(value: unknown): value is ReligionSavePayload {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.payloadVersion === RELIGION_SAVE_PAYLOAD_VERSION && Array.isArray(record.religions);
}

export function readReligionSavePayload(): ReligionSavePayload {
  const raw = readScopedJson(RELIGION_SAVE_SCOPE_ID);
  if (raw === null) {
    return { payloadVersion: RELIGION_SAVE_PAYLOAD_VERSION, religions: [] };
  }
  if (!isReligionSavePayload(raw)) {
    return { payloadVersion: RELIGION_SAVE_PAYLOAD_VERSION, religions: [] };
  }
  return raw;
}

export function loadSavedReligionSnapshots(): ReligionSnapshot[] {
  return readReligionSavePayload().religions;
}
