import {
  getArtifactKind,
  readArtifactPayloadForKind,
  type ArtifactKindRegistry,
} from '$lib/artifact_kinds';
import {
  hydrateArtifacts,
  listArtifacts,
  newArtifactId,
  notifyArtifactsChanged,
  resetArtifactIndex,
  toArtifactSummaryRecord,
  type ArtifactDraft,
  type ArtifactReference,
  type ArtifactSummary,
} from '$lib/artifacts';
import {
  getProject,
  hydrateProjects,
  listProjects,
  newProjectId,
  notifyProjectsChanged,
  resetProjectIndex,
  setActiveProject,
  toProjectRecord,
  type Project,
} from '$lib/projects';
import {
  newQuarantineRecordId,
  toQuarantineRecord,
  type QuarantinedArtifact,
} from '$lib/quarantine';
import {
  readVaultId,
  VAULT_META_KEYS,
  writeVaultContents,
  type VaultContents,
  type VaultMetaRecord,
} from '$lib/vault_db';
import type { PanelState, ProjectWorkspace } from '$lib/workspaces';

import { checkImportCapacity } from './vault_file_capacity';
import { buildVaultExportFile } from './vault_file_export';
import { parseExportFile } from './vault_file_format';
import type {
  ExportedArtifact,
  ExportFile,
  ExportFormatMigration,
  ImportFailureReason,
  ImportMode,
  ImportResult,
  ImportSummary,
  ProjectBody,
  VaultBody,
} from './vault_file_types';

/** What an import is doing, for a caller that has to keep a progress bar honest. */
export type ImportProgress = {
  stage: 'reading' | 'staging' | 'writing';
  done: number;
  total: number;
};

export type ImportExportFileOptions = {
  /**
   * Where a single artifact lands. Required at artifact scope and ignored at every other, which
   * either creates a project of its own or replaces the lot.
   */
  targetProjectId?: string;
  /**
   * How a **vault** file is applied. Defaults to `merge`, which is the mode that cannot lose
   * anything: a default of `restore` would mean a mis-click destroys a vault. Ignored below vault
   * scope, where merge is the only mode that exists.
   */
  mode?: ImportMode;
  /**
   * Called with the automatic pre-restore backup **before anything is written**, and answers
   * whether to go on. That download is the undo, so a caller that could not save it says so and
   * the restore does not happen. Absent means the backup is built and reported but not saved,
   * which is what a test wants and never what a browser does.
   */
  onBackup?: (backup: ExportFile) => Promise<boolean> | boolean;
  onProgress?: (progress: ImportProgress) => void;
  /** Cancels before the commit. After it, there is nothing to cancel: the write is one transaction. */
  signal?: AbortSignal;
  migrations?: ExportFormatMigration[];
  now?: number;
  /** Id minting, injectable so a test can assert the reference graph by name rather than by luck. */
  newProjectId?: () => string;
  newArtifactId?: () => string;
  newQuarantineId?: () => string;
  /** Skips the advisory capacity check. The transaction is the guarantee either way. */
  skipCapacityCheck?: boolean;
};

/** What a file turns out to be, without writing any of it. */
export type ExportFileInspection =
  | {
      ok: true;
      scope: ImportSummary['scope'];
      /** True when the file came out of this browser's own vault. */
      fromThisVault: boolean;
      projects: number;
      artifacts: number;
      exportedAt: string;
      appVersion: string;
    }
  | { ok: false; reason: ImportFailureReason; message: string };

/**
 * Read a file and say what it is, writing nothing.
 *
 * What a caller needs to ask the right question before it imports. The case it exists for is a user
 * re-importing a backup taken from this browser: merging that is not wrong, but it silently leaves
 * them with two copies of everything, and "silently" is the part that is not acceptable. The
 * interface can warn, name restore as the likely intent, and let them decide — which is what
 * `vaultId` is in the envelope for.
 */
