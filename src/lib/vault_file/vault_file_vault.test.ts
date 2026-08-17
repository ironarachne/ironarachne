/**
 * Whole-vault export and import (#47).
 *
 * The acceptance these cover is not "the functions return the right shape" but "a user's work
 * survives leaving the browser and coming back". So every round trip here goes out through the real
 * export, through a real file, and back through the real import, and the vault is genuinely emptied
 * in between — a test that kept the records in memory would prove nothing about the one operation
 * that matters.
 */

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
  type ArtifactReference,
} from '$lib/artifacts';
import { createProject, listProjects, resetProjectIndex, setActiveProject } from '$lib/projects';
import { readQuarantinedArtifacts } from '$lib/quarantine';
import {
  closeVault,
  readAllArtifactPayloadRecords,
  readAllArtifactRecords,
  readAllProjectRecords,
  readVaultMeta,
  VAULT_META_KEYS,
} from '$lib/vault_db';
import { readProjectWorkspace, writeProjectWorkspace } from '$lib/workspaces';

import { buildVaultExportFile } from './vault_file_export';
import { importExportFile, inspectExportFile } from './vault_file_import';
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

const noteKind = defineArtifactKind<NoteSnapshot, NoteSnapshot>({
  kind: NOTE_KIND,
  displayName: 'Note',
  payloadVersion: 1,
  loadCodec: () =>
    Promise.resolve({ toSnapshot: (value) => value, fromSnapshot: (snapshot) => snapshot }),
  nameOf: (snapshot) => snapshot.text,
  validate: validateNote,
  migrate: (_payload, from) => rejectedPayload('unsupported-version', `no step from ${from}`),
});

/** A second kind, so "a build that has since learned the kind" is a registry rather than a story. */
const laterKind = defineArtifactKind<NoteSnapshot, NoteSnapshot>({
  ...noteKind,
  kind: 'test.later',
  displayName: 'Later',
});

function testKinds(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, noteKind);
  return registry;
}

function laterBuildKinds(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, noteKind);
  registerArtifactKind(registry, laterKind);
  return registry;
}

const NOW = Date.parse('2026-08-17T09:30:00.000Z');

beforeEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('localStorage', memoryStorage());
});

afterEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

/** `setActiveProject` writes a pointer to `localStorage`, which node does not have. */
function memoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  } as Storage;
}

async function seedProject(name: string): Promise<string> {
  const created = await createProject({
    name,
    description: `${name} description`,
    tags: ['seeded'],
  });
  if (!created.ok) {
    throw new Error('the test project could not be created');
  }
  return created.value.id;
}

async function seedNote(
  projectId: string,
  text: string,
  extras: { references?: ArtifactReference[]; kind?: string } = {},
): Promise<string> {
  const created = await createArtifact(
    laterBuildKinds(),
    {
      projectId,
      kind: extras.kind ?? NOTE_KIND,
      payload: { text },
      name: text,
      tags: ['note'],
      provenance: { toolPath: '/culture', seed: `seed-${text}`, config: { depth: 2 } },
      ...(extras.references === undefined ? {} : { references: extras.references }),
    },
    { now: NOW, createdAt: NOW - 5000 },
  );
  if (!created.ok) {
    throw new Error(`the test artifact could not be created: ${created.message}`);
  }
  return created.value.id;
}

/** Everything in the vault, as records. What "byte-identical" is asserted against. */
async function vaultSnapshot() {
  const projects = await readAllProjectRecords();
  const artifacts = await readAllArtifactRecords();
  const payloads = await readAllArtifactPayloadRecords();
  return {
    projects: projects.ok ? projects.value : [],
    artifacts: artifacts.ok ? artifacts.value : [],
    payloads: payloads.ok ? payloads.value : [],
  };
}

/**
 * The shared `IDBObjectStore` prototype, reached through a throwaway database.
 *
 * Patching it is how a write is made to fail part way with the one error that matters —
 * `QuotaExceededError` — without a fake that would only be testing the fake. Reached this way
 * rather than by importing fake-indexeddb's internals, which are untyped and not its public API.
 */
