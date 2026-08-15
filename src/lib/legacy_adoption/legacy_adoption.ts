import { readArtifactPayloadForKind, type ArtifactKindRegistry } from '$lib/artifact_kinds';
import { createArtifact } from '$lib/artifacts';
import { createProject, getProject, hydrateProjects } from '$lib/projects';
import type { VaultResult } from '$lib/vault_db';

import { readLegacyAdoptionRecord, writeLegacyAdoptionRecord } from './legacy_adoption_saved_state';
import {
  LEGACY_ADOPTION_PAYLOAD_VERSION,
  type LegacyAdoptionNotice,
  type LegacyAdoptionOptions,
  type LegacyAdoptionRecord,
  type LegacyAdoptionResult,
  type LegacySaveScope,
  type LegacyScopeContents,
} from './legacy_adoption_types';
import { legacyItemIdentity, legacyItemKey, readLegacyScopes } from './legacy_saves';

/** What the project adoption creates is called. Honest, and the user renames it if they like. */
export const ADOPTION_PROJECT_NAME = 'My Setting';

/** Why that project exists, said in the project itself rather than only in a note that goes away. */
export const ADOPTION_PROJECT_DESCRIPTION =
  'Holds the coats of arms, cultures, and religions you saved before projects existed.';

type AdoptionRun = {
  registry: ArtifactKindRegistry;
  now: number;
  projectName: string;
  /** Resolved lazily: nothing to adopt must not leave a project nobody asked for. */
  projectId: string | null;
  adoptedKeys: Set<string>;
  previousNotice: LegacyAdoptionNotice | null;
  result: LegacyAdoptionResult;
};

function currentRecord(
  run: AdoptionRun,
  notice: LegacyAdoptionNotice | null,
): LegacyAdoptionRecord {
  return {
    payloadVersion: LEGACY_ADOPTION_PAYLOAD_VERSION,
    projectId: run.projectId,
    adoptedKeys: [...run.adoptedKeys],
    notice,
  };
}

/**
 * The project legacy work goes into: the one a previous run used if it is still there, and a new
 * one otherwise.
 *
 * A run never adopts into whichever project happens to be lying around. Legacy saves are a pile of
 * unrelated items with no shared setting behind them, and tipping them into a project a user has
 * curated is not something they can undo item by item.
 *
 * It does not open the project either. `createProject` deliberately leaves that to the caller, and
 * a migration running on page load is precisely the case that must not move the workshop out from
 * under someone.
 */
async function adoptionProjectId(run: AdoptionRun): Promise<VaultResult<string>> {
  if (run.projectId !== null) {
    return { ok: true, value: run.projectId };
  }
  const created = await createProject(
    { name: run.projectName, description: ADOPTION_PROJECT_DESCRIPTION },
    { now: run.now },
  );
  if (!created.ok) {
    return created;
  }
  run.projectId = created.value.id;
  run.result.projectCreated = true;
  return { ok: true, value: created.value.id };
}

/**
 * The identity of every item in a scope, paired with how many items before it shared that
 * identity.
 *
 * Computed over the stored array rather than over the items that turn out to be adoptable, so an
 * item's ordinal does not move when a build starts or stops accepting one of its neighbours. That
 * is what lets a later build adopt something this one skipped without renumbering what is already
 * recorded.
 */
function identifyLegacyItems(scope: LegacySaveScope, items: unknown[]): (string | null)[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const identity = legacyItemIdentity(scope, item);
    if (identity === null) {
      return null;
    }
    const ordinal = seen.get(identity) ?? 0;
    seen.set(identity, ordinal + 1);
    return legacyItemKey(scope, identity, ordinal);
  });
}

/**
 * Turn one legacy snapshot into an artifact.
 *
 * The snapshot goes through the kind registry's read path — the same one storage and import use —
 * rather than a conversion written for adoption. That is what makes a version 1 coat of arms
 * become a version 2 payload here for the same reason and by the same code it would anywhere
 * else, and it is why a kind that cannot read one of these reports why instead of throwing.
 *
 * No provenance. The legacy scopes record no origin for an item, and #34 settles that an invented
 * one is worse than none: provenance is what a re-roll button acts on, and a seed that did not
 * produce this payload would quietly replace the user's work with something else.
 *
 * No name either — `createArtifact` falls back to the kind's own `nameOf`, which is the same
 * function that names a freshly generated one. Passing a name lifted out of the snapshot here
 * would be a second, drifting copy of that rule.
 */
async function adoptLegacyItem(
  run: AdoptionRun,
  contents: LegacyScopeContents,
  item: unknown,
  key: string,
): Promise<void> {
  const { scope } = contents;
  const payload = readArtifactPayloadForKind(
    run.registry,
    scope.kind,
    item,
    contents.payloadVersion,
  );
  if (!payload.ok) {
    run.result.skipped.push({
      scopeId: scope.scopeId,
      kind: scope.kind,
      identity: legacyItemIdentity(scope, item),
      reason: payload.reason,
      message: payload.message,
    });
    return;
  }

  const project = await adoptionProjectId(run);
  if (!project.ok) {
    run.result.skipped.push({
      scopeId: scope.scopeId,
      kind: scope.kind,
      identity: legacyItemIdentity(scope, item),
      reason: project.reason,
      message: project.message,
    });
    return;
  }

  const created = await createArtifact(
    run.registry,
    { projectId: project.value, kind: scope.kind, payload: payload.value },
    { now: run.now, createdAt: run.now },
  );
  if (!created.ok) {
    run.result.skipped.push({
      scopeId: scope.scopeId,
      kind: scope.kind,
      identity: legacyItemIdentity(scope, item),
      reason: created.reason,
      message: created.message,
    });
    return;
  }

  run.adoptedKeys.add(key);
  run.result.adopted.push({
    scopeId: scope.scopeId,
    kind: scope.kind,
    artifactId: created.value.id,
    name: created.value.name,
  });
  // Written per item, not per run. A refused write or a closed tab part-way through then leaves a
  // record of exactly what was adopted, and the next run resumes rather than starting over — which
  // is the interruption a flag written at the end would turn into duplicates.
  writeLegacyAdoptionRecord(currentRecord(run, run.previousNotice));
}

