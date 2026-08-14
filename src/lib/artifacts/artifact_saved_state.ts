import { readScopedJson, removeScopedJson, writeScopedJson } from '$lib/persistent_save';

import {
  ARTIFACT_INDEX_STORE_VERSION,
  ARTIFACT_PAYLOAD_STORE_VERSION,
  type ArtifactIndexPayload,
  type ArtifactPayloadRecord,
  type ArtifactProvenance,
  type ArtifactReference,
  type ArtifactSummary,
} from './artifact_types';

/**
 * Storage scope prefix for a project's artifact summaries — one entry per project, holding
 * everything except payloads.
 */
export const ARTIFACT_INDEX_SCOPE_PREFIX = 'workshop.artifact_index.' as const;

/** Storage scope prefix for a single artifact's payload — one entry per artifact. */
export const ARTIFACT_PAYLOAD_SCOPE_PREFIX = 'workshop.artifact.' as const;

export function artifactIndexScopeId(projectId: string): string {
  return `${ARTIFACT_INDEX_SCOPE_PREFIX}${projectId}`;
}

export function artifactPayloadScopeId(artifactId: string): string {
  return `${ARTIFACT_PAYLOAD_SCOPE_PREFIX}${artifactId}`;
}

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
function isArtifactProvenance(value: unknown): value is ArtifactProvenance {
  const record = asRecord(value);
  if (record === null) {
    return false;
  }
  return (
    typeof record.toolPath === 'string' &&
    typeof record.seed === 'string' &&
    asRecord(record.config) !== null
  );
}

/**
 * A stored record is a summary only if every field it needs is the right type. Nothing is repaired
 * by guessing: a record with no id has no identity to restore it under, and one with a
 * non-numeric `updatedAt` cannot be ordered against the rest.
 */
export function isArtifactSummary(value: unknown): value is ArtifactSummary {
  const record = asRecord(value);
  if (record === null) {
    return false;
  }
  if (typeof record.id !== 'string' || record.id === '') {
    return false;
  }
  if (typeof record.projectId !== 'string' || record.projectId === '') {
    return false;
  }
  if (typeof record.kind !== 'string' || record.kind === '') {
    return false;
  }
  if (typeof record.name !== 'string') {
    return false;
  }
  if (!isStringArray(record.tags)) {
    return false;
  }
  if (!Array.isArray(record.references) || !record.references.every(isArtifactReference)) {
    return false;
  }
  if (record.provenance !== undefined && !isArtifactProvenance(record.provenance)) {
    return false;
  }
  return Number.isFinite(record.createdAt) && Number.isFinite(record.updatedAt);
}

function emptyArtifactIndex(projectId: string): ArtifactIndexPayload {
  return { storeVersion: ARTIFACT_INDEX_STORE_VERSION, projectId, artifacts: [] };
}

/**
 * One project's summaries as stored, or an empty index when there is nothing readable there.
 *
 * Absent, malformed, and wrong-version payloads all read as empty rather than throwing, per
 * requirement 3.3 in docs/workshop.md; individual records that do not validate are dropped.
 *
 * A summary whose `projectId` names some other project is dropped too. The field is authoritative
 * and the key is derived from it, so a record filed under a project it does not claim is a
 * contradiction the store does not get to resolve by preferring the key.
 */
export function readArtifactIndex(projectId: string): ArtifactIndexPayload {
  const raw = readScopedJson(artifactIndexScopeId(projectId));
  const record = asRecord(raw);
  if (record === null || record.storeVersion !== ARTIFACT_INDEX_STORE_VERSION) {
    return emptyArtifactIndex(projectId);
  }
  if (!Array.isArray(record.artifacts)) {
    return emptyArtifactIndex(projectId);
  }
  return {
    storeVersion: ARTIFACT_INDEX_STORE_VERSION,
    projectId,
    artifacts: record.artifacts
      .filter(isArtifactSummary)
      .filter((summary) => summary.projectId === projectId),
  };
}

export function writeArtifactIndex(projectId: string, artifacts: ArtifactSummary[]): void {
  writeScopedJson(artifactIndexScopeId(projectId), {
    storeVersion: ARTIFACT_INDEX_STORE_VERSION,
    projectId,
    artifacts,
  } satisfies ArtifactIndexPayload);
}

export function removeArtifactIndex(projectId: string): void {
  removeScopedJson(artifactIndexScopeId(projectId));
}

/**
 * One artifact's payload as stored, or `null` when there is nothing readable under that id.
 *
 * The version is read as stored and not repaired. Deciding what a payload of that version means is
 * the kind registry's job, and a record whose version is missing or nonsense is routed there to be
 * rejected with a reason rather than being silently treated as current.
 */
export function readArtifactPayloadRecord(artifactId: string): ArtifactPayloadRecord | null {
  const raw = readScopedJson(artifactPayloadScopeId(artifactId));
  const record = asRecord(raw);
  if (record === null || record.storeVersion !== ARTIFACT_PAYLOAD_STORE_VERSION) {
    return null;
  }
  if (!('payload' in record)) {
    return null;
  }
  return {
    storeVersion: ARTIFACT_PAYLOAD_STORE_VERSION,
    payloadVersion: typeof record.payloadVersion === 'number' ? record.payloadVersion : 0,
    payload: record.payload,
  };
}

export function writeArtifactPayloadRecord(
  artifactId: string,
  payloadVersion: number,
  payload: unknown,
): void {
  writeScopedJson(artifactPayloadScopeId(artifactId), {
    storeVersion: ARTIFACT_PAYLOAD_STORE_VERSION,
    payloadVersion,
    payload,
  } satisfies ArtifactPayloadRecord);
}

export function removeArtifactPayloadRecord(artifactId: string): void {
  removeScopedJson(artifactPayloadScopeId(artifactId));
}
