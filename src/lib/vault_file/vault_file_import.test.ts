import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  acceptedPayload,
  asRecord,
  createArtifactKindRegistry,
  defineArtifactKind,
  registerArtifactKind,
  rejectedPayload,
  type ArtifactKindRegistry,
  type PayloadResult,
} from '$lib/artifact_kinds';
import {
  createArtifact,
  listArtifacts,
  readArtifact,
  resetArtifactIndex,
  type ArtifactSummary,
} from '$lib/artifacts';
import {
  generateCulture,
  getDefaultCultureGenerationConfig,
  toCultureSnapshot,
} from '$lib/culture';
import { createProject, getProject, listProjects, resetProjectIndex } from '$lib/projects';
import { IRONARACHNE_RULESET_REF } from '$lib/rulesets';
import { closeVault, deleteProjectCascade, readVaultId } from '$lib/vault_db';
import { ARTIFACT_KINDS } from '$lib/workshop';
import { readProjectWorkspace, writeProjectWorkspace } from '$lib/workspaces';

import { buildArtifactExportFile, buildProjectExportFile } from './vault_file_export';
import { checksumOf, canonicalJson } from './vault_file_format';
import { importExportFile } from './vault_file_import';
import {
  EXPORT_FORMAT_MARKER,
  EXPORT_FORMAT_VERSION,
  type ExportedArtifact,
} from './vault_file_types';

type NoteSnapshot = { text: string };

const NOTE_KIND = 'test.note';

function validateNote(payload: unknown): PayloadResult<NoteSnapshot> {
  const record = asRecord(payload);
  if (record === null || typeof record.text !== 'string') {
    return rejectedPayload('invalid-payload', 'a note needs a text string');
  }
  return acceptedPayload({ text: record.text });
}

/**
 * A kind on its second payload version, which is what "a file from an older build imports" needs
 * to be a real assertion: version 1 called the field `note` and version 2 calls it `text`. None of
 * the real kinds has a second version yet, and waiting for one is not a test strategy.
 */
const noteKind = defineArtifactKind<NoteSnapshot, NoteSnapshot>({
  kind: NOTE_KIND,
  displayName: 'Note',
  payloadVersion: 2,
  loadCodec: () =>
    Promise.resolve({ toSnapshot: (value) => value, fromSnapshot: (snapshot) => snapshot }),
  nameOf: (snapshot) => snapshot.text,
  validate: validateNote,
  migrate: (payload, from) => {
    if (from !== 1) {
      return rejectedPayload('unsupported-version', `no step from version ${from}`);
    }
    const record = asRecord(payload);
    return validateNote({ text: typeof record?.note === 'string' ? record.note : '' });
  },
});

/**
 * A kind whose validator hands back something IndexedDB cannot store — the only honest way to make
 * a write fail *after* staging has succeeded, which is the case the rollback exists for. A payload
 * that fails validation never reaches a write at all.
 */
const unstorableKind = defineArtifactKind<unknown, unknown>({
  kind: 'test.unstorable',
  displayName: 'Unstorable',
  payloadVersion: 1,
  loadCodec: () =>
    Promise.resolve({ toSnapshot: (value) => value, fromSnapshot: (snapshot) => snapshot }),
  nameOf: () => 'Unstorable',
  validate: (payload) =>
    asRecord(payload) === null
      ? rejectedPayload('invalid-payload', 'not an object')
      : acceptedPayload({ notCloneable: () => 'a function cannot be structured-cloned' }),
  migrate: (_payload, from) =>
    rejectedPayload('unsupported-version', `no step from version ${from}`),
});

function testKinds(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, noteKind);
  registerArtifactKind(registry, unstorableKind);
  return registry;
}

const EXPORTED_AT = Date.parse('2026-08-17T09:30:00.000Z');

beforeEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

