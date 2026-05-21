import { readScopedJson, writeScopedJson } from '$lib/persistent_save/scoped_local_storage';
import type { HeraldrySnapshot } from './heraldry_snapshot.js';

export const HERALDRY_SAVE_SCOPE_ID = 'generator.heraldry' as const;

export const HERALDRY_SAVE_PAYLOAD_VERSION = 1 as const;

export type HeraldrySavePayload = {
  payloadVersion: typeof HERALDRY_SAVE_PAYLOAD_VERSION;
  heraldries: HeraldrySnapshot[];
};

function isHeraldrySavePayload(value: unknown): value is HeraldrySavePayload {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.payloadVersion === HERALDRY_SAVE_PAYLOAD_VERSION && Array.isArray(record.heraldries)
  );
}

export function readHeraldrySavePayload(): HeraldrySavePayload {
  const raw = readScopedJson(HERALDRY_SAVE_SCOPE_ID);
  if (raw === null) {
    return { payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION, heraldries: [] };
  }
  if (!isHeraldrySavePayload(raw)) {
    return { payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION, heraldries: [] };
  }
  return raw;
}

export function writeHeraldrySavePayload(payload: HeraldrySavePayload): void {
  writeScopedJson(HERALDRY_SAVE_SCOPE_ID, payload);
}

export function loadSavedHeraldrySnapshots(): HeraldrySnapshot[] {
  return readHeraldrySavePayload().heraldries;
}

export function saveHeraldrySnapshots(heraldries: HeraldrySnapshot[]): void {
  writeHeraldrySavePayload({
    payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION,
    heraldries,
  });
}

export function appendSavedHeraldry(snapshot: HeraldrySnapshot): void {
  const payload = readHeraldrySavePayload();
  writeHeraldrySavePayload({
    payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION,
    heraldries: [...payload.heraldries, snapshot],
  });
}
