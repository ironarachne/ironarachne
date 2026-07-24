import { readScopedJson, writeScopedJson } from '$lib/persistent_save/scoped_local_storage';

import type { ReligionSnapshot } from './religion_snapshot.js';

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

export function appendSavedReligion(snapshot: ReligionSnapshot): void {
  const payload = readReligionSavePayload();
  writeReligionSavePayload({
    payloadVersion: RELIGION_SAVE_PAYLOAD_VERSION,
    religions: [...payload.religions, snapshot],
  });
}

export function deleteSavedReligionBySeed(seed: string): boolean {
  const payload = readReligionSavePayload();
  const next = payload.religions.filter((item) => item.seed !== seed);
  if (next.length === payload.religions.length) {
    return false;
  }
  saveReligionSnapshots(next);
  return true;
}
