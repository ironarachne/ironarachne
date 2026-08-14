import { readArtifactPayload, rejectedPayload } from './artifact_kinds';
import type {
  AnyArtifactKindEntry,
  ArtifactKind,
  ArtifactKindEntry,
  ArtifactKindRegistry,
  PayloadResult,
} from './artifact_kind_types';

export function createArtifactKindRegistry(): ArtifactKindRegistry {
  return { byKind: new Map<ArtifactKind, AnyArtifactKindEntry>() };
}

/**
 * Adds a kind to a registry, and throws if that id is already taken.
 *
 * Loudly, because the quiet alternatives are both worse: last-write-wins would have one
 * library's `toSnapshot` silently reading another's payloads, and first-write-wins would drop a
 * kind whose absence only shows up as an artifact that will not open.
 *
 * This is the one place a typed entry becomes an {@link AnyArtifactKindEntry}. Everything past
 * it works in the erased form, so the cast is a single line rather than a habit.
 */
export function registerArtifactKind<TValue, TSnapshot>(
  registry: ArtifactKindRegistry,
  entry: ArtifactKindEntry<TValue, TSnapshot>,
): void {
  if (registry.byKind.has(entry.kind)) {
    throw new Error(`artifact kind "${entry.kind}" is already registered`);
  }
  registry.byKind.set(entry.kind, entry as unknown as AnyArtifactKindEntry);
}

/**
 * The entry for a kind, or `undefined` when nothing is registered under that id.
 *
 * Optional on purpose: a file written by a newer build naming a kind this one does not have is
 * the normal case, and the miss is what routes it to quarantine instead of throwing halfway
 * through an import.
 */
export function getArtifactKind(
  registry: ArtifactKindRegistry,
  kind: ArtifactKind,
): AnyArtifactKindEntry | undefined {
  return registry.byKind.get(kind);
}

export function hasArtifactKind(registry: ArtifactKindRegistry, kind: ArtifactKind): boolean {
  return registry.byKind.has(kind);
}

/**
 * The entry for a kind, or a thrown error. For callers that hold a kind from their own code
 * rather than from stored data, where a miss is a bug in this build and not a bad record.
 */
export function requireArtifactKind(
  registry: ArtifactKindRegistry,
  kind: ArtifactKind,
): AnyArtifactKindEntry {
  const entry = registry.byKind.get(kind);
  if (entry === undefined) {
    throw new Error(`no artifact kind registered as "${kind}"`);
  }
  return entry;
}

/** Every registered kind, in registration order. */
export function listArtifactKinds(registry: ArtifactKindRegistry): AnyArtifactKindEntry[] {
  return [...registry.byKind.values()];
}

/** Every registered kind id, in registration order. */
export function artifactKindIds(registry: ArtifactKindRegistry): ArtifactKind[] {
  return [...registry.byKind.keys()];
}

/**
 * Reads a stored payload for a kind named by the data itself — the shape every import and every
 * read from storage arrives in. An unrecognised kind is a rejection like any other, so one bad
 * record in a two-hundred-artifact backup costs that record and nothing else.
 */
export function readArtifactPayloadForKind(
  registry: ArtifactKindRegistry,
  kind: ArtifactKind,
  payload: unknown,
  fromVersion: number,
): PayloadResult<unknown> {
  const entry = getArtifactKind(registry, kind);
  if (entry === undefined) {
    return rejectedPayload('unknown-kind', `no artifact kind registered as "${kind}"`);
  }
  return readArtifactPayload(entry, payload, fromVersion);
}