export async function inspectExportFile(
  text: string,
  options: Pick<ImportExportFileOptions, 'migrations'> = {},
): Promise<ExportFileInspection> {
  const parsed = await parseExportFile(text, { migrations: options.migrations });
  if (!parsed.ok) {
    return { ok: false, reason: parsed.problem, message: parsed.message };
  }
  const { envelope } = parsed;
  const counts = countBody(envelope);
  return {
    ok: true,
    scope: envelope.scope,
    fromThisVault: await isFromThisVault(envelope.vaultId),
    exportedAt: envelope.exportedAt,
    appVersion: envelope.appVersion,
    ...counts,
  };
}

function countBody(envelope: {
  scope: ImportSummary['scope'];
  body: VaultBody | ProjectBody | { artifact: ExportedArtifact };
}): { projects: number; artifacts: number } {
  if (envelope.scope === 'vault') {
    const body = envelope.body as VaultBody;
    return { projects: body.projects.length, artifacts: body.artifacts.length };
  }
  if (envelope.scope === 'project') {
    return { projects: 1, artifacts: (envelope.body as ProjectBody).artifacts.length };
  }
  return { projects: 0, artifacts: 1 };
}

/** What artifacts with no project of their own are gathered into, rather than dropped. */
export const RECOVERED_PROJECT_NAME = 'Recovered artifacts';

export const RECOVERED_PROJECT_DESCRIPTION =
  'Artifacts that arrived in an import without the project they belonged to.';

function failed(reason: ImportFailureReason, message: string): ImportResult {
  return { ok: false, reason, message };
}

type SummaryBase = Omit<ImportSummary, 'backupFileName'>;

/**
 * An import in flight: what it will write, and what it will say it did.
 *
 * Everything accumulates here and nothing reaches storage until {@link commit}, which is invariant
 * 1 of docs/workshop.md made structural rather than remembered — there is no code path that writes
 * before this is finished, because the only thing that writes takes one of these.
 */
type Staging = {
  registry: ArtifactKindRegistry;
  now: number;
  summary: SummaryBase;
  contents: VaultContents;
  /** Old artifact id to new, which the reference graph is rewritten through. */
  idMap: Map<string, string>;
  /** Old project id to new. Empty on a restore, which preserves them. */
  projectIdMap: Map<string, string>;
  mintArtifactId: () => string;
  mintProjectId: () => string;
  mintQuarantineId: () => string;
  /** Bytes the staged payloads account for, for the capacity check. */
  bytes: number;
};

function emptyContents(): VaultContents {
  return { projects: [], artifacts: [], payloads: [], workspaces: [], quarantine: [] };
}

/**
 * Read a file and write what is in it, or say why nothing was written.
 *
 * **Every entry point accepts every scope.** The file declares what it is, so this dispatches on
 * `scope` rather than on the label of the button that was pressed: a user who drops a vault file on
 * "import project" gets their vault, not a lecture about the wrong button.
 *
 * **Nothing is written until everything has been read.** The file is parsed, its payloads are
 * migrated through their kinds, and the entire result is staged in memory; then one transaction
 * writes it. A file that fails at artifact 900 of 1000 — because it is malformed, because the user
 * cancelled, or because the browser ran out of room — leaves storage byte-identical, since a failed
 * IndexedDB transaction unwinds every put in it.
 */
