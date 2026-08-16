import { readScopedJson, writeScopedJson } from '$lib/persistent_save';

import type { ReligionSnapshot } from './religion_snapshot.js';

/**
 * Religions saved the way the site saved them before projects existed: every religion the user ever
 * kept, in one global `localStorage` scope, keyed by seed.
 *
 * **Nothing writes new religions here any more.** The religion generator saves into a project
 * through the artifact store (#41), which is where a religion is durable, nameable, referenceable,
 * and editable. What is left is the read side and a delete, because this scope still holds work
 * from before the move: `/saved-data` browses it, legacy adoption copies it into a project, and a
 * link from that page still opens one in the generator.
 *
 * It goes when `/saved-data` does (#44), deliberately a release or two after adoption shipped —
 * removing the old page in the same release that migrates the data would leave a bug in the
 * migration with no fallback the user could reach.
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

export function writeReligionSavePayload(payload: ReligionSavePayload): void {
  writeScopedJson(RELIGION_SAVE_SCOPE_ID, payload);
}

export function loadSavedReligionSnapshots(): ReligionSnapshot[] {
  return readReligionSavePayload().religions;
}

export function saveReligionSnapshots(religions: ReligionSnapshot[]): void {
  writeReligionSavePayload({
    payloadVersion: RELIGION_SAVE_PAYLOAD_VERSION,
    religions,
  });
}

/**
 * Delete one religion from the legacy scope, by seed.
 *
 * The one write left, and it exists because `/saved-data` offers it: a user must be able to clear
 * out work they no longer want from the place that still shows it to them. Seeds are what this
 * format has instead of ids, so two religions rolled from one seed go together.
 */
export function deleteSavedReligionBySeed(seed: string): boolean {
  const payload = readReligionSavePayload();
  const next = payload.religions.filter((item) => item.seed !== seed);
  if (next.length === payload.religions.length) {
    return false;
  }
  saveReligionSnapshots(next);
  return true;
}
