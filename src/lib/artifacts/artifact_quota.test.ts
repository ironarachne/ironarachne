/**
 * What happens to a save when the browser says there is no room (#180).
 *
 * The one storage failure that costs the user work that exists nowhere else, so the properties here
 * are the ones the rest of the storage design is measured against: storage is left as it was, and
 * memory does not claim a save the database refused. The second is the one most likely to be got
 * wrong, because the optimistic version looks correct in every test where the write succeeds.
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
import { createProject, resetProjectIndex } from '$lib/projects';
import {
  closeVault,
  readAllArtifactPayloadRecords,
  readAllArtifactRecords,
  type VaultResult,
} from '$lib/vault_db';

import { createArtifact, updateArtifactPayload } from './artifacts';
import { indexedArtifacts, resetArtifactIndex } from './artifact_index';

type NoteSnapshot = { text: string };

function validateNote(payload: unknown): PayloadResult<NoteSnapshot> {
  const record = asRecord(payload);
  if (record === null || typeof record.text !== 'string') {
    return rejectedPayload('invalid-payload', 'a note needs a text string');
  }
  return acceptedPayload({ text: record.text });
}

const noteKind = defineArtifactKind<NoteSnapshot, NoteSnapshot>({
  kind: 'test.note',
  displayName: 'Note',
  payloadVersion: 1,
  loadCodec: () =>
    Promise.resolve({ toSnapshot: (value) => value, fromSnapshot: (snapshot) => snapshot }),
  nameOf: (snapshot) => snapshot.text,
  validate: validateNote,
  migrate: (_payload, from) => rejectedPayload('unsupported-version', `no step from ${from}`),
});

function testKinds(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, noteKind);
  return registry;
}

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

/**
 * The shared `IDBObjectStore` prototype, reached through a throwaway database.
 *
 * Patching it is how the browser is made to refuse a write with the one error that matters, without
 * a fake store that would only be testing the fake.
 */
async function objectStorePrototype(): Promise<IDBObjectStore> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('quota-probe', 1);
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

/** Runs `work` with every `put` refused as the browser refuses one when the origin is full. */
async function withFullStorage<T>(work: () => Promise<T>): Promise<T> {
  const prototype = await objectStorePrototype();
  const put = prototype.put;
  prototype.put = function refusing() {
    throw new DOMException('the quota has been exceeded', 'QuotaExceededError');
  } as typeof put;
  try {
    return await work();
  } finally {
    prototype.put = put;
  }
}

async function vaultSnapshot() {
  const artifacts: VaultResult<unknown[]> = await readAllArtifactRecords();
  const payloads = await readAllArtifactPayloadRecords();
  return {
    artifacts: artifacts.ok ? artifacts.value : [],
    payloads: payloads.ok ? payloads.value : [],
  };
}

async function seedProject(): Promise<string> {
  const created = await createProject({ name: 'Ashfall' });
  if (!created.ok) {
    throw new Error('the test project could not be created');
  }
  return created.value.id;
}

describe('a save the browser has no room for', () => {
  it('reports quota-exceeded rather than throwing', async () => {
    const projectId = await seedProject();

    const result = await withFullStorage(() =>
      createArtifact(testKinds(), {
        projectId,
        kind: 'test.note',
        payload: { text: 'The Deep' },
      }),
    );

    expect(result).toMatchObject({ ok: false, reason: 'quota-exceeded' });
  });

  it('leaves storage exactly as it was', async () => {
    const projectId = await seedProject();
    const before = await vaultSnapshot();

    await withFullStorage(() =>
      createArtifact(testKinds(), {
        projectId,
        kind: 'test.note',
        payload: { text: 'The Deep' },
      }),
    );

    expect(await vaultSnapshot()).toEqual(before);
  });

  /**
   * The phantom save. Memory claiming an artifact the database refused is the failure that shows
   * the user "saved" and loses it on the next reload — and it is invisible in any test where the
   * write succeeds, which is why it is asserted directly.
   */
  it('does not leave the artifact in the hydrated index', async () => {
    const projectId = await seedProject();

    await withFullStorage(() =>
      createArtifact(testKinds(), {
        projectId,
        kind: 'test.note',
        payload: { text: 'The Deep' },
      }),
    );

    expect(indexedArtifacts()).toEqual([]);
    // And a fresh read of the database agrees with memory, which is the property that matters.
    resetArtifactIndex();
    expect((await vaultSnapshot()).artifacts).toEqual([]);
  });

  it('leaves an existing artifact’s stored payload untouched when an edit cannot be written', async () => {
    const projectId = await seedProject();
    const created = await createArtifact(testKinds(), {
      projectId,
      kind: 'test.note',
      payload: { text: 'As it was' },
    });
    if (!created.ok) {
      throw new Error('the artifact could not be created');
    }
    const before = await vaultSnapshot();

    const result = await withFullStorage(() =>
      updateArtifactPayload(testKinds(), projectId, created.value.id, { text: 'The edit' }),
    );

    expect(result).toMatchObject({ ok: false, reason: 'quota-exceeded' });
    expect(await vaultSnapshot()).toEqual(before);
    expect((await vaultSnapshot()).payloads[0]).toEqual({
      artifactId: created.value.id,
      payload: { text: 'As it was' },
    });
  });
});