export async function importExportFile(
  registry: ArtifactKindRegistry,
  text: string,
  options: ImportExportFileOptions = {},
): Promise<ImportResult> {
  options.onProgress?.({ stage: 'reading', done: 0, total: 1 });
  const parsed = await parseExportFile(text, { migrations: options.migrations });
  if (!parsed.ok) {
    return failed(parsed.problem, parsed.message);
  }

  const { envelope } = parsed;
  const mode: ImportMode = envelope.scope === 'vault' ? (options.mode ?? 'merge') : 'merge';
  if (options.mode === 'restore' && envelope.scope !== 'vault') {
    return failed(
      'wrong-scope',
      `Restoring replaces everything you have, so it needs a whole-vault backup. This file holds ${envelope.scope === 'project' ? 'one project' : 'one artifact'}; import it instead and nothing you have is touched.`,
    );
  }

  await hydrateProjects();
  await hydrateArtifacts();

  const staging: Staging = {
    registry,
    now: options.now ?? Date.now(),
    summary: {
      mode,
      scope: envelope.scope,
      projectsAdded: 0,
      artifactsAdded: 0,
      projectsRemoved: 0,
      artifactsRemoved: 0,
      nameCollisions: [],
      remintedIds: {},
      quarantined: [...parsed.quarantined],
      duplicateIds: [],
      fromThisVault: await isFromThisVault(envelope.vaultId),
      checksum: parsed.checksum,
      formatMigrated: parsed.formatMigrated,
    },
    contents: emptyContents(),
    idMap: new Map(),
    projectIdMap: new Map(),
    mintArtifactId: options.newArtifactId ?? newArtifactId,
    mintProjectId: options.newProjectId ?? newProjectId,
    mintQuarantineId: options.newQuarantineId ?? newQuarantineRecordId,
    bytes: 0,
  };

  // Dispatched here, where the envelope is still the discriminated union the parser returned, so
  // each staging function is handed the body its scope actually means.
  let staged: ImportResult | undefined;
  if (envelope.scope === 'vault') {
    staged = stageVault(staging, envelope.body, options);
  } else if (envelope.scope === 'project') {
    stageProject(staging, envelope.body, options);
  } else {
    staged = stageLooseArtifact(staging, envelope.body.artifact, options);
  }
  if (staged !== undefined) {
    return staged;
  }
  return commit(staging, mode === 'restore', options);
}

/**
 * Whether the file came out of this browser's own vault.
 *
 * What lets an import say "this is your own backup" and steer to Restore, so the difference between
 * restoring a backup and duplicating all of one's work does not rest on picking the right radio
 * button. The id is random and says nothing about who the user is, but it is stable and travels in
 * any file they share, which is the honest cost of that affordance.
 */
async function isFromThisVault(vaultId: string): Promise<boolean> {
  if (vaultId === '') {
    return false;
  }
  const stored = await readVaultId();
  return stored.ok && stored.value === vaultId;
}

/**
 * Mint a new id for an artifact, and remember what it used to be.
 *
 * **Every id, on every merge.** The obvious case is a user importing a backup taken from this
 * browser, where every id in the file is already in use; keeping ids where they happen to be free
 * and reminting only on collision would make identity depend on what else the user has, which is
 * the kind of conditional rule that corrupts a reference graph in exactly the cases nobody tests.
 *
 * An id the file uses twice means the file is internally inconsistent. Both copies are kept, each
 * under an id of its own, and the fact is reported: we do not know which the user meant. The map
 * keeps pointing at the first, so a reference to that id resolves somewhere rather than nowhere.
 */
function mintArtifactId(staging: Staging, previousId: string): string {
  const minted = staging.mintArtifactId();
  if (staging.idMap.has(previousId)) {
    staging.summary.duplicateIds.push(previousId);
    return minted;
  }
  staging.idMap.set(previousId, minted);
  staging.summary.remintedIds[previousId] = minted;
  return minted;
}

/**
 * Point a reference at wherever its target ended up.
 *
 * A reference whose target is not in the file keeps the id it had and will not resolve. That is
 * deliberate: broken references are tolerated and visible, and an import is exactly the wrong
 * moment to start guessing which of the artifacts already in storage the user meant.
 */
function rewriteReferences(
  references: ArtifactReference[],
  idMap: Map<string, string>,
): ArtifactReference[] {
  return references.map((reference) => ({
    ...reference,
    targetId: idMap.get(reference.targetId) ?? reference.targetId,
  }));
}

