import { RNG } from '@ironarachne/rng';

import { readArtifact } from '$lib/artifacts';

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
