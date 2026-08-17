import { readArtifactPayloadForKind, type ArtifactKindRegistry } from '$lib/artifact_kinds';
import {
  createArtifact,
  hydrateArtifacts,
  listArtifacts,
  newArtifactId,
  type ArtifactDraft,
  type ArtifactReference,
} from '$lib/artifacts';
import {
  createProject,
  deleteProject,
  getProject,
  hydrateProjects,
  listProjects,
  newProjectId,
} from '$lib/projects';
import { readVaultId } from '$lib/vault_db';
import { writeProjectWorkspace, type PanelState, type ProjectWorkspace } from '$lib/workspaces';

import { parseExportFile } from './vault_file_format';
import type {
  ExportedArtifact,
  ExportFormatMigration,
  ImportFailureReason,
  ImportResult,
  ImportSummary,
  ProjectBody,
  QuarantinedArtifact,
} from './vault_file_types';

export type ImportExportFileOptions = {
  /**
   * Where a single artifact lands. Required at artifact scope and ignored at project scope, which
   * always creates a project of its own.
   */
  targetProjectId?: string;
  migrations?: ExportFormatMigration[];
  /** Id minting, injectable so a test can assert the reference graph by name rather than by luck. */
  newProjectId?: () => string;
  newArtifactId?: () => string;
};

function failed(reason: ImportFailureReason, message: string): ImportResult {
  return { ok: false, reason, message };
}

/**
 * Read a file and write what is in it, or say why nothing was written.
 *
 * **Every entry point accepts every scope.** The file declares what it is, so this dispatches on
 * `scope` rather than assuming the one the button was labelled with — and a whole-vault file is
 * refused *by name*, never misread as a project. Vault import is #47.
 *
 * **Nothing is written until everything has been read.** The file is parsed, its payloads are
 * migrated through their kinds, and the whole result is staged in memory before the first write.
 * A file that fails validation at artifact 900 of 1000 leaves storage exactly as it was, because
 * validation finished long before storage was touched. A write that fails part way is undone —
 * see {@link commitProjectImport}.
 */
export async function importExportFile(
  registry: ArtifactKindRegistry,
  text: string,
  options: ImportExportFileOptions = {},
): Promise<ImportResult> {
  const parsed = await parseExportFile(text, { migrations: options.migrations });
  if (!parsed.ok) {
    return failed(parsed.problem, parsed.message);
  }

  const { envelope } = parsed;
  // Refused before anything else is done, so a file this build cannot use costs no reads and no
  // writes — `readVaultId` below mints an id when the vault has none, and a refusal should not be
  // the thing that creates one.
  if (envelope.scope === 'vault') {
    return failed(
      'unsupported-scope',
      'This is a whole-vault backup, not a project file. Importing a whole vault is not in this build yet; nothing was changed.',
    );
  }

  const base = {
    mode: 'merge' as const,
    scope: envelope.scope,
    projectsAdded: 0,
    artifactsAdded: 0,
    projectsRemoved: 0,
    artifactsRemoved: 0,
    nameCollisions: [] as string[],
    remintedIds: {} as Record<string, string>,
    quarantined: [...parsed.quarantined],
    duplicateIds: [] as string[],
    fromThisVault: await isFromThisVault(envelope.vaultId),
    checksum: parsed.checksum,
    formatMigrated: parsed.formatMigrated,
  };

  if (envelope.scope === 'project') {
    return importProject(registry, envelope.body, base, options);
  }
  return importArtifact(registry, envelope.body.artifact, base, options);
}

/**
 * Whether the file came out of this browser's own vault.
 *
 * A hint and nothing more in this build: it is what lets an import say "this is your own backup"
 * rather than leaving the user to work out whether they are restoring or duplicating. #47 is where
 * it steers the choice between Restore and Merge.
 */
async function isFromThisVault(vaultId: string): Promise<boolean> {
  if (vaultId === '') {
    return false;
  }
  const stored = await readVaultId();
  return stored.ok && stored.value === vaultId;
}

type SummaryBase = Omit<ImportSummary, 'backupFileName'>;

type StagedArtifact = {
  id: string;
  draft: ArtifactDraft;
  createdAt: number;
  updatedAt: number;
};

/**
 * The ids an import minted: one per artifact in file order, and the old-to-new map the reference
 * graph is rewritten through. They differ only when a file names one id twice.
 */