async function adoptLegacyScope(run: AdoptionRun, contents: LegacyScopeContents): Promise<void> {
  if (contents.status === 'unreadable') {
    run.result.unreadableScopeIds.push(contents.scope.scopeId);
    return;
  }

  const keys = identifyLegacyItems(contents.scope, contents.items);
  // One item at a time, in order. Two writes racing would both see the same missing project and
  // create one apiece, and the adoption record is rewritten after every item.
  for (const [index, item] of contents.items.entries()) {
    const key = keys[index];
    if (key === null) {
      run.result.skipped.push({
        scopeId: contents.scope.scopeId,
        kind: contents.scope.kind,
        identity: null,
        reason: 'invalid-payload',
        message: `a saved ${contents.scope.kind} has no ${contents.scope.identityField} to identify it by`,
      });
      continue;
    }
    if (run.adoptedKeys.has(key)) {
      run.result.alreadyAdopted += 1;
      continue;
    }
    await adoptLegacyItem(run, contents, item, key);
  }
}

/**
 * Fold an adoption run into whatever the user has not read yet, rather than replacing it. Two runs
 * before someone opens the workshop is one message about both, not the second one silently
 * standing in for the first.
 */
function noticeAfterRun(run: AdoptionRun, projectId: string): LegacyAdoptionNotice {
  const previous = run.previousNotice?.projectId === projectId ? run.previousNotice : null;
  return {
    projectId,
    adoptedCount: (previous?.adoptedCount ?? 0) + run.result.adopted.length,
    skippedCount: (previous?.skippedCount ?? 0) + run.result.skipped.length,
    at: run.now,
  };
}

/** The run in flight, so two callers on one page load share it rather than racing. */
let running: Promise<LegacyAdoptionResult> | null = null;

/**
 * Adopt every legacy per-generator save into a project, skipping anything a previous run already
 * took.
 *
 * Safe to call on every page load, and meant to be: it reads three storage entries and the
 * adoption record, and does nothing else when there is nothing new. A browser that never used the
 * old save buttons gets no project, no record, and no writes at all.
 *
 * **Two callers on one page load get one run.** The root layout calls this and so does the project
 * bar, and now that a write is asynchronous both would otherwise read the same empty adoption
 * record, create a project apiece, and adopt everything twice. The record makes a *later* run a
 * no-op; it cannot make a concurrent one a no-op, because it is not written until the first item
 * has been stored. Whoever asks second waits on the first run and is handed its result.
 *
 * **The legacy scopes are not touched.** Nothing is deleted, and nothing is rewritten — not even
 * the entries this adopts. They are small, they are the only fallback if this has a bug, and
 * `/saved-data` still reads them until #44 retires it.
 */
export function adoptLegacySaves(
  registry: ArtifactKindRegistry,
  options: LegacyAdoptionOptions = {},
): Promise<LegacyAdoptionResult> {
  running ??= runLegacyAdoption(registry, options).finally(() => {
    running = null;
  });
  return running;
}

async function runLegacyAdoption(
  registry: ArtifactKindRegistry,
  options: LegacyAdoptionOptions,
): Promise<LegacyAdoptionResult> {
  // The project set has to be in memory before a previous run's project can be looked up, and
  // before creating one would be the second project named "My Setting" this browser has.
  await hydrateProjects();
  const record = readLegacyAdoptionRecord();
  const existingProject = record.projectId === null ? undefined : getProject(record.projectId);
  const run: AdoptionRun = {
    registry,
    now: options.now ?? Date.now(),
    projectName: options.projectName ?? ADOPTION_PROJECT_NAME,
    projectId: existingProject?.id ?? null,
    adoptedKeys: new Set(record.adoptedKeys),
    previousNotice: record.notice,
    result: {
      projectId: null,
      projectCreated: false,
      adopted: [],
      skipped: [],
      alreadyAdopted: 0,
      unreadableScopeIds: [],
    },
  };

  for (const contents of readLegacyScopes()) {
    await adoptLegacyScope(run, contents);
  }

  run.result.projectId = run.projectId;
  // Only a run that adopted something leaves a note, and skipped items are counted in that note
  // rather than raising one of their own. A skip records no key, so it is retried on every load —
  // a note for it would come back after every dismissal, which is a nag rather than information.
  // The caller has the full `skipped` list either way.
  if (run.result.adopted.length > 0 && run.projectId !== null) {
    writeLegacyAdoptionRecord(currentRecord(run, noticeAfterRun(run, run.projectId)));
  }
  return run.result;
}

/** What the user has not been told about yet, or null when there is nothing outstanding. */
export function legacyAdoptionNotice(): LegacyAdoptionNotice | null {
  return readLegacyAdoptionRecord().notice;
}

/**
 * Mark the note as read. Only the note is cleared — the adopted keys stay, because they are what
 * stops the next run adopting everything a second time.
 */
export function acknowledgeLegacyAdoptionNotice(): void {
  const record = readLegacyAdoptionRecord();
  if (record.notice === null) {
    return;
  }
  writeLegacyAdoptionRecord({ ...record, notice: null });
}