function quarantine(
  staging: Staging,
  artifact: ExportedArtifact,
  reason: QuarantinedArtifact['reason'],
  message: string,
): void {
  const held: QuarantinedArtifact = {
    id: artifact.id,
    projectId: artifact.projectId,
    kind: artifact.kind,
    name: artifact.name,
    raw: artifact,
    reason,
    message,
  };
  staging.summary.quarantined.push(held);
  staging.contents.quarantine.push(
    toQuarantineRecord(held, staging.now, staging.mintQuarantineId()),
  );
}

/**
 * Turn one of the file's artifacts into records ready to write, or quarantine it.
 *
 * The payload goes through the kind registry's read path — the same one storage and legacy adoption
 * use — so an artifact written by an older build is migrated here for the same reason and by the
 * same code it would be anywhere else. An unknown kind, a payload that fails its validator, and a
 * migration that gives up are each quarantined rather than dropped and rather than fatal: a backup
 * with one unreadable record in it is still two hundred records the user wants back.
 *
 * `id` is supplied by the caller because restore and merge answer identity differently, and that
 * is the only thing they differ on here.
 */
function stageArtifact(
  staging: Staging,
  artifact: ExportedArtifact,
  projectId: string,
  id: string,
): void {
  const payload = readArtifactPayloadForKind(
    staging.registry,
    artifact.kind,
    artifact.payload,
    artifact.payloadVersion,
  );
  if (!payload.ok) {
    quarantine(staging, artifact, payload.reason, payload.message);
    return;
  }
  const entry = getArtifactKind(staging.registry, artifact.kind);
  if (entry === undefined) {
    // Unreachable: an unknown kind fails the read above. Kept as a rejection rather than a
    // non-null assertion, because a registry that answers differently twice in three lines is
    // worth reporting rather than crashing on.
    quarantine(
      staging,
      artifact,
      'unknown-kind',
      `no artifact kind registered as "${artifact.kind}"`,
    );
    return;
  }

  const draft: ArtifactDraft = {
    projectId,
    kind: artifact.kind,
    payload: payload.value,
    name: artifact.name,
    tags: artifact.tags,
    references: artifact.references,
  };
  if (artifact.provenance !== undefined) {
    draft.provenance = artifact.provenance;
  }
  const summary = toArtifactSummaryRecord(entry, draft, payload.value, {
    id,
    now: artifact.updatedAt,
    createdAt: artifact.createdAt,
  });
  staging.contents.artifacts.push(summary);
  staging.contents.payloads.push({ artifactId: id, payload: payload.value });
  staging.bytes += summary.byteSize;
  staging.summary.artifactsAdded += 1;
}

/** References are rewritten after every artifact is staged, because a target may come later. */
function rewriteStagedReferences(staging: Staging): void {
  for (const summary of staging.contents.artifacts as ArtifactSummary[]) {
    summary.references = rewriteReferences(summary.references, staging.idMap);
  }
}

function reportNameCollision(staging: Staging, existing: string[], name: string): void {
  if (existing.includes(name)) {
    staging.summary.nameCollisions.push(name);
  }
}

/** One project and its artifacts, added alongside whatever is already stored. */
function stageProject(staging: Staging, body: ProjectBody, options: ImportExportFileOptions): void {
  const projectId = staging.mintProjectId();
  staging.projectIdMap.set(body.project.id, projectId);
  stageProjectRecord(staging, body.project, projectId);
  reportNameCollision(
    staging,
    listProjects().map((project) => project.name),
    body.project.name,
  );

  for (const [index, artifact] of body.artifacts.entries()) {
    stageArtifact(staging, artifact, projectId, mintArtifactId(staging, artifact.id));
    options.onProgress?.({ stage: 'staging', done: index + 1, total: body.artifacts.length });
  }
  rewriteStagedReferences(staging);
  stageWorkspace(staging, body.workspace, projectId);
  staging.summary.projectId = projectId;
  staging.summary.projectsAdded = 1;
}