async function objectStorePrototype(): Promise<IDBObjectStore> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('prototype-probe', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('probe');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const prototype = Object.getPrototypeOf(
    database.transaction('probe', 'readonly').objectStore('probe'),
  ) as IDBObjectStore;
  database.close();
  return prototype;
}

/** Clearing site data: a brand new browser store, and nothing left in memory either. */
function clearTheBrowser(): void {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
}

function handBuiltVaultFile(body: unknown, overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    format: EXPORT_FORMAT_MARKER,
    formatVersion: EXPORT_FORMAT_VERSION,
    scope: 'vault',
    exportedAt: '2026-08-17T09:30:00.000Z',
    appVersion: '2.4.0',
    vaultId: 'another-browser',
    checksum: '',
    body,
    ...overrides,
  });
}

function exportedArtifact(overrides: Partial<ExportedArtifact> = {}): ExportedArtifact {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: NOTE_KIND,
    name: 'A note',
    tags: [],
    references: [],
    payloadVersion: 1,
    createdAt: 10,
    updatedAt: 20,
    payload: { text: 'hello' },
    ...overrides,
  };
}

const handBuiltProject = {
  id: 'project-1',
  name: 'From a file',
  tags: [],
  createdAt: 100,
  updatedAt: 200,
};

describe('buildVaultExportFile', () => {
  it('writes every project, artifact, and bench in the vault', async () => {
    const first = await seedProject('Ashfall');
    const second = await seedProject('Dolmenwood');
    const deep = await seedNote(first, 'The Deep');
    await seedNote(first, 'The Shore', {
      references: [{ targetId: deep, targetKind: NOTE_KIND, role: 'faces' }],
    });
    await seedNote(second, 'Elsewhere');
    await writeProjectWorkspace({
      projectId: first,
      workspaceVersion: 1,
      panels: [{ order: 0, artifactId: deep }],
    });

    const built = await buildVaultExportFile({ now: NOW });
    expect(built.ok).toBe(true);
    if (!built.ok || built.value.envelope.scope !== 'vault') {
      expect.unreachable('a vault export should carry a vault body');
      return;
    }
    expect(built.value.fileName).toBe('ironarachne-vault-2026-08-17.json');
    expect(built.value.envelope.body.projects).toHaveLength(2);
    expect(built.value.envelope.body.artifacts).toHaveLength(3);
    expect(built.value.envelope.body.workspaces).toHaveLength(1);
    expect(built.value.issues).toEqual([]);
  });

  it('reports an empty vault as empty rather than as a backup', async () => {
    const built = await buildVaultExportFile({ now: NOW });
    if (!built.ok) {
      expect.unreachable('an empty vault should still export');
      return;
    }
    expect(built.value.issues).toContain('This vault has no projects in it, so the file is empty.');
  });

  it('is byte-identical for two exports of an unchanged vault', async () => {
    const projectId = await seedProject('Ashfall');
    await seedNote(projectId, 'The Deep');
    const first = await buildVaultExportFile({ now: NOW });
    const second = await buildVaultExportFile({ now: NOW });
    expect(first.ok && second.ok && first.value.text === second.value.text).toBe(true);
  });
});

