import type { QuarantineReason } from '$lib/artifact_kinds';
import type { Artifact } from '$lib/artifacts';
import type { Project } from '$lib/projects';
import type { VaultFailureReason } from '$lib/vault_db';
import type { ProjectWorkspace } from '$lib/workspaces';

/**
 * What identifies a file as ours before anything in it is trusted.
 *
 * A literal rather than a `string`, per the file-format diagram in docs/workshop.md: `string` is
 * precisely the type that cannot tell our file from a JSON file that happens to have a `format`
 * key, and telling those apart is the first thing an import has to do.
 */
export const EXPORT_FORMAT_MARKER = 'ironarachne.export' as const;

/**
 * The version of the envelope this build writes.
 *
 * **Not an artifact's `payloadVersion`.** They advance independently and migrate in separate
 * chains — the envelope through {@link ExportFormatMigration}, a payload through its kind — because
 * sharing one number would couple every payload change to the file format and back.
 */
export const EXPORT_FORMAT_VERSION = 1;

/**
 * Which of the three granularities a file holds, per "Three granularities, one format".
 *
 * The discriminator exists in this build even though `vault` is not implemented here: #47 adds a
 * scope to a format that already has the field, rather than introducing a second format with a
 * second parser and a second migration chain. A vault file reaching this build is refused by name
 * — it is never read as though it were a project.
 */
export type ExportScope = 'vault' | 'project' | 'artifact';

/**
 * An artifact as it travels: everything the store holds except `byteSize`.
 *
 * The size is a fact about this browser's copy of the payload, recorded at write time and
 * recomputed by whichever store the artifact lands in next. Carrying it would put a number in the
 * file that is stale the moment another build serialises the payload differently.
 */
export type ExportedArtifact = Omit<Artifact, 'byteSize'>;

/** Every project and every artifact. Written by #47; parsed, and refused, here. */
export type VaultBody = {
  projects: Project[];
  artifacts: ExportedArtifact[];
  workspaces: ProjectWorkspace[];
};

/** One project and the artifacts in it. The bench travels when there is one to travel. */
export type ProjectBody = {
  project: Project;
  artifacts: ExportedArtifact[];
  workspace?: ProjectWorkspace;
};

/** One artifact, with no project around it to attach a bench to. */
export type ArtifactBody = {
  artifact: ExportedArtifact;
};

export type ExportBody = VaultBody | ProjectBody | ArtifactBody;

/** The header every file carries, whatever its scope. */
export type ExportEnvelopeHeader = {
  format: typeof EXPORT_FORMAT_MARKER;
  formatVersion: number;
  /** ISO 8601, per decision 2 in docs/workshop.md: stored work counts milliseconds, files read. */
  exportedAt: string;
  /** Which build wrote it. **Diagnostics only, and never a gate on import.** */
  appVersion: string;
  /** The originating browser profile, so an import can recognise a file as one of this vault's. */
  vaultId: string;
  /**
   * SHA-256 of the canonical body, so truncation is reported as damage rather than as a syntax
   * error at character 40119. Empty when the browser offered no `crypto.subtle` to compute one
   * with, which reads as "not checked" rather than as "does not match".
   */
  checksum: string;
};

/**
 * A parsed file: the header, and a body whose shape the scope determines.
 *
 * A union rather than a `scope` field beside an `ExportBody`, so that narrowing on `scope` is what
 * gives a caller the right body — which is the whole point of the discriminator being in the file.
 */
export type ExportEnvelope =
  | (ExportEnvelopeHeader & { scope: 'vault'; body: VaultBody })
  | (ExportEnvelopeHeader & { scope: 'project'; body: ProjectBody })
  | (ExportEnvelopeHeader & { scope: 'artifact'; body: ArtifactBody });

/**
 * Why a file could not be read, in the vocabulary "Failure states" asks for. Each is a different
 * mistake and gets a different sentence: a user who downloaded half a file and a user who picked
 * the wrong file need different advice.
 */
export type ExportFileProblem =
  /** Not JSON at all, or JSON that stops part way — the ordinary end of an interrupted download. */
  | 'damaged'
  /** Valid JSON, but not one of ours. */
  | 'not-ours'
  /** Ours, but the header is not one this build can make sense of. */
  | 'malformed'
  /** Written by a newer build. Never partially read: a newer envelope may mean anything. */
  | 'newer-format'
  /** Older than this build, with no migration step to bring it forward. */
  | 'unmigratable';

/**
 * Whether the file's checksum matched what its body hashes to.
 *
 * Three states rather than a boolean because "we did not check" is not "it did not match":
 * a mismatch is worth warning about, and a browser with no `crypto.subtle` is not.
 */
export type ChecksumState = 'ok' | 'mismatch' | 'unchecked';

