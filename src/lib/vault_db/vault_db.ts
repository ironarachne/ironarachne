import { adoptLocalStorageVault } from './vault_db_adoption';
import {
  ARTIFACTS_BY_PROJECT_INDEX,
  VAULT_DATABASE_NAME,
  VAULT_SCHEMA_VERSION,
  upgradeVaultDatabase,
} from './vault_db_schema';
import { requestToPromise, runTransaction, vaultFailure } from './vault_db_transaction';
import {
  VAULT_META_KEYS,
  type VaultArtifactPayloadRecord,
  type VaultArtifactRecord,
  type VaultContents,
  type VaultMetaKey,
  type VaultMetaRecord,
  type VaultResult,
  type VaultStoreName,
  type VaultWorkspaceRecord,
} from './vault_db_types';

/**
 * The open database, or the attempt to open one.
 *
 * Cached as a promise rather than as a handle so that two callers racing at startup share one open
 * — opening twice is not an error, but it does mean two upgrade paths and two adoption runs.
 */
let connection: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(VAULT_DATABASE_NAME, VAULT_SCHEMA_VERSION);
    request.onupgradeneeded = () => {
      // The version-change transaction is the request's own, and it is the only one that may
      // create stores. It is null only outside an upgrade, which is not where this runs.
      const transaction = request.transaction;
      if (transaction !== null) {
        upgradeVaultDatabase(request.result, transaction);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('the vault could not be opened'));
    request.onblocked = () =>
      reject(new Error('another tab is holding an older version of the vault open'));
  });
}

async function connect(): Promise<IDBDatabase> {
  const database = await openDatabase();
  // Another tab upgrading the schema is blocked until every other connection closes. Holding one
  // open across a reload of a second tab would hang that tab's upgrade rather than fail it, which
  // is the harder failure to diagnose of the two.
  database.onversionchange = () => {
    database.close();
    connection = null;
  };
  try {
    await adoptLocalStorageVault(database);
  } catch {
    // The vault is open and usable; only the one-time copy from `localStorage` failed. It is not
    // recorded as done, so the next load tries again, and the originals are still there either
    // way. Failing the connection over it would take the workshop down for everyone whose
    // migration hit a snag.
  }
  return database;
}

function vaultConnection(): Promise<IDBDatabase> {
  if (connection === null) {
    connection = connect().catch((error: unknown) => {
      // A failed open must not be cached as the answer forever: a private window that gains quota,
      // or a tab that stops blocking an upgrade, both resolve on a later attempt.
      connection = null;
      throw error;
    });
  }
  return connection;
}

/**
 * Close the database and forget it, so the next operation opens it again.
 *
 * Needed by anything that replaces the whole store — a vault import, a "clear everything" — and by
 * tests, which otherwise carry one test's connection into the next one's database.
 */
export function closeVault(): void {
  void closeConnection();
}

async function closeConnection(): Promise<void> {
  const closing = connection;
  connection = null;
  try {
    (await closing)?.close();
  } catch {
    // Nothing to close: the open failed, and its caller has already seen why.
  }
}

async function withStores<T>(
  stores: VaultStoreName[],
  mode: IDBTransactionMode,
  work: (transaction: IDBTransaction) => Promise<T>,
): Promise<VaultResult<T>> {
  if (typeof indexedDB === 'undefined') {
    // Prerendering, and any browser that has no IndexedDB. Reported rather than thrown: a page
    // that renders before there is a database is the ordinary case, not a fault.
    return { ok: false, reason: 'unavailable', message: 'this browser has no IndexedDB' };
  }
  try {
    const database = await vaultConnection();
    return { ok: true, value: await runTransaction(database, stores, mode, work) };
  } catch (error) {
    return vaultFailure(error);
  }
}

/** The `value` a wrapping record carries, or `undefined` when there is no readable record. */
function unwrapValue(record: unknown): unknown {
  if (record !== null && typeof record === 'object' && 'value' in record) {
    return record.value;
  }
  return undefined;
}

function unwrapValues(records: unknown[]): unknown[] {
  return records.map(unwrapValue).filter((value) => value !== undefined);
}

/** Every stored project, as the values `$lib/projects` wrote. Order is by id; callers sort. */
export function readAllProjectRecords(): Promise<VaultResult<unknown[]>> {
  return withStores(['projects'], 'readonly', async (transaction) =>
    unwrapValues(await requestToPromise(transaction.objectStore('projects').getAll())),
  );
}

