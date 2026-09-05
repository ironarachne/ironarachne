import { readAllArtifactRecords, type VaultResult } from '$lib/vault_db';
import { validateRulesetRef } from '$lib/rulesets';

import type { ArtifactProvenance, ArtifactReference, ArtifactSummary } from './artifact_types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isArtifactReference(value: unknown): value is ArtifactReference {
  const record = asRecord(value);
  if (record === null) {
    return false;
  }
  return (
    typeof record.targetId === 'string' &&
    record.targetId !== '' &&
    typeof record.targetKind === 'string' &&
    typeof record.role === 'string' &&
    record.role !== ''
  );
}

/**
 * Provenance is present or absent, never partial. A record missing its seed cannot answer the one
 * question provenance exists to answer, and half of an origin is worse than an honest none.
 */
function readArtifactProvenance(value: unknown): ArtifactProvenance | undefined {
  const record = asRecord(value);
  if (record === null) {
    return undefined;
  }
  if (
    typeof record.toolPath !== 'string' ||
    typeof record.seed !== 'string' ||
    asRecord(record.config) === null
  ) {
    return undefined;
  }
  const provenance: ArtifactProvenance = {
    toolPath: record.toolPath as ArtifactProvenance['toolPath'],
    seed: record.seed,
    config: record.config as Record<string, unknown>,
  };
  if (record.ruleset !== undefined) {
    const ruleset = validateRulesetRef(record.ruleset);
    if (!ruleset.ok) {
      return undefined;
    }
    provenance.ruleset = ruleset.value;
  }
  return provenance;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** A stored number, or zero when the record does not carry one this build can use. */
function storedNumber(value: unknown): number {
  return isFiniteNumber(value) ? value : 0;
}

/**
 * A stored record as a summary, or `undefined` when it is not one.
 *
 * A parse rather than a type guard, because two of the fields are repaired rather than checked.
 * The line is what the field is for:
 *
 * - **Identity and ordering are checked and never guessed.** A record with no id has nothing to
 *   restore it under, one with no `projectId` belongs to no project, and one with a non-numeric
 *   `updatedAt` cannot be ordered against the rest. Those are dropped.
 * - **`payloadVersion` and `byteSize` are bookkeeping, and default to zero.** A record adopted
 *   from a build that never wrote them is still the user's artifact. A zero version routes the
 *   payload to the kind's `migrate`, which reports what it cannot read; a zero size understates a
 *   storage panel. Neither is a reason to hide something a user made.
 */
export function toArtifactSummary(value: unknown): ArtifactSummary | undefined {
  const record = asRecord(value);
  if (record === null) {
    return undefined;
  }
  if (typeof record.id !== 'string' || record.id === '') {
    return undefined;
  }
  if (typeof record.projectId !== 'string' || record.projectId === '') {
    return undefined;
  }
  if (typeof record.kind !== 'string' || record.kind === '') {
    return undefined;
  }
  if (typeof record.name !== 'string') {
    return undefined;
  }
  if (!isStringArray(record.tags)) {
    return undefined;
  }
  if (!Array.isArray(record.references) || !record.references.every(isArtifactReference)) {
    return undefined;
  }
  const provenance =
    record.provenance === undefined ? undefined : readArtifactProvenance(record.provenance);
  if (record.provenance !== undefined && provenance === undefined) return undefined;
  if (!isFiniteNumber(record.createdAt) || !isFiniteNumber(record.updatedAt)) {
    return undefined;
  }

  const summary: ArtifactSummary = {
    id: record.id,
    projectId: record.projectId,
    kind: record.kind,
    name: record.name,
    tags: record.tags,
    references: record.references,
    payloadVersion: storedNumber(record.payloadVersion),
    byteSize: storedNumber(record.byteSize),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  if (provenance !== undefined) {
    summary.provenance = provenance;
  }
  return summary;
}

/**
 * Every summary in the vault, by id — the hydrated index.
 *
 * `null` until it has been read from the database, which is what separates "no artifacts" from
 * "not looked yet". It is a cache and never a source of truth: it is rebuilt from the database
 * rather than repaired, and **nothing is put in it until the transaction that wrote the record has
 * committed**. Memory claiming a save the database does not have is the failure docs/workshop.md
 * spends a section on: the UI shows saved, and the next reload loses it.
 *
 * Every project's, in one map. A picker offering artifacts from another project needs them, and
 * payloads are not here — nothing holds every map in a project resident in memory.
 */
let index: Map<string, ArtifactSummary> | null = null;

let hydrating: Promise<VaultResult<ArtifactSummary[]>> | null = null;

async function readIndex(): Promise<VaultResult<ArtifactSummary[]>> {
  const records = await readAllArtifactRecords();
  if (!records.ok) {
    return records;
  }
  const hydrated = new Map<string, ArtifactSummary>();
  for (const record of records.value) {
    const summary = toArtifactSummary(record);
    if (summary !== undefined) {
      hydrated.set(summary.id, summary);
    }
  }
  index = hydrated;
  return { ok: true, value: [...hydrated.values()] };
}

/**
 * Read every artifact summary into memory, once, so that listing a project stays synchronous for
 * callers. Cheap and safe to call repeatedly: after the first success it answers from the cache.
 *
 * A failure is not cached. A browser that had no database when the page loaded may have one by the
 * time the user saves something, and refusing to look again would strand them.
 */
export async function hydrateArtifacts(): Promise<VaultResult<ArtifactSummary[]>> {
  if (index !== null) {
    return { ok: true, value: [...index.values()] };
  }
  hydrating ??= readIndex();
  try {
    return await hydrating;
  } finally {
    hydrating = null;
  }
}

/** True once the index has been read. Callers listing before this get an empty vault. */
export function artifactsHydrated(): boolean {
  return index !== null;
}

/**
 * Drop the cache so the next hydration re-reads the database. What replacing the whole store —
 * a vault import, a "clear everything" — has to do, and what a test does between cases.
 *
 * Call it when no hydration is in flight: one already reading would finish afterwards and put the
 * records it read back, which is the stale state this was called to get rid of.
 */
export function resetArtifactIndex(): void {
  index = null;
  hydrating = null;
}

export function indexedArtifacts(): ArtifactSummary[] {
  return index === null ? [] : [...index.values()];
}

export function indexedArtifact(id: string): ArtifactSummary | undefined {
  return index?.get(id);
}

/** Record a committed write. Never called before the transaction behind it has committed. */
export function rememberArtifact(summary: ArtifactSummary): void {
  index?.set(summary.id, summary);
}

/** Record a committed delete. */
export function forgetArtifact(id: string): void {
  index?.delete(id);
}

/**
 * Record a committed project cascade, reporting the ids it dropped.
 *
 * Cache maintenance only: the removal itself is one transaction, owned by `$lib/projects`, because
 * the project record has to go in the same commit as the artifacts inside it.
 */
export function forgetProjectArtifacts(projectId: string): string[] {
  const dropped = indexedArtifacts().filter((summary) => summary.projectId === projectId);
  for (const summary of dropped) {
    index?.delete(summary.id);
  }
  return dropped.map((summary) => summary.id);
}