async function seedProject(name = 'Aldia'): Promise<string> {
  const created = await createProject({ name, description: 'A place', tags: ['setting'] });
  if (!created.ok) {
    throw new Error('the test project could not be created');
  }
  return created.value.id;
}

async function seedNote(
  projectId: string,
  text: string,
  extras: { references?: ArtifactSummary['references']; id?: string } = {},
): Promise<string> {
  const created = await createArtifact(
    testKinds(),
    {
      projectId,
      kind: NOTE_KIND,
      payload: { text },
      name: text,
      tags: ['note'],
      ...(extras.references === undefined ? {} : { references: extras.references }),
    },
    { id: extras.id, now: EXPORTED_AT, createdAt: EXPORTED_AT - 1000 },
  );
  if (!created.ok) {
    throw new Error(`the test artifact could not be created: ${created.message}`);
  }
  return created.value.id;
}

function exportedArtifact(overrides: Partial<ExportedArtifact> = {}): ExportedArtifact {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: NOTE_KIND,
    name: 'A note',
    tags: [],
    references: [],
    payloadVersion: 2,
    createdAt: 10,
    updatedAt: 20,
    payload: { text: 'hello' },
    ...overrides,
  };
}

/** A hand-built file, for the cases an export cannot produce. Unsigned: a missing checksum is a
 *  state import has to accept, so it is also the cheapest fixture. */
function handBuiltFile(scope: string, body: unknown, overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    format: EXPORT_FORMAT_MARKER,
    formatVersion: EXPORT_FORMAT_VERSION,
    scope,
    exportedAt: '2026-08-17T09:30:00.000Z',
    appVersion: '2.4.0',
    vaultId: 'some-other-browser',
    checksum: '',
    body,
    ...overrides,
  });
}

const handBuiltProject = {
  id: 'project-1',
  name: 'Imported',
  tags: ['setting'],
  createdAt: 100,
  updatedAt: 200,
};

