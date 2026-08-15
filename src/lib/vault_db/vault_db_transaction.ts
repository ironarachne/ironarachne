import type { VaultFailureReason, VaultStoreName } from './vault_db_types';

/** One IndexedDB request as a promise. Rejects with the request's own error, never a stand-in. */
export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('a vault request failed'));
  });
}

/**
 * Classify a thrown value as a storage failure.
 *
 * `QuotaExceededError` is picked out by name because it is the one authoritative signal that
 * storage is full — an estimate is advisory, and docs/workshop.md ("Storage limits") makes this
 * error, not a measurement, the thing the workshop acts on. Everything else is a failure the
 * caller cannot do anything specific about, and inventing finer reasons for it would only invite
 * callers to branch on guesses.
 */
export function vaultFailure(error: unknown): {
  ok: false;
  reason: VaultFailureReason;
  message: string;
} {
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : String(error);
  if (name === 'QuotaExceededError') {
    return { ok: false, reason: 'quota-exceeded', message };
  }
  return { ok: false, reason: 'storage-failed', message };
}

/**
 * Run work inside one transaction and resolve only once that transaction has **committed**.
 *
 * The commit is what the caller is waiting for, not the last request's success. Resolving earlier
 * would let the hydrated index record a save the database does not have yet — the exact failure
 * docs/workshop.md ("Storage limits") names, arrived at from the inside.
 *
 * Work that throws aborts the transaction, so a multi-store write is all or nothing: a create
 * cannot leave a summary whose payload was never written, and a cascade cannot half-delete a
 * project. This is the property `localStorage` could only approximate by ordering its writes.
 */
export async function runTransaction<T>(
  database: IDBDatabase,
  stores: VaultStoreName[],
  mode: IDBTransactionMode,
  work: (transaction: IDBTransaction) => Promise<T>,
): Promise<T> {
  const transaction = database.transaction(stores, mode);
  const committed = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('vault transaction aborted'));
    transaction.onerror = () => reject(transaction.error ?? new Error('vault transaction failed'));
  });

  let value: T;
  try {
    value = await work(transaction);
  } catch (error) {
    // Nothing is waiting on `committed` once the work has failed, and an unobserved rejection is
    // reported as an unhandled one.
    committed.catch(() => {});
    try {
      transaction.abort();
    } catch {
      // Already aborted by the failed request itself, which is the ordinary case.
    }
    throw error;
  }
  await committed;
  return value;
}