/**
 * Store one project. The record wraps it; see {@link VaultProjectRecord}.
 *
 * Read-modify-write rather than a bare `put`, in the transaction that writes, so that the
 * record-level fields the project does not carry survive. `lastExportAt` is the one that exists:
 * it is written on a successful export and it is the number that predicts loss, so a rename
 * silently resetting it to "never exported" would be the display lying about the one thing
 * docs/workshop.md puts first.
 */
export function writeProjectRecord(project: { id: string }): Promise<VaultResult<void>> {
  return withStores(['projects'], 'readwrite', async (transaction) => {
    const store = transaction.objectStore('projects');
    const existing = asProjectRecord(await requestToPromise(store.get(project.id)));
    await requestToPromise(store.put({ ...existing, id: project.id, value: project }));
  });
}

/** A stored record as an object, or `undefined` when nothing readable is stored under that key. */
function asProjectRecord(record: unknown): Record<string, unknown> | undefined {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    return undefined;
  }
  return record as Record<string, unknown>;
}

/**
 * When each project was last exported, by project id — projects that have never been exported are
 * absent rather than zero, because "never" and "at the epoch" are different answers.
 *
 * Read from the store rather than from the hydrated index because the stamp is a field of the
 * record, not of the project: `$lib/projects` does not know it exists, and keeping it that way is
 * what stops an export timestamp from travelling in an export file.
 */