describe('restoring a vault', () => {
  it('survives export, a cleared browser, and import — ids, references, and provenance included', async () => {
    const first = await seedProject('Ashfall');
    const second = await seedProject('Dolmenwood');
    const deep = await seedNote(first, 'The Deep');
    const shore = await seedNote(first, 'The Shore', {
      references: [{ targetId: deep, targetKind: NOTE_KIND, role: 'faces' }],
    });
    await seedNote(second, 'Elsewhere');
    await writeProjectWorkspace({
      projectId: first,
      workspaceVersion: 1,
      panels: [{ order: 0, artifactId: shore }],
    });
    const before = await vaultSnapshot();

    const built = await buildVaultExportFile({ now: NOW });
    if (!built.ok) {
      expect.unreachable('the vault should export');
      return;
    }

    clearTheBrowser();
    expect(listProjects()).toEqual([]);

    const result = await importExportFile(testKinds(), built.value.text, {
      mode: 'restore',
      now: NOW,
      skipCapacityCheck: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary).toMatchObject({
      mode: 'restore',
      scope: 'vault',
      projectsAdded: 2,
      artifactsAdded: 3,
      quarantined: [],
      remintedIds: {},
    });

    // Restore preserves ids, so the vault is the vault it was — not a copy of it.
    const after = await vaultSnapshot();
    expect(after.projects).toEqual(before.projects);
    expect(after.artifacts).toEqual(before.artifacts);
    expect(after.payloads).toEqual(before.payloads);

    expect(
      listProjects()
        .map((project) => project.name)
        .sort(),
    ).toEqual(['Ashfall', 'Dolmenwood']);
    const restoredShore = listArtifacts(first).find((summary) => summary.name === 'The Shore');
    expect(restoredShore?.id).toBe(shore);
    expect(restoredShore?.references).toEqual([
      { targetId: deep, targetKind: NOTE_KIND, role: 'faces' },
    ]);
    expect(restoredShore?.provenance).toEqual({
      toolPath: '/culture',
      seed: 'seed-The Shore',
      config: { depth: 2 },
    });
    expect(restoredShore?.tags).toEqual(['note']);

    const read = await readArtifact(testKinds(), first, deep);
    expect(read?.ok && read.artifact.payload).toEqual({ text: 'The Deep' });
    expect((await readProjectWorkspace(first)).panels).toEqual([{ order: 0, artifactId: shore }]);
  });

  it('replaces what was there, counts it, and backs it up first', async () => {
    const doomed = await seedProject('Doomed');
    await seedNote(doomed, 'Goes away');
    await seedNote(doomed, 'Also goes away');

    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [exportedArtifact()],
      workspaces: [],
    });

    const backups: string[] = [];
    const result = await importExportFile(testKinds(), file, {
      mode: 'restore',
      now: NOW,
      skipCapacityCheck: true,
      onBackup: (backup) => {
        // The backup is built from the vault as it still stands: the undo has to contain what is
        // about to be destroyed, so this has to run before the write.
        expect(backup.envelope.scope).toBe('vault');
        expect(listProjects()).toHaveLength(1);
        backups.push(backup.fileName);
        return true;
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.projectsRemoved).toBe(1);
    expect(result.summary.artifactsRemoved).toBe(2);
    expect(result.summary.backupFileName).toBe(backups[0]);

    expect(listProjects().map((project) => project.name)).toEqual(['From a file']);
    expect(listArtifacts(doomed)).toEqual([]);
  });

  it('does not run when the backup could not be kept', async () => {
    const projectId = await seedProject('Still here');
    await seedNote(projectId, 'Still here too');
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [exportedArtifact()],
      workspaces: [],
    });

    const result = await importExportFile(testKinds(), file, {
      mode: 'restore',
      skipCapacityCheck: true,
      onBackup: () => false,
    });
    expect(result).toMatchObject({ ok: false, reason: 'cancelled' });
    expect(listProjects().map((project) => project.name)).toEqual(['Still here']);
    expect(listArtifacts(projectId)).toHaveLength(1);
  });

  it('stamps the vault as exported, because the file it restored from is a copy on disk', async () => {
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [],
      workspaces: [],
    });
    await importExportFile(testKinds(), file, {
      mode: 'restore',
      now: NOW,
      skipCapacityCheck: true,
    });
    const stamp = await readVaultMeta(VAULT_META_KEYS.lastVaultExportAt);
    expect(stamp.ok && stamp.value).toBe(NOW);
  });

  it('closes the open project, so no panel is left bound to something that has gone', async () => {
    const projectId = await seedProject('Open');
    setActiveProject(projectId);
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [],
      workspaces: [],
    });

    await importExportFile(testKinds(), file, {
      mode: 'restore',
      skipCapacityCheck: true,
    });
    expect(listProjects().map((project) => project.name)).toEqual(['From a file']);
  });

  it('refuses to restore from a file that is not a whole vault', async () => {
    const projectId = await seedProject('Untouched');
    const projectFile = JSON.stringify({
      format: EXPORT_FORMAT_MARKER,
      formatVersion: EXPORT_FORMAT_VERSION,
      scope: 'project',
      exportedAt: '',
      appVersion: '',
      vaultId: '',
      checksum: '',
      body: { project: handBuiltProject, artifacts: [] },
    });
    const result = await importExportFile(testKinds(), projectFile, { mode: 'restore' });
    expect(result).toMatchObject({ ok: false, reason: 'wrong-scope' });
    expect(listProjects().map((project) => project.id)).toEqual([projectId]);
  });

  it('keeps both copies when a file names one id twice', async () => {
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [
        exportedArtifact({ id: 'twice', name: 'First' }),
        exportedArtifact({ id: 'twice', name: 'Second' }),
      ],
      workspaces: [],
    });
    const result = await importExportFile(testKinds(), file, {
      mode: 'restore',
      skipCapacityCheck: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.duplicateIds).toEqual(['twice']);
    expect(listArtifacts(handBuiltProject.id)).toHaveLength(2);
  });
});