type MintedIds = {
  idMap: Map<string, string>;
  ids: string[];
};

/**
 * Turn the file's artifacts into things this build can store, quarantining the ones it cannot.
 *
 * The payload goes through the kind registry's read path — the same one storage and legacy
 * adoption use — so an artifact written by an older build is migrated here for the same reason and
 * by the same code it would be anywhere else. A kind this build has never heard of, a payload that
 * fails its validator, and a migration that gives up are all quarantined rather than dropped and
 * rather than fatal: a backup with one unreadable record in it is still two hundred records the
 * user wants back.
 */
function stageArtifacts(
  registry: ArtifactKindRegistry,
  artifacts: ExportedArtifact[],
  projectId: string,
  minted: MintedIds,
  summary: SummaryBase,
): StagedArtifact[] {
  const staged: StagedArtifact[] = [];
  for (const [index, artifact] of artifacts.entries()) {
    const payload = readArtifactPayloadForKind(
      registry,
      artifact.kind,
      artifact.payload,
      artifact.payloadVersion,
    );
    if (!payload.ok) {
      summary.quarantined.push(quarantine(artifact, payload.reason, payload.message));
      continue;
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
    staged.push({
      id: minted.ids[index],
      draft,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    });
  }
  return staged;
}

function quarantine(
  artifact: ExportedArtifact,
  reason: QuarantinedArtifact['reason'],
  message: string,
): QuarantinedArtifact {
  return {
    id: artifact.id,
    projectId: artifact.projectId,
    kind: artifact.kind,
    name: artifact.name,
    raw: artifact,
    reason,
    message,
  };
}

/**
 * Mint a new id for every artifact in the file, and record the old-to-new map.
 *
 * **Every id, unconditionally.** The obvious case is a user importing a backup taken from this
 * browser, where every id in the file is already in use; keeping ids where they happen to be free
 * and reminting only on collision would make the rule depend on what else the user has, which is
 * the kind of conditional identity that corrupts a reference graph in exactly the cases nobody
 * tests. Restore preserves ids because it has nothing to collide with — that is #47.
 *
 * An id the file uses twice means the file is internally inconsistent. Both copies are kept, each
 * under an id of its own, and the fact is reported: we do not know which one the user meant. The
 * map keeps pointing at the first, so a reference to that id resolves somewhere rather than
 * nowhere — which is why the per-artifact ids and the reference map are two different answers and
 * not one.
 */
function mintArtifactIds(
  artifacts: ExportedArtifact[],
  summary: SummaryBase,
  mint: () => string,
): MintedIds {
  const idMap = new Map<string, string>();
  const ids = artifacts.map((artifact) => {
    const minted = mint();
    if (idMap.has(artifact.id)) {
      summary.duplicateIds.push(artifact.id);
      return minted;
    }
    idMap.set(artifact.id, minted);
    summary.remintedIds[artifact.id] = minted;
    return minted;
  });
  return { idMap, ids };
}

/**
 * Point a reference at wherever its target ended up.
 *
 * A reference whose target is not in the file keeps the id it had, which will not resolve. That is
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

async function importProject(
  registry: ArtifactKindRegistry,
  body: ProjectBody,
  summary: SummaryBase,
  options: ImportExportFileOptions,
): Promise<ImportResult> {
  await hydrateProjects();
  await hydrateArtifacts();

  const projectId = (options.newProjectId ?? newProjectId)();
  const minted = mintArtifactIds(body.artifacts, summary, options.newArtifactId ?? newArtifactId);
  const staged = stageArtifacts(registry, body.artifacts, projectId, minted, summary);
  for (const artifact of staged) {
    artifact.draft.references = rewriteReferences(artifact.draft.references ?? [], minted.idMap);
  }

  // Two projects with the same name is fine and expected — names were never unique — so this is
  // reported rather than resolved. Renaming one is the user's call, and doing it for them would
  // rewrite something they wrote.
  if (listProjects().some((project) => project.name === body.project.name)) {
    summary.nameCollisions.push(body.project.name);
  }

  return commitProjectImport(registry, projectId, body, staged, minted.idMap, summary);
}

/**
 * Write the staged project, and undo the whole thing if any part of it is refused.
 *
 * Deleting the project is what rolls back, and it is exact: the project owns its artifacts and its
 * bench, and `deleteProject` cascades to both in one transaction. A half-imported project is worse
 * than a rejected file because the user cannot tell it happened — they see a project with a
 * plausible name and no way to know that a third of it is missing.
 */
async function commitProjectImport(
  registry: ArtifactKindRegistry,
  projectId: string,
  body: ProjectBody,
  staged: StagedArtifact[],
  idMap: Map<string, string>,
  summary: SummaryBase,
): Promise<ImportResult> {
  const created = await createProject(
    {
      name: body.project.name,
      ...(body.project.description === undefined ? {} : { description: body.project.description }),
      tags: body.project.tags,
    },
    { id: projectId, now: body.project.updatedAt, createdAt: body.project.createdAt },
  );
  if (!created.ok) {
    return failed(created.reason, created.message);
  }
  summary.projectsAdded = 1;
  summary.projectId = projectId;

  for (const artifact of staged) {
    const written = await createArtifact(registry, artifact.draft, {
      id: artifact.id,
      now: artifact.updatedAt,
      createdAt: artifact.createdAt,
    });
    if (!written.ok) {
      await deleteProject(projectId);
      return failed(
        written.reason,
        `${written.message}. Nothing was imported — the part that had been written was removed.`,
      );
    }
    summary.artifactsAdded += 1;
  }

  await restoreWorkspace(projectId, body.workspace, idMap);
  return { ok: true, summary };
}

/**
 * Put the bench back, pointing at the artifacts as they were reminted.
 *
 * Not awaited for its result, and a failure here is not a failure of the import: a bench is not
 * work (decision 3 in docs/workshop.md), and losing a panel arrangement costs a click where losing
 * the import would cost the user their file. Panels naming artifacts that were quarantined are
 * dropped, because a panel bound to nothing is worse than one panel fewer.
 */
async function restoreWorkspace(
  projectId: string,
  workspace: ProjectWorkspace | undefined,
  idMap: Map<string, string>,
): Promise<void> {
  if (workspace === undefined) {
    return;
  }
  const panels: PanelState[] = [];
  for (const panel of workspace.panels) {
    if (panel.toolPath !== undefined) {
      panels.push(panel);
      continue;
    }
    const minted = idMap.get(panel.artifactId);
    if (minted !== undefined) {
      panels.push({ order: panel.order, artifactId: minted });
    }
  }
  if (panels.length > 0) {
    await writeProjectWorkspace({ ...workspace, projectId, panels });
  }
}

/**
 * Put one artifact into the project the user has open.
 *
 * It is reminted like anything else, so importing the same culture twice gives two cultures rather
 * than one overwriting the other. Its references keep the ids they had and will not resolve, which
 * is the honest outcome of moving one artifact out of the project that gave its links meaning.
 */
async function importArtifact(
  registry: ArtifactKindRegistry,
  artifact: ExportedArtifact,
  summary: SummaryBase,
  options: ImportExportFileOptions,
): Promise<ImportResult> {
  const targetProjectId = options.targetProjectId;
  if (targetProjectId === undefined || targetProjectId === '') {
    return failed(
      'no-target-project',
      'Open a project first: a single artifact needs somewhere to go.',
    );
  }
  await hydrateProjects();
  if (getProject(targetProjectId) === undefined) {
    return failed('no-target-project', `no project has the id "${targetProjectId}"`);
  }
  await hydrateArtifacts();

  const minted = mintArtifactIds([artifact], summary, options.newArtifactId ?? newArtifactId);
  const staged = stageArtifacts(registry, [artifact], targetProjectId, minted, summary);
  if (staged.length === 0) {
    // Quarantined on the way in. Nothing was written, and the summary says what and why.
    return { ok: true, summary };
  }

  if (
    listArtifacts(targetProjectId).some(
      (summaryInProject) => summaryInProject.name === artifact.name,
    )
  ) {
    summary.nameCollisions.push(artifact.name);
  }

  const [only] = staged;
  const written = await createArtifact(registry, only.draft, {
    id: only.id,
    now: only.updatedAt,
    createdAt: only.createdAt,
  });
  if (!written.ok) {
    return failed(written.reason, written.message);
  }
  summary.artifactsAdded = 1;
  summary.projectId = targetProjectId;
  return { ok: true, summary };
}