/** A project as the store would have written it, under whichever id this import decided on. */
function stageProjectRecord(staging: Staging, project: Project, id: string): void {
  const stored = toProjectRecord(
    {
      name: project.name,
      ...(project.description === undefined ? {} : { description: project.description }),
      ...(project.genre === undefined ? {} : { genre: project.genre }),
      ...(project.system === undefined ? {} : { system: project.system }),
      ...(project.ruleset === undefined ? {} : { ruleset: project.ruleset }),
      tags: project.tags,
    },
    { id, now: project.updatedAt, createdAt: project.createdAt },
  );
  staging.contents.projects.push({ id, value: stored });
}

/**
 * Put a bench back, pointing at the artifacts as they were reminted.
 *
 * Panels naming artifacts that were quarantined are dropped, because a panel bound to nothing is
 * worse than one panel fewer — and a bench is not work, so losing one costs a click.
 */
function stageWorkspace(
  staging: Staging,
  workspace: ProjectWorkspace | undefined,
  projectId: string,
): void {
  if (workspace === undefined) {
    return;
  }
  const kept = new Set(
    staging.contents.artifacts.map((summary) => (summary as ArtifactSummary).id),
  );
  const panels: PanelState[] = [];
  for (const panel of workspace.panels) {
    if (panel.toolPath !== undefined) {
      panels.push(panel);
      continue;
    }
    const landed = staging.idMap.get(panel.artifactId) ?? panel.artifactId;
    if (kept.has(landed)) {
      panels.push({ order: panel.order, artifactId: landed });
    }
  }
  if (panels.length > 0) {
    staging.contents.workspaces.push({
      projectId,
      value: { ...workspace, projectId, panels },
    });
  }
}

/** One artifact, into the project the user has open. */
function stageLooseArtifact(
  staging: Staging,
  artifact: ExportedArtifact,
  options: ImportExportFileOptions,
): ImportResult | undefined {
  const targetProjectId = options.targetProjectId;
  if (targetProjectId === undefined || targetProjectId === '') {
    return failed(
      'no-target-project',
      'Open a project first: a single artifact needs somewhere to go.',
    );
  }
  if (getProject(targetProjectId) === undefined) {
    return failed('no-target-project', `no project has the id "${targetProjectId}"`);
  }

  reportNameCollision(
    staging,
    listArtifacts(targetProjectId).map((summary) => summary.name),
    artifact.name,
  );
  stageArtifact(staging, artifact, targetProjectId, mintArtifactId(staging, artifact.id));
  rewriteStagedReferences(staging);
  staging.summary.projectId = targetProjectId;
  return undefined;
}

/**
 * A whole vault: every project, every artifact, every bench.
 *
 * The two modes differ in exactly two decisions, and everything else is shared: whether ids are
 * preserved or reminted, and whether the write replaces or adds. Restore has nothing to collide
 * with, so it keeps every id and the reference graph needs no rewriting at all.
 */
function stageVault(
  staging: Staging,
  body: VaultBody,
  options: ImportExportFileOptions,
): ImportResult | undefined {
  const restoring = staging.summary.mode === 'restore';
  const existingNames = listProjects().map((project) => project.name);
  const seenProjectIds = new Set<string>();

  for (const project of body.projects) {
    const id = restoring && !seenProjectIds.has(project.id) ? project.id : staging.mintProjectId();
    seenProjectIds.add(project.id);
    staging.projectIdMap.set(project.id, id);
    stageProjectRecord(staging, project, id);
    if (!restoring) {
      reportNameCollision(staging, existingNames, project.name);
    }
  }
  staging.summary.projectsAdded = body.projects.length;
  staging.summary.empty = body.projects.length === 0;

  const seenArtifactIds = new Set<string>();
  for (const [index, artifact] of body.artifacts.entries()) {
    if (options.signal?.aborted === true) {
      return failed('cancelled', 'The import was stopped before anything was written.');
    }
    const projectId = projectForArtifact(staging, artifact);
    const id = restoring
      ? restoredArtifactId(staging, artifact.id, seenArtifactIds)
      : mintArtifactId(staging, artifact.id);
    stageArtifact(staging, artifact, projectId, id);
    options.onProgress?.({ stage: 'staging', done: index + 1, total: body.artifacts.length });
  }
  rewriteStagedReferences(staging);

  for (const workspace of body.workspaces) {
    const projectId = staging.projectIdMap.get(workspace.projectId);
    if (projectId !== undefined) {
      stageWorkspace(staging, workspace, projectId);
    }
  }
  return undefined;
}

