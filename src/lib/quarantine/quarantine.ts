import { asRecord } from '$lib/artifact_kinds';
import { deleteQuarantineRecord, readAllQuarantineRecords, type VaultResult } from '$lib/vault_db';

import type { QuarantinedArtifact, QuarantineRecord } from './quarantine_types';

/** The reasons a record can be held here. Mirrors the kind registry's, because it is where they come from. */
const QUARANTINE_REASONS = new Set([
  'unknown-kind',
  'invalid-payload',
  'unsupported-version',
  'migration-failed',
]);

/**
 * A random, never-reused key for one quarantined record. Mirrors `newArtifactId`, fallback and all:
 * a record with a weaker id is better than a record that could not be kept.
 */
export function newQuarantineRecordId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid !== undefined) {
    return uuid;
  }
  return `quarantine-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** File something unreadable, ready to be written. `raw` is untouched; that is the whole point. */
export function toQuarantineRecord(
  artifact: QuarantinedArtifact,
  now: number,
  recordId: string = newQuarantineRecordId(),
): QuarantineRecord {
  return { ...artifact, recordId, quarantinedAt: now };
}

function storedString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * A stored record as a quarantine record, or `undefined` when it is not one.
 *
 * Deliberately forgiving about everything except its own key and `raw`: this store holds records
 * that were already malformed when they arrived, so a strict parse here would be the second thing
 * to drop them — and dropping a record because the note *about* the record is imperfect is the
 * failure this library exists to prevent. A reason it does not recognise reads as
 * `invalid-payload`, which is the honest general case.
 */
export function toQuarantineRecordFromStorage(value: unknown): QuarantineRecord | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.recordId !== 'string' || record.recordId === '') {
    return undefined;
  }
  if (!('raw' in record)) {
    return undefined;
  }
  const reason = storedString(record.reason);
  return {
    recordId: record.recordId,
    id: storedString(record.id),
    projectId: storedString(record.projectId),
    kind: storedString(record.kind),
    name: storedString(record.name),
    raw: record.raw,
    reason: (QUARANTINE_REASONS.has(reason)
      ? reason
      : 'invalid-payload') as QuarantineRecord['reason'],
    message: storedString(record.message),
    quarantinedAt: typeof record.quarantinedAt === 'number' ? record.quarantinedAt : 0,
  };
}

/**
 * Everything the vault is holding that it could not read, newest first.
 *
 * Read on demand rather than hydrated into an index like projects and artifacts are: nothing in the
 * ordinary run of the site consults quarantine, and a cache of records nobody looks at is a cache
 * that is only ever wrong.
 */
export async function readQuarantinedArtifacts(): Promise<VaultResult<QuarantineRecord[]>> {
  const stored = await readAllQuarantineRecords();
  if (!stored.ok) {
    return stored;
  }
  const records = stored.value
    .map(toQuarantineRecordFromStorage)
    .filter((record): record is QuarantineRecord => record !== undefined)
    .sort((a, b) => b.quarantinedAt - a.quarantinedAt || a.recordId.localeCompare(b.recordId));
  return { ok: true, value: records };
}

/**
 * Throw one away, on purpose.
 *
 * The only way a quarantined record leaves the vault, and it takes an explicit act by the user. The
 * whole bargain of quarantine is that the application never decides on its own that something
 * unreadable is worthless.
 */
export function discardQuarantinedArtifact(recordId: string): Promise<VaultResult<void>> {
  return deleteQuarantineRecord(recordId);
}

/**
 * How a quarantined record leaves in an export: as the artifact record it arrived as.
 *
 * It goes back into the file's ordinary `artifacts` array rather than into a compartment of its
 * own, which is what makes the promise real — a build that has since learned the missing kind
 * imports it as a normal artifact, with no code that knows quarantine ever happened. A body with a
 * quarantine section would need every future reader to look in two places for the same thing.
 */
export function quarantinedForExport(records: QuarantineRecord[]): unknown[] {
  return records.map((record) => record.raw);
}
