import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetArtifactIndex } from '$lib/artifacts';
import { renameProject, resetProjectIndex } from '$lib/projects';
import {
  VAULT_META_KEYS,
  closeVault,
  writeArtifactRecord,
  writeProjectRecord,
  writeVaultMeta,
  type VaultResult,
} from '$lib/vault_db';

import {
  MATERIAL_SIZE_CHANGE_BYTES,
  invalidateStorageMeasurement,
  readStorageStatus,
  recordProjectExport,
  recordVaultExport,
} from './storage_status';

/** Unwraps a result, failing the test rather than an assertion when the vault refused. */
function value<T>(result: VaultResult<T>): T {
  if (!result.ok) {
    throw new Error(`expected the vault to answer, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

function storeProject(id: string): Promise<VaultResult<void>> {
  return writeProjectRecord({ id, name: id, tags: [], createdAt: 1, updatedAt: 1 } as {
    id: string;
  });
}

/**
 * A summary as the artifact store would have written it, built apart from the call because
 * `VaultArtifactRecord` names only the two fields the database itself knows about — the rest is
 * carried through as `$lib/artifacts` handed it over.
 */
function summaryRecord(id: string, projectId: string, byteSize: number) {
  return {
    id,
    projectId,
    kind: 'note',
    name: id,
    tags: [],
    references: [],
    payloadVersion: 1,
    byteSize,
    createdAt: 1,
    updatedAt: 1,
  };
}

function storeArtifact(
  id: string,
  projectId: string,
  byteSize: number,
): Promise<VaultResult<void>> {
  return writeArtifactRecord(summaryRecord(id, projectId, byteSize), { title: id });
}

/** A `navigator.storage` that answers, counting how often the estimate was actually taken. */
function stubMeasuringNavigator(usage = 4096, quota = 1_000_000) {
  const estimate = vi.fn(() => Promise.resolve({ usage, quota }));
  vi.stubGlobal('navigator', { storage: { estimate, persisted: () => Promise.resolve(true) } });
  return estimate;
}

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  invalidateStorageMeasurement();
});

afterEach(() => {
  closeVault();
  vi.unstubAllGlobals();
});

describe('reading the storage status', () => {
  it('reports the browser’s figures and its persistence promise', async () => {
    stubMeasuringNavigator(4096, 1_000_000);

    const status = value(await readStorageStatus());

    expect(status.usageBytes).toBe(4096);
    expect(status.quotaBytes).toBe(1_000_000);
    expect(status.persistence).toBe('persisted');
    expect(status.measuredAt).toBeGreaterThan(0);
  });

  it('reports unknown rather than zero on a browser with no navigator.storage', async () => {
    vi.stubGlobal('navigator', {});
    await storeProject('ashfall');

    const status = value(await readStorageStatus());

    expect('usageBytes' in status).toBe(false);
    expect('quotaBytes' in status).toBe(false);
    expect(status.persistence).toBe('unknown');
    // The vault is still readable, so the part that does not come from the browser is still there.
    expect(status.projects).toEqual([{ projectId: 'ashfall', artifactCount: 0, byteSize: 0 }]);
  });

  it('sums a known set of artifacts into their projects, largest first', async () => {
    stubMeasuringNavigator();
    await storeProject('ashfall');
    await storeProject('tallow');
    await storeArtifact('a', 'ashfall', 300);
    await storeArtifact('b', 'ashfall', 45);
    await storeArtifact('c', 'tallow', 100);

    const status = value(await readStorageStatus());

    expect(status.projects).toEqual([
      { projectId: 'ashfall', artifactCount: 2, byteSize: 345 },
      { projectId: 'tallow', artifactCount: 1, byteSize: 100 },
    ]);
  });

  it('does not reconcile the per-project sum against the origin usage', async () => {
    // The browser charges the origin for index overhead and the other stores; the sum cannot see
    // any of it. The two disagreeing is the expected state, not a bug to correct.
    stubMeasuringNavigator(999_999);
    await storeProject('ashfall');
    await storeArtifact('a', 'ashfall', 345);

    const status = value(await readStorageStatus());

    expect(status.usageBytes).toBe(999_999);
    expect(status.projects[0]?.byteSize).toBe(345);
  });

  it('fails rather than reporting an empty vault when there is no database', async () => {
    stubMeasuringNavigator();
    vi.stubGlobal('indexedDB', undefined);

    const status = await readStorageStatus();

    expect(status.ok).toBe(false);
  });

  it('fails when the artifact summaries cannot be read', async () => {
    // Projects are already in memory, so the artifact hydration is the first thing to reach for a
    // database that is no longer there. A status missing its artifacts would report every project
    // as empty, which is a worse answer than none.
    stubMeasuringNavigator();
    await storeProject('ashfall');
    value(await readStorageStatus());
    resetArtifactIndex();
    vi.stubGlobal('indexedDB', undefined);

    expect((await readStorageStatus()).ok).toBe(false);
  });

  it('fails when the export stamps cannot be read', async () => {
    // Both indexes are hydrated, so the stamps are the first read to touch the database. Export
    // recency is the number the panel leads with; reporting the rest without it would drop the one
    // fact that predicts loss.
    stubMeasuringNavigator();
    await storeProject('ashfall');
    value(await readStorageStatus());
    vi.stubGlobal('indexedDB', undefined);

    expect((await readStorageStatus()).ok).toBe(false);
  });
});

describe('export recency', () => {
  it('has no vault export stamp until one is recorded', async () => {
    stubMeasuringNavigator();
    await storeProject('ashfall');
    await storeArtifact('a', 'ashfall', 10);

    // Storing work is not exporting it, so nothing else may write the stamp.
    expect('lastVaultExportAt' in value(await readStorageStatus())).toBe(false);
  });

  it('ignores a stored vault stamp that is not a usable number', async () => {
    stubMeasuringNavigator();
    value(await writeVaultMeta(VAULT_META_KEYS.lastVaultExportAt, 'yesterday'));

    // Absent, rather than repaired into a date that would claim an export nobody can date.
    expect('lastVaultExportAt' in value(await readStorageStatus())).toBe(false);
  });

  it('records a successful vault export', async () => {
    stubMeasuringNavigator();
    value(await recordVaultExport(1700));

    expect(value(await readStorageStatus()).lastVaultExportAt).toBe(1700);
  });

  it('stamps the vault export with the current time when none is supplied', async () => {
    stubMeasuringNavigator();
    const before = Date.now();
    value(await recordVaultExport());

    const stamped = value(await readStorageStatus()).lastVaultExportAt ?? 0;
    expect(stamped).toBeGreaterThanOrEqual(before);
  });

  it('records a successful project export against that project alone', async () => {
    stubMeasuringNavigator();
    await storeProject('ashfall');
    await storeProject('tallow');

    expect(value(await recordProjectExport('ashfall', 1700))).toBe(true);

    const status = value(await readStorageStatus());
    expect(status.projects.find((entry) => entry.projectId === 'ashfall')?.lastExportAt).toBe(1700);
    const tallow = status.projects.find((entry) => entry.projectId === 'tallow');
    expect(tallow !== undefined && 'lastExportAt' in tallow).toBe(false);
    // Six project exports are not a vault export.
    expect('lastVaultExportAt' in status).toBe(false);
  });

  it('reports a project export against a project that is not there, and writes nothing', async () => {
    stubMeasuringNavigator();
    await storeProject('ashfall');

    expect(value(await recordProjectExport('gone', 1700))).toBe(false);
    expect(value(await readStorageStatus()).projects).toEqual([
      { projectId: 'ashfall', artifactCount: 0, byteSize: 0 },
    ]);
  });

  it('keeps a project’s export stamp when the project itself is written again', async () => {
    // A rename must not reset the number that tells the user how long this has been the only copy.
    stubMeasuringNavigator();
    await storeProject('ashfall');
    await recordProjectExport('ashfall', 1700);

    resetProjectIndex();
    resetArtifactIndex();
    const renamed = await renameProject('ashfall', 'Ashfall Revised', { now: 2000 });
    expect(renamed?.ok).toBe(true);

    const status = value(await readStorageStatus());
    expect(status.projects[0]?.lastExportAt).toBe(1700);
  });
});

describe('measuring continuously but cheaply', () => {
  it('re-uses the cached estimate while the vault’s size has barely moved', async () => {
    const estimate = stubMeasuringNavigator();
    await storeProject('ashfall');
    await storeArtifact('a', 'ashfall', 100);

    const first = value(await readStorageStatus());
    await storeArtifact('b', 'ashfall', 200);
    resetArtifactIndex();
    const second = value(await readStorageStatus());

    expect(estimate).toHaveBeenCalledTimes(1);
    expect(second.measuredAt).toBe(first.measuredAt);
  });

  it('takes a fresh estimate once the vault’s size has materially changed', async () => {
    const estimate = stubMeasuringNavigator();
    await storeProject('ashfall');
    value(await readStorageStatus());

    await storeArtifact('big', 'ashfall', MATERIAL_SIZE_CHANGE_BYTES);
    resetArtifactIndex();
    value(await readStorageStatus());

    expect(estimate).toHaveBeenCalledTimes(2);
  });

  it('takes a fresh estimate after the measurement is invalidated', async () => {
    const estimate = stubMeasuringNavigator();
    await storeProject('ashfall');
    value(await readStorageStatus());

    invalidateStorageMeasurement();
    value(await readStorageStatus());

    expect(estimate).toHaveBeenCalledTimes(2);
  });

  it('re-reads persistence on every status read, since a granted request changes it', async () => {
    let persisted = false;
    vi.stubGlobal('navigator', {
      storage: {
        estimate: () => Promise.resolve({ usage: 1, quota: 2 }),
        persisted: () => Promise.resolve(persisted),
      },
    });

    expect(value(await readStorageStatus()).persistence).toBe('notPersisted');
    persisted = true;
    expect(value(await readStorageStatus()).persistence).toBe('persisted');
  });
});