/**
 * The id a restored artifact keeps — its own, unless the file has already used it.
 *
 * Restore preserves ids because it is replacing the vault and has nothing to collide with. The one
 * exception is a file that is internally inconsistent, where two artifacts claim the same id: with
 * the id preserved, the second would silently overwrite the first, which is this build losing a
 * record rather than the file being wrong. Both are kept and the fact is reported.
 */
function restoredArtifactId(staging: Staging, id: string, seen: Set<string>): string {
  if (seen.has(id)) {
    staging.summary.duplicateIds.push(id);
    return staging.mintArtifactId();
  }
  seen.add(id);
  // The map is the identity for a preserved id, which makes reference rewriting a no-op rather
  // than a special case somebody has to remember to skip.
  staging.idMap.set(id, id);
  return id;
}

/**
 * Where an artifact goes when the file has no project for it.
 *
 * Gathered into a project of its own rather than dropped. A vault file whose artifact list and
 * project list disagree is damaged, and the artifacts are the half worth keeping — there is nothing
 * in a project record that the user wrote and cannot write again.
 */
function projectForArtifact(staging: Staging, artifact: ExportedArtifact): string {
  const mapped = staging.projectIdMap.get(artifact.projectId);
  if (mapped !== undefined) {
    return mapped;
  }
  if (staging.summary.recoveredProjectId === undefined) {
    // Always a fresh id, in both modes: the file did not describe this project, so there is no id
    // of its own to preserve.
    const id = staging.mintProjectId();
    stageProjectRecord(
      staging,
      {
        id,
        name: RECOVERED_PROJECT_NAME,
        description: RECOVERED_PROJECT_DESCRIPTION,
        tags: [],
        createdAt: staging.now,
        updatedAt: staging.now,
      },
      id,
    );
    staging.summary.projectsAdded += 1;
    staging.summary.recoveredProjectId = id;
  }
  staging.projectIdMap.set(artifact.projectId, staging.summary.recoveredProjectId);
  return staging.summary.recoveredProjectId;
}

/**
 * Write the staged vault, in one transaction.
 *
 * Everything that can refuse the import has refused it by now, and what is left is the write. A
 * restore builds the pre-import backup first and does not proceed unless the caller says that
 * backup is safe: that download *is* the undo, and a destructive operation whose undo failed
 * silently is worse than one that did not run.
 */
async function commit(
  staging: Staging,
  replace: boolean,
  options: ImportExportFileOptions,
): Promise<ImportResult> {
  if (options.signal?.aborted === true) {
    return failed('cancelled', 'The import was stopped before anything was written.');
  }

  const capacity = await capacityRefusal(staging, options);
  if (capacity !== undefined) {
    return capacity;
  }

  let backupFileName: string | undefined;
  if (replace) {
    // Counted from the vault as it still stands, which is the only moment it can be counted.
    countWhatRestoreRemoves(staging);
    const backup = await takeBackup(staging, options);
    if (!backup.ok) {
      return backup.refusal;
    }
    backupFileName = backup.fileName;
  }

  options.onProgress?.({
    stage: 'writing',
    done: 0,
    total: staging.contents.artifacts.length,
  });
  const written = await writeVaultContents(staging.contents, {
    replace,
    meta: replace ? [restoreStamp(staging)] : [],
  });
  if (!written.ok) {
    return failed(
      written.reason,
      written.reason === 'quota-exceeded'
        ? 'There was not enough room to finish this import, so none of it was written. Everything you had is exactly as it was.'
        : `${written.message}. Nothing was imported.`,
    );
  }

  await refreshAfterImport(staging, replace);
  const summary: ImportSummary = { ...staging.summary };
  if (backupFileName !== undefined) {
    summary.backupFileName = backupFileName;
  }
  return { ok: true, summary };
}