describe('merging a vault', () => {
  it('adds every project alongside what is there and never writes into one', async () => {
    const mine = await seedProject('Mine');
    const kept = await seedNote(mine, 'Mine too');
    const before = await vaultSnapshot();

    const file = handBuiltVaultFile({
      projects: [handBuiltProject, { ...handBuiltProject, id: 'project-2', name: 'Second' }],
      artifacts: [
        exportedArtifact({ id: 'a', name: 'One' }),
        exportedArtifact({
          id: 'b',
          name: 'Two',
          references: [{ targetId: 'a', targetKind: NOTE_KIND, role: 'follows' }],
        }),
        exportedArtifact({ id: 'c', projectId: 'project-2', name: 'Three' }),
      ],
      workspaces: [],
    });

    const result = await importExportFile(testKinds(), file, {
      mode: 'merge',
      skipCapacityCheck: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.mode).toBe('merge');
    expect(result.summary.projectsAdded).toBe(2);
    expect(result.summary.artifactsAdded).toBe(3);
    expect(listProjects()).toHaveLength(3);

    // Untouched, to the record.
    const mineAfter = await vaultSnapshot();
    expect(mineAfter.projects).toEqual(expect.arrayContaining(before.projects));
    expect(listArtifacts(mine).map((summary) => summary.id)).toEqual([kept]);

    // Every id is new, and the reference graph came with them.
    expect(Object.keys(result.summary.remintedIds).sort()).toEqual(['a', 'b', 'c']);
    const imported = listProjects().find((project) => project.name === 'From a file');
    const two = listArtifacts(imported?.id ?? '').find((summary) => summary.name === 'Two');
    expect(two?.references[0].targetId).toBe(result.summary.remintedIds.a);
    expect(two?.references[0].targetId).not.toBe('a');
  });

  it('is the default, because the mode that cannot lose anything is the safe default', async () => {
    await seedProject('Mine');
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [],
      workspaces: [],
    });
    const result = await importExportFile(testKinds(), file, { skipCapacityCheck: true });
    expect(result.ok && result.summary.mode).toBe('merge');
    expect(listProjects()).toHaveLength(2);
  });

  it('recognises a file that came from this browser rather than silently duplicating it', async () => {
    const projectId = await seedProject('Ashfall');
    await seedNote(projectId, 'A note');
    const built = await buildVaultExportFile({ now: NOW });
    if (!built.ok) {
      return;
    }

    // Recognised *before* anything is written, which is the only moment an interface can ask.
    const inspection = await inspectExportFile(built.value.text);
    expect(inspection).toMatchObject({
      ok: true,
      scope: 'vault',
      fromThisVault: true,
      projects: 1,
      artifacts: 1,
    });

    const result = await importExportFile(testKinds(), built.value.text, {
      skipCapacityCheck: true,
    });
    expect(result.ok && result.summary.fromThisVault).toBe(true);
  });
});

