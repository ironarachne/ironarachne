import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  VAULT_META_KEYS,
  closeVault,
  readVaultMeta,
  writeVaultMeta,
  type VaultResult,
} from '$lib/vault_db';

import { hasSeenStorageDisclosure, recordStorageDisclosureShown } from './storage_disclosure';

/** Unwraps a result, failing the test rather than an assertion when the vault refused. */
function value<T>(result: VaultResult<T>): T {
  if (!result.ok) {
    throw new Error(`expected the vault to answer, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  closeVault();
});

afterEach(() => {
  closeVault();
  vi.unstubAllGlobals();
});

describe('the storage disclosure stamp', () => {
  it('reports that a fresh vault has never been told', async () => {
    expect(value(await hasSeenStorageDisclosure())).toBe(false);
  });

  it('reports a vault that has been told, once the stamp is written', async () => {
    value(await recordStorageDisclosureShown(1700));

    expect(value(await hasSeenStorageDisclosure())).toBe(true);
  });

  it('survives a reload, which is the whole reason it is not in memory', async () => {
    value(await recordStorageDisclosureShown(1700));
    closeVault();

    expect(value(await hasSeenStorageDisclosure())).toBe(true);
  });

  it('stamps the moment itself when the caller does not supply one', async () => {
    value(await recordStorageDisclosureShown());

    // A timestamp rather than a flag, so the panel can say when someone was told.
    const stored = value(await readVaultMeta(VAULT_META_KEYS.storageDisclosureShownAt));
    expect(typeof stored).toBe('number');
  });

  it('shows the disclosure again when the stamp write was refused', async () => {
    // The right failure: telling someone once during a run where the database was refusing writes,
    // and never again, is worse than telling them twice.
    vi.stubGlobal('indexedDB', undefined);

    expect((await recordStorageDisclosureShown(1700)).ok).toBe(false);

    vi.stubGlobal('indexedDB', new IDBFactory());
    closeVault();
    expect(value(await hasSeenStorageDisclosure())).toBe(false);
  });

  it('reports the failure rather than “not told” when the vault cannot be read', async () => {
    // A flattened `false` here would re-tell someone every time the database was unhappy.
    vi.stubGlobal('indexedDB', undefined);

    expect((await hasSeenStorageDisclosure()).ok).toBe(false);
  });

  it('treats a stored value that is not a usable timestamp as never told', async () => {
    value(await writeVaultMeta(VAULT_META_KEYS.storageDisclosureShownAt, 'lately'));

    expect(value(await hasSeenStorageDisclosure())).toBe(false);
  });

  it('treats a stored NaN as never told rather than as a moment', async () => {
    value(await writeVaultMeta(VAULT_META_KEYS.storageDisclosureShownAt, Number.NaN));

    expect(value(await hasSeenStorageDisclosure())).toBe(false);
  });
});
