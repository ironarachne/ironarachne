import {
  acceptedPayload,
  getArtifactKind,
  readArtifactPayload,
  rejectedPayload,
  type AnyArtifactKindEntry,
  type ArtifactKind,
  type ArtifactKindRegistry,
} from '$lib/artifact_kinds';
import {
  deleteArtifactRecord,
  payloadByteSize,
  readArtifactPayloadRecord,
  writeArtifactRecord,
  writeArtifactSummaryRecord,
} from '$lib/vault_db';

import { notifyArtifactsChanged } from './artifact_events';
import {
  forgetArtifact,
  hydrateArtifacts,
  indexedArtifact,
  indexedArtifacts,
  rememberArtifact,
} from './artifact_index';
import type {
  Artifact,
  ArtifactChanges,
  ArtifactDeletion,
  ArtifactDraft,
  ArtifactMutationOptions,
  ArtifactProvenance,
  ArtifactReadResult,
  ArtifactReference,
  ArtifactSummary,
  ArtifactWriteResult,
} from './artifact_types';

/**
 * A random, never-reused artifact id. Mirrors `newProjectId` in `$lib/projects`, fallback and all:
 * `crypto.randomUUID` where it exists, because failing to save is a worse outcome than an id with
 * less entropy behind it.
 */
export function newArtifactId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid !== undefined) {
    return uuid;
  }
  return `artifact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTags(tags: string[] | undefined): string[] {
  const seen = new Set<string>();
  for (const tag of tags ?? []) {
    const trimmed = tag.trim();
    if (trimmed !== '') {
      seen.add(trimmed);
    }
  }
  return [...seen];
}

/**
 * References with no target or no role are dropped. A role-less reference is the untyped link
 * decision 1 in docs/workshop.md rules out, and storing one would leave every consumer guessing
 * what it was for.
 */
function normalizeReferences(references: ArtifactReference[] | undefined): ArtifactReference[] {
  const out: ArtifactReference[] = [];
  const seen = new Set<string>();
  for (const reference of references ?? []) {
    const targetId = reference.targetId.trim();
    const role = reference.role.trim();
    const key = `${role} ${targetId}`;
    if (targetId === '' || role === '' || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push({ targetId, targetKind: reference.targetKind, role });
  }
  return out;
}

function normalizeProvenance(
  provenance: ArtifactProvenance | undefined,
): ArtifactProvenance | undefined {
  if (provenance === undefined) {
    return undefined;
  }
  return {
    toolPath: provenance.toolPath,
    seed: provenance.seed,
    config: provenance.config ?? {},
  };
}

/**
 * The name an artifact gets when the caller does not supply one: whatever the kind makes of the
 * payload, and the kind's display name when even that is empty. An unnamed thing in a list of
 * thirty is not something a user can find again.
 */
function defaultArtifactName(entry: AnyArtifactKindEntry, payload: unknown): string {
  const fromKind = entry.nameOf(payload).trim();
  return fromKind === '' ? entry.displayName : fromKind;
}

function sortSummaries(summaries: ArtifactSummary[]): ArtifactSummary[] {
  return [...summaries].sort(
    (a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

/**
 * Every artifact in a project, most recently updated first — the order a project view wants. Name
 * and id break ties so the order is total and two reads of unchanged storage agree.
 *
 * Synchronous, and reads the hydrated index rather than the database. A caller that has not
 * awaited `hydrateArtifacts` sees an empty vault, which is the same answer it would get from a
 * browser with no storage — so a listing never blocks a render.
 */
export function listArtifacts(projectId: string): ArtifactSummary[] {
  return sortSummaries(indexedArtifacts().filter((summary) => summary.projectId === projectId));
}

/** Every artifact of one kind in a project, in the same order as {@link listArtifacts}. */
export function listArtifactsOfKind(projectId: string, kind: ArtifactKind): ArtifactSummary[] {
  return listArtifacts(projectId).filter((summary) => summary.kind === kind);
}

export function getArtifactSummary(projectId: string, id: string): ArtifactSummary | undefined {
  const summary = indexedArtifact(id);
  return summary?.projectId === projectId ? summary : undefined;
}

/**
 * The artifacts whose references name this one — what #37's delete prompt has to show, and useful
 * on its own for "which of my regions use this culture?".
 *
 * Cheap because references live in the summary, so this reads memory rather than every payload in
 * the project. A self-reference is reported like any other; cycles are legitimate.
 */
export function listArtifactReferrers(projectId: string, id: string): ArtifactSummary[] {
  return listArtifacts(projectId).filter((summary) =>
    summary.references.some((reference) => reference.targetId === id),
  );
}

/**
 * Create an artifact and store it.
 *
 * The payload is validated against its kind first, so the store never writes something the kind
 * would refuse to read back. An unknown kind, an invalid payload, and a database that refused the
 * write all come back as rejections rather than exceptions — they are outcomes a caller has to
 * report, and one bad save must not take out the caller.
 *
 * The project is not checked for existence: this library is keyed by project id and deliberately
 * does not know the project set, which is what keeps the dependency running one way (`$lib/projects`
 * cascades into here, never the reverse).
 */
export async function createArtifact(
  registry: ArtifactKindRegistry,
  draft: ArtifactDraft,
  options: ArtifactMutationOptions = {},
): Promise<ArtifactWriteResult<Artifact>> {
  if (draft.projectId.trim() === '') {
    throw new Error('an artifact needs a project id');
  }

  const entry = getArtifactKind(registry, draft.kind);
  if (entry === undefined) {
    return rejectedPayload('unknown-kind', `no artifact kind registered as "${draft.kind}"`);
  }
  const validated = entry.validate(draft.payload);
  if (!validated.ok) {
    return rejectedPayload(validated.reason, validated.message);
  }

  const ready = await hydrateArtifacts();
  if (!ready.ok) {
    return ready;
  }

  const id = options.id ?? newArtifactId();
  if (indexedArtifact(id) !== undefined) {
    // Ids are never reused, so this only fires when a caller supplied one, which is import (#35),
    // which is where the answer to a collision lives. Refusing loudly is the one thing that cannot
    // cost someone an artifact.
    throw new Error(`artifact id "${id}" is already in use`);
  }

  const now = options.now ?? Date.now();
  const name = (draft.name ?? '').trim();
  const summary: ArtifactSummary = {
    id,
    projectId: draft.projectId,
    kind: draft.kind,
    name: name === '' ? defaultArtifactName(entry, validated.value) : name,
    tags: normalizeTags(draft.tags),
    references: normalizeReferences(draft.references),
    payloadVersion: entry.payloadVersion,
    byteSize: payloadByteSize(validated.value),
    createdAt: options.createdAt ?? now,
    updatedAt: now,
  };
  const provenance = normalizeProvenance(draft.provenance);
  if (provenance !== undefined) {
    summary.provenance = provenance;
  }

  const written = await writeArtifactRecord(summary, validated.value);
  if (!written.ok) {
    return written;
  }
  rememberArtifact(summary);
  notifyArtifactsChanged({ change: 'created', projectId: summary.projectId, artifactId: id });
  return acceptedPayload({ ...summary, payload: validated.value });
}

/**
 * Read an artifact back, migrating a payload written at an older version on the way out.
 *
 * `undefined` means no artifact has that id in that project — including when the index could not
 * be read at all, since without a summary there is nothing to report a failure against. Anything
 * else is a {@link ArtifactReadResult}, and a rejection still carries the summary: a payload this
 * build cannot read, or could not reach, is still something the user has to see and export.
 *
 * **A migration is not written back.** A read that writes can fail on a full disk, and reading a
 * project would then be the operation that fills it; the migrated payload is handed back and
 * whatever the user does next saves it at the current version.
 */
export async function readArtifact(
  registry: ArtifactKindRegistry,
  projectId: string,
  id: string,
): Promise<ArtifactReadResult | undefined> {
  await hydrateArtifacts();
  const summary = getArtifactSummary(projectId, id);
  if (summary === undefined) {
    return undefined;
  }

  const entry = getArtifactKind(registry, summary.kind);
  if (entry === undefined) {
    return {
      ok: false,
      summary,
      reason: 'unknown-kind',
      message: `no artifact kind registered as "${summary.kind}"`,
    };
  }

  const stored = await readArtifactPayloadRecord(id);
  if (!stored.ok) {
    return { ok: false, summary, reason: stored.reason, message: stored.message };
  }
  if (stored.value === undefined) {
    return {
      ok: false,
      summary,
      reason: 'invalid-payload',
      message: `artifact "${id}" has no readable stored payload`,
    };
  }

  const result = readArtifactPayload(entry, stored.value.payload, summary.payloadVersion);
  if (!result.ok) {
    return { ok: false, summary, reason: result.reason, message: result.message };
  }
  return {
    ok: true,
    artifact: { ...summary, payload: result.value, payloadVersion: entry.payloadVersion },
    migrated: summary.payloadVersion !== entry.payloadVersion,
  };
}

/**
 * Replace an artifact's payload with a new snapshot, which is what saving an edit does.
 *
 * `undefined` means no artifact has that id in that project; a rejection means the kind refused
 * the snapshot or the database refused the write. The payload is always stored at the kind's
 * current version — an edit is written by this build, so it is current by definition.
 *
 * The summary and the payload go in one transaction, so `payloadVersion`, `byteSize`, and the
 * bytes they describe cannot end up disagreeing.
 */
export async function updateArtifactPayload(
  registry: ArtifactKindRegistry,
  projectId: string,
  id: string,
  payload: unknown,
  options: ArtifactMutationOptions = {},
): Promise<ArtifactWriteResult<Artifact> | undefined> {
  const ready = await hydrateArtifacts();
  if (!ready.ok) {
    return ready;
  }
  const summary = getArtifactSummary(projectId, id);
  if (summary === undefined) {
    return undefined;
  }

  const entry = getArtifactKind(registry, summary.kind);
  if (entry === undefined) {
    return rejectedPayload('unknown-kind', `no artifact kind registered as "${summary.kind}"`);
  }
  const validated = entry.validate(payload);
  if (!validated.ok) {
    return rejectedPayload(validated.reason, validated.message);
  }

  const next: ArtifactSummary = {
    ...summary,
    payloadVersion: entry.payloadVersion,
    byteSize: payloadByteSize(validated.value),
    updatedAt: options.now ?? Date.now(),
  };
  const written = await writeArtifactRecord(next, validated.value);
  if (!written.ok) {
    return written;
  }
  rememberArtifact(next);
  notifyArtifactsChanged({ change: 'updated', projectId, artifactId: id });
  return acceptedPayload({ ...next, payload: validated.value });
}

function sameReferences(a: ArtifactReference[], b: ArtifactReference[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (reference, index) =>
        reference.targetId === b[index].targetId &&
        reference.targetKind === b[index].targetKind &&
        reference.role === b[index].role,
    )
  );
}

function sameSummary(a: ArtifactSummary, b: ArtifactSummary): boolean {
  return (
    a.name === b.name &&
    a.tags.length === b.tags.length &&
    a.tags.every((tag, index) => tag === b.tags[index]) &&
    sameReferences(a.references, b.references)
  );
}

/**
 * Apply metadata changes to an artifact, returning the stored result, or `undefined` when no
 * artifact has that id in that project. An omitted field is left alone; an empty array clears the
 * field it names. A change that changes nothing does not touch `updatedAt` and writes nothing, so
 * reading an artifact and writing it back unaltered cannot reorder a project's list.
 *
 * A blank name is the one thing that does not clear: it keeps the name the artifact had. The
 * default a create would have used comes from the kind's `nameOf` and the payload, neither of
 * which a metadata edit has in its hands, and a nameless row in a list of thirty is not something
 * a user can find again.
 *
 * This never touches the payload record, which is the point of keying the store the way it does:
 * renaming a region rewrites a few hundred bytes, not the map inside it.
 */
export async function updateArtifact(
  projectId: string,
  id: string,
  changes: ArtifactChanges,
  options: ArtifactMutationOptions = {},
): Promise<ArtifactWriteResult<ArtifactSummary> | undefined> {
  const ready = await hydrateArtifacts();
  if (!ready.ok) {
    return ready;
  }
  const existing = getArtifactSummary(projectId, id);
  if (existing === undefined) {
    return undefined;
  }

  const next: ArtifactSummary = {
    ...existing,
    name: changes.name === undefined ? existing.name : changes.name.trim(),
    tags: changes.tags === undefined ? existing.tags : normalizeTags(changes.tags),
    references:
      changes.references === undefined
        ? existing.references
        : normalizeReferences(changes.references),
  };
  if (next.name === '') {
    next.name = existing.name;
  }
  if (sameSummary(existing, next)) {
    return acceptedPayload(existing);
  }

  next.updatedAt = options.now ?? Date.now();
  const written = await writeArtifactSummaryRecord(next);
  if (!written.ok) {
    return written;
  }
  rememberArtifact(next);
  notifyArtifactsChanged({ change: 'updated', projectId, artifactId: id });
  return acceptedPayload(next);
}

export function renameArtifact(
  projectId: string,
  id: string,
  name: string,
  options: ArtifactMutationOptions = {},
): Promise<ArtifactWriteResult<ArtifactSummary> | undefined> {
  return updateArtifact(projectId, id, { name }, options);
}

export function tagArtifact(
  projectId: string,
  id: string,
  tags: string[],
  options: ArtifactMutationOptions = {},
): Promise<ArtifactWriteResult<ArtifactSummary> | undefined> {
  return updateArtifact(projectId, id, { tags }, options);
}

/**
 * Replace an artifact's references. The mechanism #37 drives; the store carries and queries the
 * links but does not decide what any of them mean.
 */
export function setArtifactReferences(
  projectId: string,
  id: string,
  references: ArtifactReference[],
  options: ArtifactMutationOptions = {},
): Promise<ArtifactWriteResult<ArtifactSummary> | undefined> {
  return updateArtifact(projectId, id, { references }, options);
}

/**
 * Delete an artifact, reporting what pointed at it.
 *
 * It does not refuse, and does not repair the references it breaks. That is settled policy from
 * #37: the user is prompted with the referrer list, may delete anyway, and the dangling references
 * are tolerated and surfaced as visibly broken. `referrers` is what the prompt is built from.
 *
 * The summary and the payload go in one transaction, so there is no order to reason about and no
 * residue to clean up: either both are gone or neither is.
 */
export async function deleteArtifact(
  projectId: string,
  id: string,
): Promise<ArtifactWriteResult<ArtifactDeletion>> {
  const ready = await hydrateArtifacts();
  if (!ready.ok) {
    return ready;
  }
  const summary = getArtifactSummary(projectId, id);
  if (summary === undefined) {
    return acceptedPayload({ deleted: false, id, referrers: [] });
  }

  // Unlike `listArtifactReferrers`, this leaves out a self-reference: the point of the list is
  // what will be left pointing at nothing, and the artifact's own links go with it.
  const referrers = listArtifactReferrers(projectId, id).filter((referrer) => referrer.id !== id);

  const deleted = await deleteArtifactRecord(id);
  if (!deleted.ok) {
    return deleted;
  }
  forgetArtifact(id);
  notifyArtifactsChanged({ change: 'deleted', projectId, artifactId: id });
  return acceptedPayload({ deleted: true, id, referrers });
}