describe('inspectExportFile', () => {
  it('says what a file is without writing any of it', async () => {
    const projectId = await seedProject('Untouched');
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [exportedArtifact(), exportedArtifact({ id: 'second' })],
      workspaces: [],
    });
    const inspection = await inspectExportFile(file);
    expect(inspection).toMatchObject({
      ok: true,
      scope: 'vault',
      fromThisVault: false,
      projects: 1,
      artifacts: 2,
      appVersion: '2.4.0',
    });
    expect(listArtifacts(projectId)).toEqual([]);
    expect(listProjects()).toHaveLength(1);
  });

  it('counts a project file and an artifact file in the same terms', async () => {
    const header = {
      format: EXPORT_FORMAT_MARKER,
      formatVersion: EXPORT_FORMAT_VERSION,
      exportedAt: '',
      appVersion: '',
      vaultId: '',
      checksum: '',
    };
    const project = await inspectExportFile(
      JSON.stringify({
        ...header,
        scope: 'project',
        body: { project: handBuiltProject, artifacts: [exportedArtifact()] },
      }),
    );
    expect(project).toMatchObject({ ok: true, scope: 'project', projects: 1, artifacts: 1 });

    const artifact = await inspectExportFile(
      JSON.stringify({ ...header, scope: 'artifact', body: { artifact: exportedArtifact() } }),
    );
    expect(artifact).toMatchObject({ ok: true, scope: 'artifact', projects: 0, artifacts: 1 });
  });

  it('reports why a file cannot be read, in the same words the import would use', async () => {
    expect(await inspectExportFile('not json at all')).toMatchObject({
      ok: false,
      reason: 'damaged',
    });
  });
});

describe('what an import cannot read', () => {
  it('quarantines an unknown kind, keeps it visible, and lets it survive a later export', async () => {
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [
        exportedArtifact({ id: 'known', name: 'Readable' }),
        exportedArtifact({ id: 'alien', kind: 'test.later', name: 'Alien' }),
      ],
      workspaces: [],
    });

    const imported = await importExportFile(testKinds(), file, { skipCapacityCheck: true });
    expect(imported.ok).toBe(true);
    if (!imported.ok) {
      return;
    }
    expect(imported.summary.artifactsAdded).toBe(1);
    expect(imported.summary.quarantined).toHaveLength(1);
    expect(imported.summary.quarantined[0]).toMatchObject({ kind: 'test.later', name: 'Alien' });

    // Visible: it is in the vault, listed, and marked unreadable.
    const held = await readQuarantinedArtifacts();
    expect(held.ok && held.value).toHaveLength(1);
    expect(held.ok && held.value[0].reason).toBe('unknown-kind');

    // And it survives a subsequent export, which is the whole promise being made.
    const reexported = await buildVaultExportFile({ now: NOW });
    if (!reexported.ok || reexported.value.envelope.scope !== 'vault') {
      expect.unreachable('the vault should export');
      return;
    }
    expect(
      reexported.value.envelope.body.artifacts.some((artifact) => artifact.name === 'Alien'),
    ).toBe(true);

    // A later build that has the kind reads it as an ordinary artifact.
    clearTheBrowser();
    const later = await importExportFile(laterBuildKinds(), reexported.value.text, {
      mode: 'restore',
      skipCapacityCheck: true,
    });
    expect(later.ok && later.summary.quarantined).toEqual([]);
    expect(later.ok && later.summary.artifactsAdded).toBe(2);
  });

  it('gathers artifacts whose project is missing rather than dropping them', async () => {
    const file = handBuiltVaultFile({
      projects: [],
      artifacts: [exportedArtifact({ projectId: 'a-project-that-is-not-here' })],
      workspaces: [],
    });
    const result = await importExportFile(testKinds(), file, { skipCapacityCheck: true });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.summary.recoveredProjectId).toBeDefined();
    const recovered = listProjects().find(
      (project) => project.id === result.summary.recoveredProjectId,
    );
    expect(recovered?.name).toBe('Recovered artifacts');
    expect(listArtifacts(recovered?.id ?? '')).toHaveLength(1);
  });

  it('reports a vault with no projects as empty', async () => {
    const file = handBuiltVaultFile({ projects: [], artifacts: [], workspaces: [] });
    const result = await importExportFile(testKinds(), file, { skipCapacityCheck: true });
    expect(result.ok && result.summary.empty).toBe(true);
  });

  it('writes nothing at all when the file is damaged', async () => {
    const projectId = await seedProject('Untouched');
    const before = await vaultSnapshot();
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [],
      workspaces: [],
    });

    expect(await importExportFile(testKinds(), file.slice(0, 80))).toMatchObject({
      ok: false,
      reason: 'damaged',
    });
    expect(await vaultSnapshot()).toEqual(before);
    expect(listProjects().map((project) => project.id)).toEqual([projectId]);
  });
});

