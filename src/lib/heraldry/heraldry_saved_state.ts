import { readScopedJson, writeScopedJson } from '$lib/persistent_save';
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

export type DedupeHeraldrySnapshotsResult = {
  heraldries: HeraldrySnapshot[];
  duplicateBlazonCount: number;
};

/** Keeps the first saved entry for each blazon; drops later duplicates. */
export function dedupeHeraldrySnapshotsByBlazon(
  heraldries: HeraldrySnapshot[],
): DedupeHeraldrySnapshotsResult {
  const seenBlazons = new Set<string>();
  const deduped: HeraldrySnapshot[] = [];
  let duplicateBlazonCount = 0;

  for (const snapshot of heraldries) {
    if (seenBlazons.has(snapshot.blazon)) {
      duplicateBlazonCount += 1;
      continue;
    }
    seenBlazons.add(snapshot.blazon);
    deduped.push(snapshot);
  }

  return { heraldries: deduped, duplicateBlazonCount };
}

function normalizeHeraldrySavePayload(payload: HeraldrySavePayload): HeraldrySavePayload {
  const { heraldries } = dedupeHeraldrySnapshotsByBlazon(payload.heraldries);
  return {
    payloadVersion: payload.payloadVersion,
    heraldries,
  };
}

export function readHeraldrySavePayload(): HeraldrySavePayload {
  const raw = readScopedJson(HERALDRY_SAVE_SCOPE_ID);
  if (raw === null) {
    return { payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION, heraldries: [] };
  }
  if (!isHeraldrySavePayload(raw)) {
    return { payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION, heraldries: [] };
  }
  const normalized = normalizeHeraldrySavePayload(raw);
  if (normalized.heraldries.length !== raw.heraldries.length) {
    writeHeraldrySavePayload(normalized);
  }
  return normalized;
}

export function writeHeraldrySavePayload(payload: HeraldrySavePayload): void {
  writeScopedJson(HERALDRY_SAVE_SCOPE_ID, payload);
}

export function loadSavedHeraldrySnapshots(): HeraldrySnapshot[] {
  return readHeraldrySavePayload().heraldries;
}

export function findSavedHeraldrySnapshotByBlazon(blazon: string): HeraldrySnapshot | undefined {
  return loadSavedHeraldrySnapshots().find((saved) => saved.blazon === blazon);
}

export type AppendSavedHeraldryResult = { ok: true } | { ok: false; reason: 'duplicate_blazon' };

export function appendSavedHeraldry(snapshot: HeraldrySnapshot): AppendSavedHeraldryResult {
  const payload = readHeraldrySavePayload();
  if (payload.heraldries.some((saved) => saved.blazon === snapshot.blazon)) {
    return { ok: false, reason: 'duplicate_blazon' };
  }
  writeHeraldrySavePayload({
    payloadVersion: HERALDRY_SAVE_PAYLOAD_VERSION,
    heraldries: [...payload.heraldries, snapshot],
  });
  return { ok: true };
}