describe('importExportFile: reading the file', () => {
  it('imports a vault file dropped on the project import, because the file says what it is', async () => {
    const file = handBuiltFile('vault', {
      projects: [handBuiltProject],
      artifacts: [exportedArtifact()],
      workspaces: [],
    });
    // No mode, no vault-shaped call: this is the plain "import a file" path, and a user who picked
    // the file they meant should not also have had to press the right button.
    const result = await importExportFile(testKinds(), file, { skipCapacityCheck: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.scope).toBe('vault');
      expect(result.summary.mode).toBe('merge');
      expect(result.summary.artifactsAdded).toBe(1);
    }
    expect(listProjects()).toHaveLength(1);
  });

  it('refuses a truncated file and writes nothing', async () => {
    const file = handBuiltFile('project', { project: handBuiltProject, artifacts: [] });
    const result = await importExportFile(testKinds(), file.slice(0, 60));
    expect(result).toMatchObject({ ok: false, reason: 'damaged' });
    expect(listProjects()).toEqual([]);
  });

  it('refuses a file that is not ours and writes nothing', async () => {
    const result = await importExportFile(testKinds(), '{"hello":"world"}');
    expect(result).toMatchObject({ ok: false, reason: 'not-ours' });
    expect(listProjects()).toEqual([]);
  });

  it('refuses a file from a newer build', async () => {
    const file = handBuiltFile(
      'project',
      { project: handBuiltProject, artifacts: [] },
      { formatVersion: EXPORT_FORMAT_VERSION + 1 },
    );
    expect(await importExportFile(testKinds(), file)).toMatchObject({
      ok: false,
      reason: 'newer-format',
    });
    expect(listProjects()).toEqual([]);
  });

  it('imports an older file through the envelope migration chain', async () => {
    const file = handBuiltFile('project', { legacy: true }, { formatVersion: 0 });
    const result = await importExportFile(testKinds(), file, {
      migrations: [
        {
          from: 0,
          migrate: (envelope) => ({
            ...envelope,
            body: { project: handBuiltProject, artifacts: [exportedArtifact()] },
          }),
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.formatMigrated).toBe(true);
    expect(result.summary.artifactsAdded).toBe(1);
  });

  it('reports a checksum that does not match, and imports anyway', async () => {
    const body = { project: handBuiltProject, artifacts: [exportedArtifact()] };
    const file = handBuiltFile('project', body, { checksum: 'f'.repeat(64) });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.checksum).toBe('mismatch');
      expect(result.summary.artifactsAdded).toBe(1);
    }
  });

  it('recognises a file that came out of this browser', async () => {
    const vaultId = await readVaultId();
    const body = { project: handBuiltProject, artifacts: [] };
    const own = handBuiltFile('project', body, {
      vaultId: vaultId.ok ? vaultId.value : '',
      checksum: await checksumOf(canonicalJson(body)),
    });
    const mine = await importExportFile(testKinds(), own);
    expect(mine.ok && mine.summary.fromThisVault).toBe(true);
    expect(mine.ok && mine.summary.checksum).toBe('ok');

    const theirs = await importExportFile(testKinds(), handBuiltFile('project', body));
    expect(theirs.ok && theirs.summary.fromThisVault).toBe(false);
  });
});

describe('importExportFile: a project', () => {
  it('round-trips a project through a file after storage has been cleared', async () => {
    const projectId = await seedProject();
    const targetId = await seedNote(projectId, 'The Deep');
    const sourceId = await seedNote(projectId, 'The Shore', {
      references: [{ targetId, targetKind: NOTE_KIND, role: 'faces' }],
    });
    await writeProjectWorkspace({
      projectId,
      workspaceVersion: 1,
      panels: [
        { order: 0, artifactId: sourceId },
        { order: 1, toolPath: '/culture' },
      ],
    });
    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok) {
      expect.unreachable('the project should export');
      return;
    }

    await deleteProjectCascade(projectId);
    resetProjectIndex();
    resetArtifactIndex();
    expect(listProjects()).toEqual([]);

    const result = await importExportFile(testKinds(), built.value.text);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary).toMatchObject({
      mode: 'merge',
      scope: 'project',
      projectsAdded: 1,
      artifactsAdded: 2,
      quarantined: [],
      nameCollisions: [],
    });

    const [restored] = listProjects();
    expect(restored.name).toBe('Aldia');
    expect(restored.description).toBe('A place');
    expect(restored.tags).toEqual(['setting']);
    // Timestamps travel: an imported project keeps the day it was started rather than being
    // redated to the day its backup was restored.
    expect(restored.createdAt).toBeGreaterThan(0);

    const artifacts = listArtifacts(restored.id);
    expect(artifacts.map((artifact) => artifact.name).sort()).toEqual(['The Deep', 'The Shore']);
    expect(artifacts.every((artifact) => artifact.createdAt === EXPORTED_AT - 1000)).toBe(true);

    // The reference graph is internally correct: the shore still faces the deep, under the ids
    // the import minted rather than the ones the file carried.
    const shore = artifacts.find((artifact) => artifact.name === 'The Shore');
    const deep = artifacts.find((artifact) => artifact.name === 'The Deep');
    expect(shore?.references).toEqual([
      { targetId: deep?.id, targetKind: NOTE_KIND, role: 'faces' },
    ]);
    expect(shore?.id).not.toBe(sourceId);

    const read = await readArtifact(testKinds(), restored.id, shore?.id ?? '');
    expect(read?.ok && read.artifact.payload).toEqual({ text: 'The Shore' });

    // The bench came back, pointing at the artifact as it was reminted.
    const bench = await readProjectWorkspace(restored.id);
    expect(bench.panels).toEqual([
      { order: 0, artifactId: shore?.id },
      { order: 1, toolPath: '/culture' },
    ]);
  });

  it('adds a second copy rather than writing into the project already there', async () => {
    const projectId = await seedProject();
    const noteId = await seedNote(projectId, 'Only one');
    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok) {
      return;
    }

    const result = await importExportFile(testKinds(), built.value.text);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(listProjects()).toHaveLength(2);
    expect(result.summary.nameCollisions).toEqual(['Aldia']);
    // The original is untouched, and the copy holds an artifact of its own.
    expect(listArtifacts(projectId).map((artifact) => artifact.id)).toEqual([noteId]);
    expect(result.summary.remintedIds[noteId]).toBeDefined();
    expect(result.summary.remintedIds[noteId]).not.toBe(noteId);
  });

  it('keeps both copies when a file uses one id twice, and reports it', async () => {
    const file = handBuiltFile('project', {
      project: handBuiltProject,
      artifacts: [
        exportedArtifact({ id: 'twice', name: 'First' }),
        exportedArtifact({ id: 'twice', name: 'Second' }),
      ],
    });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.duplicateIds).toEqual(['twice']);
    expect(result.summary.artifactsAdded).toBe(2);
    const [imported] = listProjects();
    expect(
      listArtifacts(imported.id)
        .map((artifact) => artifact.name)
        .sort(),
    ).toEqual(['First', 'Second']);
  });

  it('leaves a reference whose target is not in the file dangling rather than guessing', async () => {
    const file = handBuiltFile('project', {
      project: handBuiltProject,
      artifacts: [
        exportedArtifact({
          references: [{ targetId: 'somewhere-else', targetKind: NOTE_KIND, role: 'uses' }],
        }),
      ],
    });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    const [imported] = listProjects();
    expect(listArtifacts(imported.id)[0].references).toEqual([
      { targetId: 'somewhere-else', targetKind: NOTE_KIND, role: 'uses' },
    ]);
  });

  it('migrates a payload written at an older version of its kind', async () => {
    const file = handBuiltFile('project', {
      project: handBuiltProject,
      artifacts: [exportedArtifact({ payloadVersion: 1, payload: { note: 'written long ago' } })],
    });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.artifactsAdded).toBe(1);
    const [imported] = listProjects();
    const [summary] = listArtifacts(imported.id);
    expect(summary.payloadVersion).toBe(2);
    const read = await readArtifact(testKinds(), imported.id, summary.id);
    expect(read?.ok && read.artifact.payload).toEqual({ text: 'written long ago' });
  });

  it('quarantines what it cannot read and imports the rest', async () => {
    const file = handBuiltFile('project', {
      project: handBuiltProject,
      artifacts: [
        exportedArtifact({ id: 'good', name: 'Readable' }),
        exportedArtifact({ id: 'alien', kind: 'kind.from.the.future', name: 'Alien' }),
        exportedArtifact({ id: 'broken', name: 'Broken', payload: { text: 42 } }),
        exportedArtifact({ id: 'ahead', name: 'Ahead', payloadVersion: 99 }),
      ],
    });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.artifactsAdded).toBe(1);
    expect(result.summary.quarantined.map((artifact) => artifact.reason)).toEqual([
      'unknown-kind',
      'invalid-payload',
      'unsupported-version',
    ]);
    // The whole record is kept, not just the reason, so a later build can find it in the file.
    const alien = result.summary.quarantined[0];
    expect(alien).toMatchObject({ id: 'alien', kind: 'kind.from.the.future', name: 'Alien' });
    expect(alien.raw).toMatchObject({ payload: { text: 'hello' } });

    const [imported] = listProjects();
    expect(listArtifacts(imported.id).map((artifact) => artifact.name)).toEqual(['Readable']);
  });

  it('quarantines a record that is not an artifact at all', async () => {
    const file = handBuiltFile('project', {
      project: handBuiltProject,
      artifacts: [exportedArtifact(), { id: 'rubbish' }],
    });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.artifactsAdded).toBe(1);
      expect(result.summary.quarantined).toHaveLength(1);
      expect(result.summary.quarantined[0].id).toBe('rubbish');
    }
  });

  it('undoes the whole import when a write is refused part way through', async () => {
    const file = handBuiltFile('project', {
      project: handBuiltProject,
      artifacts: [
        exportedArtifact({ id: 'fine', name: 'Fine' }),
        exportedArtifact({
          id: 'boom',
          name: 'Boom',
          kind: unstorableKind.kind,
          payloadVersion: 1,
        }),
      ],
    });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/Nothing was imported/);
    }
    // Not one artifact, and not the project either: a half-imported project is worse than a
    // rejected file, because the user cannot tell it happened.
    expect(listProjects()).toEqual([]);
    resetProjectIndex();
    resetArtifactIndex();
    expect(listProjects()).toEqual([]);
  });

  it('imports a project with nothing in it', async () => {
    const file = handBuiltFile('project', { project: handBuiltProject, artifacts: [] });
    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary).toMatchObject({ projectsAdded: 1, artifactsAdded: 0 });
    }
  });
});

