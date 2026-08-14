import { asRecord, isStringArray } from '$lib/artifact_kinds';
import { readScopedJson, writeScopedJson } from '$lib/persistent_save';

import {
  LEGACY_ADOPTION_PAYLOAD_VERSION,
  type LegacyAdoptionNotice,
  type LegacyAdoptionRecord,
} from './legacy_adoption_types';

/**
 * Storage scope holding what adoption has already done.
 *
 * Device state rather than user work, and deliberately not carried by an export: a vault restored
 * onto a second browser must adopt that browser's own legacy scopes, and a record saying "already
 * done" would be the thing that stopped it.
 */
export const LEGACY_ADOPTION_SAVE_SCOPE_ID = 'workshop.legacy_adoption' as const;

export function emptyLegacyAdoptionRecord(): LegacyAdoptionRecord {
  return {
    payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION,
    projectId: null,
    adoptedKeys: [],
    notice: null,
  };
}

function readNotice(value: unknown): LegacyAdoptionNotice | null {
  const record = asRecord(value);
  if (record === null) {
    return null;
  }
  if (typeof record.projectId !== 'string' || record.projectId === '') {
    return null;
  }
  if (!Number.isFinite(record.adoptedCount) || !Number.isFinite(record.skippedCount)) {
    return null;
  }
  if (!Number.isFinite(record.at)) {
    return null;
  }
  return {
    projectId: record.projectId,
    adoptedCount: record.adoptedCount as number,
    skippedCount: record.skippedCount as number,
    at: record.at as number,
  };
}

/**
 * The adoption record as stored, or an empty one when there is nothing readable there.
 *
 * Absent, malformed, and wrong-version all read as empty, per requirement 3.3 in docs/workshop.md.
 * The consequence is worth stating: an unreadable record means adoption runs again from nothing,
 * which duplicates what it already adopted. That is the safe direction — the alternative is
 * treating damage as "already done" and leaving a user's work unadopted with nothing to say so —
 * and it is why the record holds only what it needs to and validates every field of it.
 */
export function readLegacyAdoptionRecord(): LegacyAdoptionRecord {
  const raw = readScopedJson(LEGACY_ADOPTION_SAVE_SCOPE_ID);
  const record = asRecord(raw);
  if (record === null || record.payloadVersion !== LEGACY_ADOPTION_PAYLOAD_VERSION) {
    return emptyLegacyAdoptionRecord();
  }
  if (!isStringArray(record.adoptedKeys)) {
    return emptyLegacyAdoptionRecord();
  }
  return {
    payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION,
    projectId:
      typeof record.projectId === 'string' && record.projectId !== '' ? record.projectId : null,
    adoptedKeys: record.adoptedKeys,
    notice: readNotice(record.notice),
  };
}

export function writeLegacyAdoptionRecord(record: LegacyAdoptionRecord): void {
  writeScopedJson(LEGACY_ADOPTION_SAVE_SCOPE_ID, record satisfies LegacyAdoptionRecord);
}
