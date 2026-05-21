import { RNG } from '@ironarachne/rng';

import {
  cultureFromSnapshot,
  toCultureSnapshot,
  type CultureSnapshot,
} from '$lib/culture/culture_snapshot';
import type { Culture } from '$lib/culture/culture_types';
import { readScopedJson, writeScopedJson } from '$lib/persistent_save/scoped_local_storage';

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
  return (
    record.payloadVersion === CULTURE_SAVE_PAYLOAD_VERSION && Array.isArray(record.cultures)
  );
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

export function saveCultures(cultures: Culture[]): void {
  saveCultureSnapshots(cultures.map(toCultureSnapshot));
}

export function appendSavedCulture(culture: Culture): void {
  const payload = readCultureSavePayload();
  writeCultureSavePayload({
    payloadVersion: CULTURE_SAVE_PAYLOAD_VERSION,
    cultures: [...payload.cultures, toCultureSnapshot(culture)],
  });
}