/**
 * A restore stamps the vault as exported, and that is not a lie: the file the user just restored
 * from holds exactly what the vault now holds, and it is sitting on their disk. Leaving the old
 * stamp would tell someone who has just restored a fresh backup that their work has been unbacked
 * for however long the *previous* browser went without exporting.
 */
function restoreStamp(staging: Staging): VaultMetaRecord {
  return { key: VAULT_META_KEYS.lastVaultExportAt, value: staging.now };
}

async function capacityRefusal(
  staging: Staging,
  options: ImportExportFileOptions,
): Promise<ImportResult | undefined> {
  if (options.skipCapacityCheck === true) {
    return undefined;
  }
  const capacity = await checkImportCapacity(staging.bytes);
  return capacity.ok ? undefined : failed('too-large', capacity.message);
}

type BackupOutcome = { ok: true; fileName?: string } | { ok: false; refusal: ImportResult };

async function takeBackup(
  staging: Staging,
  options: ImportExportFileOptions,
): Promise<BackupOutcome> {
  const built = await buildVaultExportFile({ now: staging.now });
  if (!built.ok) {
    return {
      ok: false,
      refusal: failed(
        built.reason === 'not-found' ? 'storage-failed' : built.reason,
        'The backup of what you have now could not be made, so the restore did not run. Nothing was changed.',
      ),
    };
  }
  if (options.onBackup === undefined) {
    return { ok: true, fileName: built.value.fileName };
  }
  const saved = await options.onBackup(built.value);
  if (!saved) {
    return {
      ok: false,
      refusal: failed(
        'cancelled',
        'The restore was stopped before anything was written, so everything you had is exactly as it was.',
      ),
    };
  }
  return { ok: true, fileName: built.value.fileName };
}

/**
 * What a restore is about to destroy, counted before it does.
 *
 * "This removes 4 projects and 212 artifacts" is what docs/workshop.md asks a restore to be able to
 * say, and it can only be said from the vault as it stands. A summary that only counted additions
 * could not describe the half of the operation that loses data.
 */
function countWhatRestoreRemoves(staging: Staging): void {
  staging.summary.projectsRemoved = listProjects().length;
  staging.summary.artifactsRemoved = listProjects().reduce(
    (total, project) => total + listArtifacts(project.id).length,
    0,
  );
}

/**
 * Put the in-memory view back in step with what was just written.
 *
 * The indexes are rebuilt from the database rather than patched. A merge could be patched record by
 * record; a restore cannot, since every summary in memory may name an artifact that no longer
 * exists — and one rebuild that is right in both cases beats two update paths where the rarer one
 * is the one that silently rots.
 */
async function refreshAfterImport(staging: Staging, replaced: boolean): Promise<void> {
  resetProjectIndex();
  resetArtifactIndex();
  await hydrateProjects();
  await hydrateArtifacts();
  if (replaced) {
    // A restore may have removed the project the workshop had open, and a bench left pointing at
    // artifact ids that no longer exist is the failure docs/workshop.md names. Closing the project
    // is what makes the next thing the user does start from what is actually there.
    setActiveProject(null);
  }
  notifyProjectsChanged({ change: replaced ? 'opened' : 'created', projectId: null });
  for (const summary of staging.contents.artifacts as ArtifactSummary[]) {
    notifyArtifactsChanged({
      change: 'created',
      projectId: summary.projectId,
      artifactId: summary.id,
    });
  }
}