describe('importExportFile: what a project is set in', () => {
  it('carries a genre and a system through export and back', async () => {
    const created = await createProject({ name: 'Ashfall', genre: 'horror', system: 'dcc' });
    if (!created.ok) {
      expect.unreachable('the test project should be created');
      return;
    }
    const built = await buildProjectExportFile(created.value.id, { now: EXPORTED_AT });
    if (!built.ok) {
      expect.unreachable('the project should export');
      return;
    }

    await deleteProjectCascade(created.value.id);
    resetProjectIndex();
    resetArtifactIndex();

    const result = await importExportFile(testKinds(), built.value.text);
    expect(result.ok).toBe(true);

    const [restored] = listProjects();
    expect(restored.genre).toBe('horror');
    expect(restored.system).toBe('dcc');
    expect(restored.tags).toEqual(['genre:horror', 'system:dcc']);
  });

  it('round trips optional project and provenance ruleset refs', async () => {
    const file = handBuiltFile('project', {
      project: { ...handBuiltProject, ruleset: IRONARACHNE_RULESET_REF },
      artifacts: [
        exportedArtifact({
          provenance: {
            toolPath: '/culture',
            seed: 'seed-1',
            config: {},
            ruleset: IRONARACHNE_RULESET_REF,
          },
        }),
      ],
    });

    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);
    const [restored] = listProjects();
    expect(restored.ruleset).toEqual(IRONARACHNE_RULESET_REF);
    expect(listArtifacts(restored.id)[0].provenance?.ruleset).toEqual(IRONARACHNE_RULESET_REF);
  });

  it('keeps a project whose genre this build has never heard of', async () => {
    // The file is from a later build with a fifth genre. Rejecting the record would lose the
    // project entirely and drop its artifacts into the recovered bucket, over a field that only
    // decides which tools get listed.
    const file = handBuiltFile('project', {
      project: { ...handBuiltProject, genre: 'weird-west', system: 'pf2e' },
      artifacts: [exportedArtifact({ projectId: 'project-1' })],
    });

    const result = await importExportFile(testKinds(), file);
    expect(result.ok).toBe(true);

    const [restored] = listProjects();
    expect(restored.name).toBe('Imported');
    expect(restored).not.toHaveProperty('genre');
    expect(restored).not.toHaveProperty('system');
    expect(listArtifacts(restored.id)).toHaveLength(1);
  });
});

