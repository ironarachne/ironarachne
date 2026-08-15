import { RNG } from '@ironarachne/rng';

import type { ArtifactKind } from '$lib/artifact_kinds';
import { hydrateArtifacts, listArtifactsOfKind, readArtifact } from '$lib/artifacts';
import { getActiveProject, hydrateProjects } from '$lib/projects';

import { artifactKindEntry, ARTIFACT_KINDS } from './artifact_kind_catalog';
import type { ArtifactValueResult } from './workshop_types';

/**
 * The RNG a snapshot is rehydrated with.
 *
 * Derived from the artifact's id, so the same saved artifact rebuilds the same way every time it
 * is picked. It rolls nothing — `fromSnapshot` uses it to rebuild name generators and the like,
 * and the payload is the truth — but a rehydration seeded from the clock would still make two
 * loads of one culture produce different name generators, which is a difference a user would see.
 */
function rehydrationRng(id: string): RNG {
  return new RNG(`artifact-${id}`);
}

/**
 * Load a saved artifact as the live value its library works with — the other half of
 * `saveToolArtifact`, and what the generic picker is built on.
 *
 * It is here for the same reason saving is: this is where a *tool* meets the store. The store
 * holds snapshots and deliberately knows nothing about live values; the codec that converts
 * between them belongs to the kind, and this build's registry of kinds is assembled next door.
 *
 * **Every failure is a value, never an exception.** A target that has been deleted is
 * `missing-target` rather than a throw, because a reference to a missing artifact is an ordinary
 * state under rule 3 of docs/workshop.md and its consumer must not crash. A codec that throws is
 * caught for the same reason: `validate` gates what `fromSnapshot` depends on rather than the
 * whole tree, so a payload can satisfy its kind and still surprise the conversion, and a
 * generator must not be taken out by one bad saved artifact.
 *
 * The value is `unknown`. The caller knows which kind it asked for and narrows there; a registry
 * that knew each kind's types would be the hand-maintained list of kinds it exists to remove.
 */
export async function loadArtifactValue(
  projectId: string,
  id: string,
): Promise<ArtifactValueResult> {
  const read = await readArtifact(ARTIFACT_KINDS, projectId, id);
  if (read === undefined) {
    return {
      ok: false,
      reason: 'missing-target',
      message: `no artifact "${id}" in this project`,
    };
  }
  if (!read.ok) {
    return { ok: false, summary: read.summary, reason: read.reason, message: read.message };
  }

  const entry = artifactKindEntry(read.artifact.kind);
  if (entry === undefined) {
    // Unreachable through `readArtifact`, which resolves the same registry first. It is here
    // because the alternative is a non-null assertion on the one line where being wrong would
    // mean calling a method on undefined inside a generator.
    return {
      ok: false,
      summary: read.artifact,
      reason: 'unknown-kind',
      message: `no artifact kind registered as "${read.artifact.kind}"`,
    };
  }

  try {
    const codec = await entry.loadCodec();
    return {
      ok: true,
      summary: read.artifact,
      value: codec.fromSnapshot(read.artifact.payload, rehydrationRng(id)),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      summary: read.artifact,
      reason: 'invalid-payload',
      message: `“${read.artifact.name}” could not be rebuilt: ${String(error)}`,
    };
  }
}

/**
 * Every artifact of one kind in the open project, rebuilt into the live values a tool can use.
 *
 * The bulk form of {@link loadArtifactValue}, for a tool that wants to *offer* everything of a
 * kind rather than resolve one thing a user picked — a character generator listing the cultures
 * available to name from, say. `SavedArtifactPicker` is the better surface where the user is
 * choosing one deliberately; this is for the places that were already showing a plain list.
 *
 * It hydrates first, because the callers are standalone generator routes that have not read the
 * store at all, and a synchronous list against an unread index would quietly report an empty
 * vault. With no project open there is nothing to offer, which is not a failure.
 *
 * **Artifacts that cannot be read are left out.** A list of things to name a character from is not
 * where a user can act on a broken payload, and dropping one costs an option where surfacing it
 * would cost the list. Anything that needs to report the failure should use `loadArtifactValue`
 * and say so itself.
 */
export async function loadActiveProjectArtifactValues(kind: ArtifactKind): Promise<unknown[]> {
  await Promise.all([hydrateProjects(), hydrateArtifacts()]);
  const projectId = getActiveProject()?.id;
  if (projectId === undefined) {
    return [];
  }

  const loaded = await Promise.all(
    listArtifactsOfKind(projectId, kind).map((summary) => loadArtifactValue(projectId, summary.id)),
  );
  return loaded.filter((result) => result.ok).map((result) => result.value);
}
