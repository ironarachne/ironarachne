import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SAVE_STORAGE_PREFIX } from '$lib/persistent_save';

import {
  closeVault,
  deleteArtifactRecord,
  deleteProjectCascade,
  deleteVaultDatabase,
  deleteWorkspaceRecord,
  readAllArtifactRecords,
  readAllProjectRecords,
  readArtifactPayloadRecord,
  readVaultId,
  readVaultMeta,
  readWorkspaceRecord,
  writeArtifactRecord,
  writeArtifactSummaryRecord,
  writeProjectRecord,
  writeVaultMeta,
  writeWorkspaceRecord,
} from './vault_db';
import { VAULT_DATABASE_NAME, VAULT_SCHEMA_VERSION, VAULT_STORES } from './vault_db_schema';
import { VAULT_META_KEYS, type VaultResult } from './vault_db_types';

const local = new Map<string, string>();

function stubLocalStorage(): void {
  vi.stubGlobal('localStorage', {
    get length() {
      return local.size;
    },
    key: (i: number) => [...local.keys()][i] ?? null,
    getItem: (key: string) => local.get(key) ?? null,
    setItem: (key: string, value: string) => {
      local.set(key, value);
    },
    removeItem: (key: string) => {
      local.delete(key);
    },
  });
}

function storeLegacy(scopeId: string, value: unknown): void {
  local.set(`${SAVE_STORAGE_PREFIX}${scopeId}`, JSON.stringify(value));
}