describe('importExportFile: a single artifact', () => {
  it('puts an artifact into the project that is open', async () => {
    const sourceProjectId = await seedProject('Source');
    const artifactId = await seedNote(sourceProjectId, 'Travelling');
    const built = await buildArtifactExportFile(sourceProjectId, artifactId, { now: EXPORTED_AT });
    if (!built.ok) {
      expect.unreachable('the artifact should export');
      return;
    }
    const targetProjectId = await seedProject('Target');

    const result = await importExportFile(testKinds(), built.value.text, {
      targetProjectId,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary).toMatchObject({ scope: 'artifact', artifactsAdded: 1 });
    const [landed] = listArtifacts(targetProjectId);
    expect(landed.name).toBe('Travelling');
    expect(landed.tags).toEqual(['note']);
    expect(landed.id).not.toBe(artifactId);
    // The artifact it came from is still where it was.
    expect(listArtifacts(sourceProjectId).map((artifact) => artifact.id)).toEqual([artifactId]);
  });

  it('reports an artifact name that is already used in the project it lands in', async () => {
    const projectId = await seedProject();
    const artifactId = await seedNote(projectId, 'Twin');
    const built = await buildArtifactExportFile(projectId, artifactId, { now: EXPORTED_AT });
    if (!built.ok) {
      return;
    }
    const result = await importExportFile(testKinds(), built.value.text, {
      targetProjectId: projectId,
    });
    expect(result.ok && result.summary.nameCollisions).toEqual(['Twin']);
    expect(listArtifacts(projectId)).toHaveLength(2);
  });

  it('refuses an artifact with nowhere to go', async () => {
    const file = handBuiltFile('artifact', { artifact: exportedArtifact() });
    expect(await importExportFile(testKinds(), file)).toMatchObject({
      ok: false,
      reason: 'no-target-project',
    });
    expect(await importExportFile(testKinds(), file, { targetProjectId: 'nobody' })).toMatchObject({
      ok: false,
      reason: 'no-target-project',
    });
  });

  it('quarantines an artifact this build cannot read rather than failing the import', async () => {
    const projectId = await seedProject();
    const file = handBuiltFile('artifact', {
      artifact: exportedArtifact({ kind: 'kind.from.the.future' }),
    });
    const result = await importExportFile(testKinds(), file, { targetProjectId: projectId });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.artifactsAdded).toBe(0);
      expect(result.summary.quarantined[0].reason).toBe('unknown-kind');
    }
    expect(listArtifacts(projectId)).toEqual([]);
  });

  it('reports a write the database refused', async () => {
    const projectId = await seedProject();
    const file = handBuiltFile('artifact', {
      artifact: exportedArtifact({ kind: unstorableKind.kind, payloadVersion: 1 }),
    });
    const result = await importExportFile(testKinds(), file, { targetProjectId: projectId });
    expect(result.ok).toBe(false);
    expect(listArtifacts(projectId)).toEqual([]);
  });
});

