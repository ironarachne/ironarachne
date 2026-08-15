import {
  readArtifact,
  updateArtifact,
  updateArtifactPayload,
  type ArtifactSummary,
} from '$lib/artifacts';

import { artifactEditorEntry, ARTIFACT_EDITORS } from './artifact_editors';
import { ARTIFACT_KINDS } from './artifact_kind_catalog';
import type {
  ArtifactEditingTarget,
  ArtifactEditorRegistry,
  ArtifactEditResult,
  ArtifactEdits,
  ArtifactRerollAvailability,
} from './workshop_types';

/**
 * Open a saved artifact for editing: read it, and resolve what this build can do to it.
 *
 * `undefined` means no artifact has that id in that project — the one case the caller has to
 * treat as "it is gone" rather than as a failure to show. Everything else comes back as a target,
 * including a payload this build cannot read: the summary is still there, so the artifact can
 * still be named and exported, and only the contents are missing.
 *
 * It is here rather than in `$lib/artifacts` for the reason saving and loading are: this is where
 * a *tool* — the build's registries of kinds and of editors — meets the store, and the store
 * knows about neither.
 */
export async function openArtifactForEditing(
  projectId: string,
  id: string,
  editors: ArtifactEditorRegistry = ARTIFACT_EDITORS,
): Promise<ArtifactEditingTarget | undefined> {
  const read = await readArtifact(ARTIFACT_KINDS, projectId, id);
  if (read === undefined) {
    return undefined;
  }

  const summary = read.ok ? read.artifact : read.summary;
  const entry = artifactEditorEntry(summary.kind, editors);
  const editing: ArtifactEditingTarget = {
    summary,
    migrated: read.ok && read.migrated,
    loadEditor: entry?.loadEditor,
    loadRoller: entry?.loadRoller,
  };
  return read.ok
    ? { ...editing, snapshot: read.artifact.payload }
    : { ...editing, problem: { reason: read.reason, message: read.message } };
}

/**
 * Whether an artifact can be re-rolled, and when it cannot, which of the two reasons applies.
 *
 * A payload that could not be read is deliberately *not* a third reason. Re-rolling replaces the
 * payload outright, so a kind that can roll can rescue an artifact whose stored contents this
 * build cannot make sense of — refusing there would take away the one repair available.
 */
export function artifactRerollAvailability(
  target: ArtifactEditingTarget,
): ArtifactRerollAvailability {
  if (target.loadRoller === undefined) {
    return 'unsupported';
  }
  return target.summary.provenance === undefined ? 'no-provenance' : 'available';
}

/**
 * Structural equality over two snapshots.
 *
 * A snapshot is plain data by contract — that is what `toSnapshot` is for — so this needs to
 * handle objects, arrays, and primitives and nothing else. Serialising both sides and comparing
 * the strings would have been shorter and wrong: key order is not part of a snapshot's meaning,
 * and an editor that rebuilds an object with its fields in a different order would leave the user
 * warned about unsaved changes they never made.
 */
function sameSnapshot(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((entry, index) => sameSnapshot(entry, b[index]))
    );
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => key in right && sameSnapshot(left[key], right[key]))
  );
}

/**
 * Whether the name has been changed to something that would actually be stored.
 *
 * A blank field is not a change, because `updateArtifact` keeps the name the artifact had rather
 * than clearing it. Counting it as one would leave the surface permanently dirty and warning
 * about edits that saving could never resolve.
 */
function nameChanged(summary: ArtifactSummary, name: string): boolean {
  const next = name.trim();
  return next !== '' && next !== summary.name;
}

/**
 * Whether anything on the editing surface has yet to be written.
 *
 * This is the whole of the dirty state: the framework compares what is on screen against what was
 * read, so an editor that hands back a snapshot equal to the stored one — a field typed into and
 * typed back out of — leaves nothing to save and nothing to warn about.
 */
export function hasUnsavedArtifactEdits(
  target: ArtifactEditingTarget,
  edits: ArtifactEdits,
): boolean {
  if (nameChanged(target.summary, edits.name)) {
    return true;
  }
  return edits.payload !== undefined && !sameSnapshot(edits.payload, target.snapshot);
}

/**
 * Write what the surface is holding.
 *
 * The payload goes first and the name second, so a rejected snapshot leaves the artifact entirely
 * as it was rather than renamed but not re-written. They are two transactions because they are two
 * records — see the store's README for why the payload is keyed separately — and an edit that
 * touches only the name never opens the payload record at all.
 *
 * An untouched payload is not rewritten, which is what keeps opening an artifact and saving a
 * rename from bumping `updatedAt` on contents nobody changed.
 */
export async function saveArtifactEdits(
  projectId: string,
  id: string,
  edits: ArtifactEdits,
): Promise<ArtifactEditResult> {
  let snapshot = edits.payload;
  if (edits.payload !== undefined) {
    const written = await updateArtifactPayload(ARTIFACT_KINDS, projectId, id, edits.payload);
    if (written === undefined) {
      return missingTarget(id);
    }
    if (!written.ok) {
      return { ok: false, reason: written.reason, message: written.message };
    }
    snapshot = written.value.payload;
  }

  const renamed = await updateArtifact(projectId, id, { name: edits.name.trim() });
  if (renamed === undefined) {
    return missingTarget(id);
  }
  if (!renamed.ok) {
    return { ok: false, reason: renamed.reason, message: renamed.message };
  }
  return { ok: true, summary: renamed.value, snapshot };
}

/**
 * Roll the artifact again from the provenance it was made with, replacing whatever is stored.
 *
 * **Destructive by definition**, and the one path in the workshop that regenerates content: the
 * payload is the truth everywhere else, so this exists only because a user explicitly asked to
 * throw their copy away and have the generator's back. Confirming that is the caller's job — this
 * writes as soon as it is called.
 *
 * A roller that throws is caught rather than allowed out. A kind's generator reaching a state its
 * own snapshot no longer describes is a bug in that kind, and one bad roll must cost the roll, not
 * the artifact the user still has on screen.
 */
export async function rerollArtifact(
  projectId: string,
  target: ArtifactEditingTarget,
): Promise<ArtifactEditResult> {
  const { provenance } = target.summary;
  if (target.loadRoller === undefined || provenance === undefined) {
    return { ok: false, reason: 'not-rerollable', message: rerollUnavailableMessage(target) };
  }

  let rolled: unknown;
  try {
    const roll = await target.loadRoller();
    rolled = roll(provenance);
  } catch (error: unknown) {
    return {
      ok: false,
      reason: 'roll-failed',
      message: `“${target.summary.name}” could not be rolled again: ${String(error)}`,
    };
  }

  const written = await updateArtifactPayload(ARTIFACT_KINDS, projectId, target.summary.id, rolled);
  if (written === undefined) {
    return missingTarget(target.summary.id);
  }
  if (!written.ok) {
    return { ok: false, reason: written.reason, message: written.message };
  }
  return { ok: true, summary: written.value, snapshot: written.value.payload };
}

/** What to say when a re-roll was asked for and the artifact is not one that can be re-rolled. */
function rerollUnavailableMessage(target: ArtifactEditingTarget): string {
  return artifactRerollAvailability(target) === 'no-provenance'
    ? `“${target.summary.name}” has no record of how it was made, so there is nothing to roll again.`
    : `${target.summary.kind} artifacts cannot be rolled again.`;
}

function missingTarget(id: string): ArtifactEditResult {
  return {
    ok: false,
    reason: 'missing-target',
    message: `no artifact "${id}" in this project`,
  };
}