/**
 * An artifact kept verbatim because this build could not turn it into one of its own.
 *
 * Invariant 2 in docs/workshop.md: nothing is dropped silently. Dropping destroys work, and
 * rejecting a two-hundred-artifact file over one bad record makes the backup useless — so the
 * record is reported with enough of itself lifted out to be named on screen, and `raw` holds the
 * whole thing so a later build that understands it can still find it in the file.
 *
 * `id`, `projectId`, `kind`, and `name` are empty strings when the record was too damaged to carry
 * them. Keeping the `kind` string is not the same as trusting it.
 */
export type QuarantinedArtifact = {
  id: string;
  projectId: string;
  kind: string;
  name: string;
  raw: unknown;
  reason: QuarantineReason;
  message: string;
};

/**
 * One step in the envelope's own migration chain.
 *
 * The chain is empty in this build, because version 1 is the only envelope that has ever been
 * written. It exists anyway, and `parseExportFile` runs it, because the alternative is what
 * `save_file_export.ts` does today: compare `formatVersion` with `===` and reject every file the
 * next version bump leaves behind. A format with no way forward turns a version bump into data
 * loss, and there is no server here to fix a file already in someone's Downloads folder.
 */
export type ExportFormatMigration = {
  /** The version this step reads. It always produces `from + 1`. */
  from: number;
  migrate: (envelope: Record<string, unknown>) => Record<string, unknown>;
};

/** A file read successfully, and everything the reader noticed on the way through. */
export type ExportFileParseResult =
  | {
      ok: true;
      envelope: ExportEnvelope;
      /** True when the file was written at an older `formatVersion` and was brought forward. */
      formatMigrated: boolean;
      checksum: ChecksumState;
      /**
       * Records that were not artifacts this build could read at all — a damaged entry in an
       * otherwise good file. Kind and payload problems are found later, during staging.
       */
      quarantined: QuarantinedArtifact[];
    }
  | { ok: false; problem: ExportFileProblem; message: string };

/**
 * How an import treats what is already stored.
 *
 * Only `merge` is produced by this build: a project file is imported *as a new project*, because
 * reconciling a file's version of a project against the stored one is a sync problem needing causal
 * history the format cannot carry, and every shortcut for it quietly destroys somebody's edits.
 * `restore` arrives with whole-vault import (#47), which is the granularity it makes sense at.
 */
export type ImportMode = 'restore' | 'merge';

/**
 * What an import did, in terms a user can read.
 *
 * A return type, not a toast: every field here is something the summary has to be able to say, and
 * "Import complete" is a way of not saying what happened. Counts of removals are on it because
 * restore destroys and has to say so — this build never fills them in, and #47 does.
 */
export type ImportSummary = {
  mode: ImportMode;
  scope: ExportScope;
  /**
   * Where the work landed: the project a project import created, or the open one an artifact was
   * added to. Absent when nothing was written, which is the quarantined-artifact case.
   *
   * On the summary because the caller has to be able to take the user there. An import that
   * succeeds and leaves the user hunting through a project list for what arrived has told them
   * less than it knows.
   */
  projectId?: string;
  projectsAdded: number;
  artifactsAdded: number;
  projectsRemoved: number;
  artifactsRemoved: number;
  /** Names that now exist twice, because names were never unique and both copies are kept. */
  nameCollisions: string[];
  /** Old id to new id, which is what the reference graph was rewritten through. */
  remintedIds: Record<string, string>;
  quarantined: QuarantinedArtifact[];
  /** Ids the file used twice. Both copies are kept, under new ids, because we cannot know which. */
  duplicateIds: string[];
  /** True when the file came out of this browser's own vault. */
  fromThisVault: boolean;
  checksum: ChecksumState;
  formatMigrated: boolean;
  /** The pre-restore backup that *is* the undo. Written by #47; never set here. */
  backupFileName?: string;
};

/**
 * Why an import did nothing.
 *
 * `unsupported-scope` is the vault file this build refuses by name rather than misreading, and
 * `no-target-project` is a single artifact with nowhere to go — both are states the user can
 * resolve, which is why they are reported rather than thrown.
 *
 * A {@link QuarantineReason} appearing here is the store refusing a payload that had already
 * passed its kind's validator during staging. It should not happen, and it is in the union rather
 * than asserted away because a store and a staging pass that disagree is worth seeing.
 */
export type ImportFailureReason =
  | ExportFileProblem
  | VaultFailureReason
  | QuarantineReason
  | 'unsupported-scope'
  | 'no-target-project';

export type ImportResult =
  | { ok: true; summary: ImportSummary }
  | { ok: false; reason: ImportFailureReason; message: string };

/** A file, ready to be handed to the browser. */
export type ExportFile = {
  fileName: string;
  text: string;
  envelope: ExportEnvelope;
  /**
   * What could not be exported cleanly, said rather than thrown.
   *
   * A backup that refuses to back up the data you most need recovered is exactly backwards, so an
   * artifact whose payload could not be serialised travels with a null payload and a line here.
   */
  issues: string[];
};

export type ExportFileResult =
  | { ok: true; value: ExportFile }
  | { ok: false; reason: VaultFailureReason | 'not-found'; message: string };