/** Unwraps a result, failing the test rather than an assertion when the database refused. */
function value<T>(result: VaultResult<T>): T {
  if (!result.ok) {
    throw new Error(`expected the vault to answer, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

function summary(overrides: Record<string, unknown> = {}) {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: 'note',
    name: 'Ashfall',
    payloadVersion: 1,
    byteSize: 20,
    ...overrides,
  };
}

beforeEach(() => {
  local.clear();
  closeVault();
  vi.stubGlobal('indexedDB', new IDBFactory());
  stubLocalStorage();
});

afterEach(() => {
  closeVault();
  vi.unstubAllGlobals();
});

describe('the schema', () => {
  it('creates all five stores, the by_projectId index, and records its version', async () => {
    // Any operation opens the database, which is what runs the upgrade transaction.
    await writeProjectRecord({ id: 'project-1' });

    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(VAULT_DATABASE_NAME, VAULT_SCHEMA_VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    expect([...database.objectStoreNames].sort()).toEqual(
      VAULT_STORES.map((store) => store.name).sort(),
    );
    const artifacts = database.transaction('artifacts').objectStore('artifacts');
    expect([...artifacts.indexNames]).toEqual(['by_projectId']);
    expect(artifacts.keyPath).toBe('id');
    database.close();

    expect(value(await readVaultMeta(VAULT_META_KEYS.schemaVersion))).toBe(VAULT_SCHEMA_VERSION);
  });
});

describe('projects', () => {
  it('round-trips a project', async () => {
    expect(value(await writeProjectRecord({ id: 'project-1', name: 'Ashfall' } as { id: string })));
    await writeProjectRecord({ id: 'project-2' });

    expect(value(await readAllProjectRecords())).toEqual([
      { id: 'project-1', name: 'Ashfall' },
      { id: 'project-2' },
    ]);
  });

  it('replaces a project written under the same id', async () => {
    await writeProjectRecord({ id: 'project-1', name: 'Ashfall' } as { id: string });
    await writeProjectRecord({ id: 'project-1', name: 'Ashfall Revised' } as { id: string });

    expect(value(await readAllProjectRecords())).toEqual([
      { id: 'project-1', name: 'Ashfall Revised' },
    ]);
  });
});

describe('artifacts', () => {
  it('round-trips a summary and its payload, keyed apart', async () => {
    await writeArtifactRecord(summary(), { title: 'Ashfall' });

    expect(value(await readAllArtifactRecords())).toEqual([summary()]);
    expect(value(await readArtifactPayloadRecord('artifact-1'))).toEqual({
      artifactId: 'artifact-1',
      payload: { title: 'Ashfall' },
    });
  });

  it('is undefined for a payload nothing was written under', async () => {
    expect(value(await readArtifactPayloadRecord('nope'))).toBeUndefined();
  });

  it('writes a summary alone without touching the payload beside it', async () => {
    await writeArtifactRecord(summary(), { title: 'Ashfall' });

    await writeArtifactSummaryRecord(summary({ name: 'The Ashfall notes' }));

    expect(value(await readAllArtifactRecords())).toEqual([summary({ name: 'The Ashfall notes' })]);
    expect(value(await readArtifactPayloadRecord('artifact-1'))?.payload).toEqual({
      title: 'Ashfall',
    });
  });

  it('deletes a summary and its payload together', async () => {
    await writeArtifactRecord(summary(), { title: 'Ashfall' });
    await writeArtifactRecord(summary({ id: 'artifact-2' }), { title: 'Emberhold' });

    expect(value(await deleteArtifactRecord('artifact-1'))).toBeUndefined();

    expect(value(await readAllArtifactRecords())).toEqual([summary({ id: 'artifact-2' })]);
    expect(value(await readArtifactPayloadRecord('artifact-1'))).toBeUndefined();
    expect(value(await readArtifactPayloadRecord('artifact-2'))).toBeDefined();
  });
});

describe('deleteProjectCascade', () => {
  it('removes the project, its artifacts, their payloads, and its bench', async () => {
    await writeProjectRecord({ id: 'project-1' });
    await writeProjectRecord({ id: 'project-2' });
    await writeArtifactRecord(summary({ id: 'a' }), { title: 'A' });
    await writeArtifactRecord(summary({ id: 'b' }), { title: 'B' });
    await writeArtifactRecord(summary({ id: 'c', projectId: 'project-2' }), { title: 'C' });
    await writeWorkspaceRecord('project-1', { panels: [] });
    await writeWorkspaceRecord('project-2', { panels: [] });

    expect(value(await deleteProjectCascade('project-1')).sort()).toEqual(['a', 'b']);

    expect(value(await readAllProjectRecords())).toEqual([{ id: 'project-2' }]);
    expect(value(await readAllArtifactRecords())).toEqual([
      summary({ id: 'c', projectId: 'project-2' }),
    ]);
    expect(value(await readArtifactPayloadRecord('a'))).toBeUndefined();
    expect(value(await readArtifactPayloadRecord('c'))).toBeDefined();
    expect(value(await readWorkspaceRecord('project-1'))).toBeUndefined();
    expect(value(await readWorkspaceRecord('project-2'))).toEqual({ panels: [] });
  });

  it('reports nothing removed for a project that is not there', async () => {
    expect(value(await deleteProjectCascade('project-9'))).toEqual([]);
  });
});

describe('workspaces', () => {
  it('round-trips and deletes a bench', async () => {
    await writeWorkspaceRecord('project-1', { workspaceVersion: 1, panels: [{ order: 0 }] });

    expect(value(await readWorkspaceRecord('project-1'))).toEqual({
      workspaceVersion: 1,
      panels: [{ order: 0 }],
    });

    await deleteWorkspaceRecord('project-1');
    expect(value(await readWorkspaceRecord('project-1'))).toBeUndefined();
  });
});

describe('meta', () => {
  it('round-trips a value', async () => {
    await writeVaultMeta(VAULT_META_KEYS.lastVaultExportAt, 1000);
    expect(value(await readVaultMeta(VAULT_META_KEYS.lastVaultExportAt))).toBe(1000);
  });

  it('is undefined for a key never written', async () => {
    expect(value(await readVaultMeta(VAULT_META_KEYS.lastVaultExportAt))).toBeUndefined();
  });

  it('mints a vault id once and keeps it', async () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'vault-uuid' });

    expect(value(await readVaultId())).toBe('vault-uuid');
    vi.stubGlobal('crypto', { randomUUID: () => 'a-different-uuid' });
    expect(value(await readVaultId())).toBe('vault-uuid');
  });

  it('mints an id even where randomUUID is absent', async () => {
    vi.stubGlobal('crypto', {});
    expect(value(await readVaultId())).toMatch(/^vault-/);
  });
});

describe('when there is no database to reach', () => {
  it('reports every operation as unavailable rather than throwing', async () => {
    vi.stubGlobal('indexedDB', undefined);

    for (const result of [
      await readAllProjectRecords(),
      await writeProjectRecord({ id: 'project-1' }),
      await readAllArtifactRecords(),
      await deleteProjectCascade('project-1'),
      await readVaultMeta(VAULT_META_KEYS.vaultId),
      await deleteVaultDatabase(),
    ]) {
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('unavailable');
    }
  });

  it('reports a refused open as a storage failure, and tries again next time', async () => {
    let attempts = 0;
    const failing = {
      open: () => {
        attempts += 1;
        const request = { error: new Error('open refused'), onerror: null } as unknown as {
          error: Error;
          onerror: (() => void) | null;
        };
        queueMicrotask(() => request.onerror?.());
        return request;
      },
    };
    vi.stubGlobal('indexedDB', failing);

    const first = await readAllProjectRecords();
    expect(first.ok).toBe(false);
    expect(first.ok === false && first.reason).toBe('storage-failed');

    // The failure is not cached as the answer: a private window that gains quota gets another go.
    await readAllProjectRecords();
    expect(attempts).toBe(2);
  });

  it('reports a full origin as quota-exceeded, which is the one signal to act on', async () => {
    vi.stubGlobal('indexedDB', {
      open: () => {
        const request = { error: new DOMException('full', 'QuotaExceededError'), onerror: null };
        queueMicrotask(() => (request.onerror as (() => void) | null)?.());
        return request;
      },
    });

    const result = await writeProjectRecord({ id: 'project-1' });
    expect(result.ok === false && result.reason).toBe('quota-exceeded');
  });
});

describe('deleteVaultDatabase', () => {
  it('takes everything with it, and the next write starts a fresh database', async () => {
    await writeProjectRecord({ id: 'project-1' });
    await writeArtifactRecord(summary(), { title: 'Ashfall' });

    expect(value(await deleteVaultDatabase())).toBeUndefined();

    expect(value(await readAllProjectRecords())).toEqual([]);
    expect(value(await readAllArtifactRecords())).toEqual([]);
  });
});

describe('adopting the localStorage workshop keys', () => {
  const legacySummary = {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: 'culture',
    name: 'Ashfall',
    tags: [],
    references: [],
    createdAt: 10,
    updatedAt: 20,
  };

  function seedLegacyVault(): void {
    storeLegacy('workshop.projects', {
      payloadVersion: 1,
      projects: [{ id: 'project-1', name: 'Ashfall', tags: [], createdAt: 1, updatedAt: 2 }],
    });
    storeLegacy('workshop.artifact_index.project-1', {
      storeVersion: 1,
      projectId: 'project-1',
      artifacts: [legacySummary],
    });
    storeLegacy('workshop.artifact.artifact-1', {
      storeVersion: 1,
      payloadVersion: 3,
      payload: { name: 'Ashfall' },
    });
  }

  it('copies projects, summaries, and payloads in, and leaves the originals alone', async () => {
    seedLegacyVault();

    expect(value(await readAllProjectRecords())).toEqual([
      { id: 'project-1', name: 'Ashfall', tags: [], createdAt: 1, updatedAt: 2 },
    ]);
    // The version moves from the payload entry to the summary, and the size it never had is
    // computed on the way through.
    expect(value(await readAllArtifactRecords())).toEqual([
      { ...legacySummary, payloadVersion: 3, byteSize: 18 },
    ]);
    expect(value(await readArtifactPayloadRecord('artifact-1'))?.payload).toEqual({
      name: 'Ashfall',
    });
    expect(local.has(`${SAVE_STORAGE_PREFIX}workshop.artifact.artifact-1`)).toBe(true);
    expect(value(await readVaultMeta(VAULT_META_KEYS.localStorageAdoptedAt))).toEqual(
      expect.any(Number),
    );
  });

  it('does not run twice, so nothing a user changed afterwards is undone', async () => {
    seedLegacyVault();
    await writeProjectRecord({ id: 'project-1', name: 'Renamed since' } as { id: string });
    await deleteArtifactRecord('artifact-1');

    closeVault();
    await readAllProjectRecords();

    expect(value(await readAllProjectRecords())).toEqual([
      { id: 'project-1', name: 'Renamed since' },
    ]);
    expect(value(await readAllArtifactRecords())).toEqual([]);
  });

  it('adopts a summary whose payload entry is missing rather than dropping the artifact', async () => {
    storeLegacy('workshop.artifact_index.project-1', {
      storeVersion: 1,
      projectId: 'project-1',
      artifacts: [legacySummary],
    });

    expect(value(await readAllArtifactRecords())).toEqual([
      { ...legacySummary, payloadVersion: 0, byteSize: 0 },
    ]);
    expect(value(await readArtifactPayloadRecord('artifact-1'))).toBeUndefined();
  });

  it('skips records with no identity to file them under', async () => {
    storeLegacy('workshop.projects', { payloadVersion: 1, projects: [{ name: 'no id' }] });
    storeLegacy('workshop.artifact_index.project-1', {
      storeVersion: 1,
      artifacts: [{ id: 'artifact-1' }, { projectId: 'project-1' }, legacySummary],
    });

    expect(value(await readAllProjectRecords())).toEqual([]);
    expect(value(await readAllArtifactRecords())).toEqual([
      { ...legacySummary, payloadVersion: 0, byteSize: 0 },
    ]);
  });

  it('reads nothing and writes nothing for a browser that never used the workshop', async () => {
    expect(value(await readAllProjectRecords())).toEqual([]);
    expect(value(await readAllArtifactRecords())).toEqual([]);
    // The stamp is still written: the copy has happened, and it happened to find nothing.
    expect(value(await readVaultMeta(VAULT_META_KEYS.localStorageAdoptedAt))).toEqual(
      expect.any(Number),
    );
  });

  it('carries on when there is no localStorage at all', async () => {
    vi.stubGlobal('localStorage', undefined);
    expect(value(await readAllProjectRecords())).toEqual([]);
  });
});
