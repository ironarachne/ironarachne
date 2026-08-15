import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestToPromise, runTransaction, vaultFailure } from './vault_db_transaction';

/** A database with one store, opened straight from a fresh factory: no vault, no adoption. */
function openScratch(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scratch', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('meta', { keyPath: 'key' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('vaultFailure', () => {
  it('picks out the one authoritative storage-is-full signal', () => {
    const error = new DOMException('no room', 'QuotaExceededError');
    expect(vaultFailure(error)).toEqual({
      ok: false,
      reason: 'quota-exceeded',
      message: 'no room',
    });
  });

  it('reports anything else as a storage failure, keeping the message', () => {
    expect(vaultFailure(new Error('disk went away'))).toEqual({
      ok: false,
      reason: 'storage-failed',
      message: 'disk went away',
    });
  });

  it('survives something thrown that is not an error at all', () => {
    expect(vaultFailure('nope')).toEqual({
      ok: false,
      reason: 'storage-failed',
      message: 'nope',
    });
  });
});

describe('runTransaction', () => {
  it('resolves with the work value once the transaction has committed', async () => {
    const database = await openScratch();

    const key = await runTransaction(database, ['meta'], 'readwrite', async (transaction) => {
      const store = transaction.objectStore('meta');
      await requestToPromise(store.put({ key: 'vaultId', value: 'v1' }));
      return 'vaultId';
    });

    expect(key).toBe('vaultId');
    // Committed, so a transaction opened afterwards sees it.
    const stored = await runTransaction(database, ['meta'], 'readonly', (transaction) =>
      requestToPromise(transaction.objectStore('meta').get('vaultId')),
    );
    expect(stored).toEqual({ key: 'vaultId', value: 'v1' });
  });

  it('aborts the transaction when the work throws, so nothing it wrote survives', async () => {
    const database = await openScratch();

    await expect(
      runTransaction(database, ['meta'], 'readwrite', async (transaction) => {
        const store = transaction.objectStore('meta');
        await requestToPromise(store.put({ key: 'half', value: 'written' }));
        throw new Error('changed my mind');
      }),
    ).rejects.toThrow('changed my mind');

    const stored = await runTransaction(database, ['meta'], 'readonly', (transaction) =>
      requestToPromise(transaction.objectStore('meta').get('half')),
    );
    expect(stored).toBeUndefined();
  });

  it('rejects with the request error when a request inside it fails', async () => {
    const database = await openScratch();

    await expect(
      runTransaction(database, ['meta'], 'readwrite', async (transaction) => {
        const store = transaction.objectStore('meta');
        await requestToPromise(store.add({ key: 'once', value: 1 }));
        await requestToPromise(store.add({ key: 'once', value: 2 }));
      }),
    ).rejects.toThrow();
  });
});