export function readProjectExportStamps(): Promise<VaultResult<Map<string, number>>> {
  return withStores(['projects'], 'readonly', async (transaction) => {
    const records = await requestToPromise(transaction.objectStore('projects').getAll());
    const stamps = new Map<string, number>();
    for (const raw of records) {
      const record = asProjectRecord(raw);
      if (typeof record?.id === 'string' && isFiniteNumber(record.lastExportAt)) {
        stamps.set(record.id, record.lastExportAt);
      }
    }
    return stamps;
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Record that a project was exported, reporting `false` when no project has that id.
 *
 * **Called only after an export has succeeded.** The stamp is what tells a user how long their
 * work has been the browser's only copy, so writing it for an export that failed or was cancelled
 * would replace a true warning with a false reassurance.
 */
export function writeProjectExportStamp(
  projectId: string,
  exportedAt: number,
): Promise<VaultResult<boolean>> {
  return withStores(['projects'], 'readwrite', async (transaction) => {
    const store = transaction.objectStore('projects');
    const existing = asProjectRecord(await requestToPromise(store.get(projectId)));
    if (existing === undefined) {
      return false;
    }
    await requestToPromise(store.put({ ...existing, lastExportAt: exportedAt }));
    return true;
  });
}

/**
 * Every stored artifact summary, payloads excluded — what the hydrated index is built from.
 *
 * Every project's, in one read. The index is hydrated once at startup rather than per project,
 * because a picker that offers artifacts from another project needs them and a second read per
 * project would be the slower way to get there.
 */
export function readAllArtifactRecords(): Promise<VaultResult<unknown[]>> {
  return withStores(
    ['artifacts'],
    'readonly',
    async (transaction) =>
      (await requestToPromise(transaction.objectStore('artifacts').getAll())) as unknown[],
  );
}

/** One artifact's payload, or `undefined` when nothing is stored under that id. */
export function readArtifactPayloadRecord(
  artifactId: string,
): Promise<VaultResult<VaultArtifactPayloadRecord | undefined>> {
  return withStores(['artifact_payloads'], 'readonly', async (transaction) => {
    const record = (await requestToPromise(
      transaction.objectStore('artifact_payloads').get(artifactId),
    )) as VaultArtifactPayloadRecord | undefined;
    return record;
  });
}

/**
 * Store an artifact's summary and its payload together.
 *
 * One transaction, so the two cannot disagree. Under `localStorage` this was two writes ordered so
 * that a refused second one left the least bad residue; here a refused write leaves nothing at
 * all, which is why `payloadVersion` can now live on the summary where a listing can read it.
 */
export function writeArtifactRecord(
  summary: VaultArtifactRecord,
  payload: unknown,
): Promise<VaultResult<void>> {
  return withStores(['artifacts', 'artifact_payloads'], 'readwrite', async (transaction) => {
    transaction.objectStore('artifacts').put(summary);
    await requestToPromise(
      transaction.objectStore('artifact_payloads').put({ artifactId: summary.id, payload }),
    );
  });
}

/**
 * Store an artifact's summary alone. What a rename, a tag, or a reference edit writes — the
 * payload entry is not read, not rewritten, and not touched.
 */
export function writeArtifactSummaryRecord(
  summary: VaultArtifactRecord,
): Promise<VaultResult<void>> {
  return withStores(['artifacts'], 'readwrite', async (transaction) => {
    await requestToPromise(transaction.objectStore('artifacts').put(summary));
  });
}

/** Remove an artifact and its payload in one transaction. */
export function deleteArtifactRecord(artifactId: string): Promise<VaultResult<void>> {
  return withStores(['artifacts', 'artifact_payloads'], 'readwrite', async (transaction) => {
    transaction.objectStore('artifacts').delete(artifactId);
    await requestToPromise(transaction.objectStore('artifact_payloads').delete(artifactId));
  });
}

/**
 * Delete a project and everything it owns — its artifacts, their payloads, and its bench — in one
 * transaction, reporting the artifact ids that went with it.
 *
 * This is the filled diamond in the domain model made real. Ownership that cascades in four
 * separate writes is ownership that can be interrupted half way, leaving artifacts in a project
 * nothing lists; here there is no half way.
 */
export function deleteProjectCascade(projectId: string): Promise<VaultResult<string[]>> {
  return withStores(
    ['projects', 'artifacts', 'artifact_payloads', 'workspaces'],
    'readwrite',
    async (transaction) => {
      const artifacts = transaction.objectStore('artifacts');
      const keys = await requestToPromise(
        artifacts.index(ARTIFACTS_BY_PROJECT_INDEX).getAllKeys(projectId),
      );
      const artifactIds = keys.filter((key): key is string => typeof key === 'string');

      const payloads = transaction.objectStore('artifact_payloads');
      for (const artifactId of artifactIds) {
        artifacts.delete(artifactId);
        payloads.delete(artifactId);
      }
      transaction.objectStore('workspaces').delete(projectId);
      await requestToPromise(transaction.objectStore('projects').delete(projectId));
      return artifactIds;
    },
  );
}

/** One project's bench, or `undefined` when it has none. Not user work; see decision 3. */
export function readWorkspaceRecord(projectId: string): Promise<VaultResult<unknown>> {
  return withStores(['workspaces'], 'readonly', async (transaction) => {
    return unwrapValue(
      await requestToPromise(transaction.objectStore('workspaces').get(projectId)),
    );
  });
}

export function writeWorkspaceRecord(
  projectId: string,
  value: unknown,
): Promise<VaultResult<void>> {
  return withStores(['workspaces'], 'readwrite', async (transaction) => {
    await requestToPromise(transaction.objectStore('workspaces').put({ projectId, value }));
  });
}

export function deleteWorkspaceRecord(projectId: string): Promise<VaultResult<void>> {
  return withStores(['workspaces'], 'readwrite', async (transaction) => {
    await requestToPromise(transaction.objectStore('workspaces').delete(projectId));
  });
}

/** Every stored bench, for a whole-vault export. Reads all of them; callers keyed by project. */
export function readAllWorkspaceRecords(): Promise<VaultResult<VaultWorkspaceRecord[]>> {
  return withStores(
    ['workspaces'],
    'readonly',
    async (transaction) =>
      (await requestToPromise(
        transaction.objectStore('workspaces').getAll(),
      )) as VaultWorkspaceRecord[],
  );
}

/** Every payload in the vault, by artifact id. What a whole-vault export has to write out. */
export function readAllArtifactPayloadRecords(): Promise<
  VaultResult<VaultArtifactPayloadRecord[]>
> {
  return withStores(
    ['artifact_payloads'],
    'readonly',
    async (transaction) =>
      (await requestToPromise(
        transaction.objectStore('artifact_payloads').getAll(),
      )) as VaultArtifactPayloadRecord[],
  );
}

/** Everything in the `quarantine` store, as it was put there. */
export function readAllQuarantineRecords(): Promise<VaultResult<unknown[]>> {
  return withStores(
    ['quarantine'],
    'readonly',
    async (transaction) =>
      (await requestToPromise(transaction.objectStore('quarantine').getAll())) as unknown[],
  );
}

/** Remove one quarantined record — what discarding something unreadable does. */
export function deleteQuarantineRecord(id: string): Promise<VaultResult<void>> {
  return withStores(['quarantine'], 'readwrite', async (transaction) => {
    await requestToPromise(transaction.objectStore('quarantine').delete(id));
  });
}

/** The stores a whole-vault write touches. `meta` is in the list so a stamp commits with them. */
const VAULT_CONTENT_STORES: VaultStoreName[] = [
  'projects',
  'artifacts',
  'artifact_payloads',
  'workspaces',
  'quarantine',
  'meta',
];

export type WriteVaultContentsOptions = {
  /**
   * True to make the vault *become* these contents: every content store is emptied first. False
   * adds them alongside what is there, which is what a merge does.
   */
  replace: boolean;
  /** Meta values to write in the same transaction, so a stamp cannot outlive a failed write. */
  meta?: VaultMetaRecord[];
};

/**
 * Write a whole vault in **one transaction**.
 *
 * This is invariant 1 in docs/workshop.md — commit is all or nothing — implemented rather than
 * approximated. An import that runs out of quota at artifact 900 of 1000 aborts the transaction,
 * and IndexedDB unwinds every put in it: storage is byte-identical to what it was before, with no
 * snapshot to restore and no rollback path of our own to get wrong. A restore that emptied the
 * stores in one transaction and refilled them in another would have a window in which the user's
 * whole vault was gone, and a crash inside that window is unrecoverable.
 *
 * `meta` is written here rather than after, for the same reason: a stamp saying the vault was
 * replaced must not survive a replacement that did not happen.
 */
export function writeVaultContents(
  contents: VaultContents,
  options: WriteVaultContentsOptions,
): Promise<VaultResult<void>> {
  return withStores(VAULT_CONTENT_STORES, 'readwrite', async (transaction) => {
    if (options.replace) {
      // Not `meta`: the vault id identifies this browser rather than the work in it, and the stamp
      // recording that `localStorage` was already adopted must survive, or the next connection
      // adopts those keys all over again.
      for (const store of [
        'projects',
        'artifacts',
        'artifact_payloads',
        'workspaces',
        'quarantine',
      ] as const) {
        transaction.objectStore(store).clear();
      }
    }
    for (const project of contents.projects) {
      transaction.objectStore('projects').put(project);
    }
    for (const artifact of contents.artifacts) {
      transaction.objectStore('artifacts').put(artifact);
    }
    for (const payload of contents.payloads) {
      transaction.objectStore('artifact_payloads').put(payload);
    }
    for (const workspace of contents.workspaces) {
      transaction.objectStore('workspaces').put(workspace);
    }
    for (const record of contents.quarantine) {
      transaction.objectStore('quarantine').put(record);
    }
    for (const entry of options.meta ?? []) {
      transaction.objectStore('meta').put(entry);
    }
    // Awaiting one request is enough to surface a rejected put; `runTransaction` resolves on the
    // commit, which is what the caller is actually waiting for.
    await requestToPromise(transaction.objectStore('meta').get(VAULT_META_KEYS.schemaVersion));
  });
}

/** One `meta` value, or `undefined` when it has never been written. */
export function readVaultMeta(key: VaultMetaKey): Promise<VaultResult<unknown>> {
  return withStores(['meta'], 'readonly', async (transaction) => {
    return unwrapValue(await requestToPromise(transaction.objectStore('meta').get(key)));
  });
}

export function writeVaultMeta(key: VaultMetaKey, value: unknown): Promise<VaultResult<void>> {
  return withStores(['meta'], 'readwrite', async (transaction) => {
    await requestToPromise(transaction.objectStore('meta').put({ key, value }));
  });
}

/**
 * This vault's id, minted on first use and stable thereafter.
 *
 * It identifies the browser store an export came out of, which is what lets an import tell a file
 * of the user's own work from someone else's. Read and mint happen in one transaction so two
 * callers at startup cannot mint two different ids.
 */
export function readVaultId(): Promise<VaultResult<string>> {
  return withStores(['meta'], 'readwrite', async (transaction) => {
    const meta = transaction.objectStore('meta');
    const stored = unwrapValue(await requestToPromise(meta.get(VAULT_META_KEYS.vaultId)));
    if (typeof stored === 'string' && stored !== '') {
      return stored;
    }
    const minted = globalThis.crypto?.randomUUID?.() ?? `vault-${Date.now().toString(36)}`;
    await requestToPromise(meta.put({ key: VAULT_META_KEYS.vaultId, value: minted }));
    return minted;
  });
}

/**
 * Delete the whole database: every project, every artifact, every payload, the benches, and the
 * meta store with them.
 *
 * The "clear everything" path, and the one place that has to remember the workshop now spans two
 * substrates — the `localStorage` pointers are not touched by this and are cleared separately.
 *
 * That coupling has a sharp edge worth stating: the stamp recording the one-time copy from
 * `localStorage` lives in the `meta` store and goes with it, so a later open adopts those keys
 * again if they are still there. Clearing everything means clearing both, in that order.
 */
export async function deleteVaultDatabase(): Promise<VaultResult<void>> {
  if (typeof indexedDB === 'undefined') {
    return { ok: false, reason: 'unavailable', message: 'this browser has no IndexedDB' };
  }
  await closeConnection();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(VAULT_DATABASE_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error('the vault could not be deleted'));
      request.onblocked = () =>
        reject(new Error('another tab is holding the vault open; close it and try again'));
    });
    return { ok: true, value: undefined };
  } catch (error) {
    return vaultFailure(error);
  }
}