describe('importExportFile: a payload a generator actually produced', () => {
  /**
   * The format is only proven by real content. A hand-written fixture proves the importer agrees
   * with whatever the fixture author believed a culture looked like; this one goes through the same
   * `toCultureSnapshot` the save button calls, and comes back through the real kind registry.
   */
  it('round-trips a generated culture', async () => {
    const projectId = await seedProject('Real work');
    const culture = generateCulture('seed-for-the-file', getDefaultCultureGenerationConfig());
    const created = await createArtifact(ARTIFACT_KINDS, {
      projectId,
      kind: 'culture',
      payload: toCultureSnapshot(culture),
    });
    if (!created.ok) {
      throw new Error(`the culture could not be saved: ${created.message}`);
    }

    const built = await buildProjectExportFile(projectId, { now: EXPORTED_AT });
    if (!built.ok) {
      expect.unreachable('the project should export');
      return;
    }
    await deleteProjectCascade(projectId);
    resetProjectIndex();
    resetArtifactIndex();

    const result = await importExportFile(ARTIFACT_KINDS, built.value.text);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.quarantined).toEqual([]);
    const [imported] = listProjects();
    const [summary] = listArtifacts(imported.id);
    expect(summary.name).toBe(created.value.name);
    const read = await readArtifact(ARTIFACT_KINDS, imported.id, summary.id);
    expect(read?.ok).toBe(true);
    if (read?.ok) {
      expect(read.artifact.payload).toEqual(toCultureSnapshot(culture));
    }
    expect(getProject(imported.id)?.name).toBe('Real work');
  });
});