describe('when the write cannot finish', () => {
  it('leaves storage exactly as it was when the browser runs out of room part way', async () => {
    const projectId = await seedProject('Precious');
    await seedNote(projectId, 'Precious note');
    const before = await vaultSnapshot();

    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [
        exportedArtifact({ id: 'one', name: 'One' }),
        exportedArtifact({ id: 'two', name: 'Two' }),
        exportedArtifact({ id: 'three', name: 'Three' }),
      ],
      workspaces: [],
    });

    // The browser accepts the first few records of the transaction and then refuses. This is the
    // case the single transaction exists for: IndexedDB unwinds every put in an aborted one, so
    // there is no half-written vault to recover from and no rollback of our own to get wrong.
    const prototype = await objectStorePrototype();
    const put = prototype.put;
    let accepted = 0;
    prototype.put = function patched(this: IDBObjectStore, ...args: [unknown, IDBValidKey?]) {
      accepted += 1;
      if (accepted > 2) {
        throw new DOMException('the quota has been exceeded', 'QuotaExceededError');
      }
      return put.apply(this, args);
    };

    try {
      const result = await importExportFile(testKinds(), file, {
        mode: 'merge',
        skipCapacityCheck: true,
      });
      expect(result).toMatchObject({ ok: false, reason: 'quota-exceeded' });
      if (!result.ok) {
        expect(result.message).toMatch(/none of it was written/);
      }
    } finally {
      prototype.put = put;
    }

    expect(await vaultSnapshot()).toEqual(before);
  });

  it('refuses up front when the import will not fit', async () => {
    const projectId = await seedProject('Untouched');
    vi.stubGlobal('navigator', {
      storage: { estimate: () => Promise.resolve({ usage: 1000, quota: 1100 }) },
    });

    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [exportedArtifact({ payload: { text: 'x'.repeat(5000) } })],
      workspaces: [],
    });
    const result = await importExportFile(testKinds(), file);
    expect(result).toMatchObject({ ok: false, reason: 'too-large' });
    if (!result.ok) {
      expect(result.message).toMatch(/Nothing was changed/);
    }
    expect(listProjects().map((project) => project.id)).toEqual([projectId]);
  });

  it('stops before the commit when it is cancelled', async () => {
    const before = await vaultSnapshot();
    const controller = new AbortController();
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [exportedArtifact({ id: 'one' }), exportedArtifact({ id: 'two' })],
      workspaces: [],
    });

    const result = await importExportFile(testKinds(), file, {
      skipCapacityCheck: true,
      onProgress: (progress) => {
        if (progress.stage === 'staging') {
          controller.abort();
        }
      },
      signal: controller.signal,
    });
    expect(result).toMatchObject({ ok: false, reason: 'cancelled' });
    expect(await vaultSnapshot()).toEqual(before);
  });

  it('reports progress through staging and the write', async () => {
    const stages: string[] = [];
    const file = handBuiltVaultFile({
      projects: [handBuiltProject],
      artifacts: [exportedArtifact()],
      workspaces: [],
    });
    await importExportFile(testKinds(), file, {
      skipCapacityCheck: true,
      onProgress: (progress) => stages.push(progress.stage),
    });
    expect(stages[0]).toBe('reading');
    expect(stages).toContain('staging');
    expect(stages).toContain('writing');
  });
});
