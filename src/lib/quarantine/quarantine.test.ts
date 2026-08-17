import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { closeVault, writeVaultContents } from '$lib/vault_db';

import {
  discardQuarantinedArtifact,
  newQuarantineRecordId,
  quarantinedForExport,
  readQuarantinedArtifacts,
  toQuarantineRecord,
  toQuarantineRecordFromStorage,
} from './quarantine';
import type { QuarantinedArtifact, QuarantineRecord } from './quarantine_types';

function held(overrides: Partial<QuarantinedArtifact> = {}): QuarantinedArtifact {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: 'culture',
    name: 'A culture',
    raw: { anything: 'at all' },
    reason: 'unknown-kind',
    message: 'no such kind',
    ...overrides,
  };
}

async function store(records: QuarantineRecord[]): Promise<void> {
  const written = await writeVaultContents(
    { projects: [], artifacts: [], payloads: [], workspaces: [], quarantine: records },
    { replace: false },
  );
  if (!written.ok) {
    throw new Error(`the quarantine records could not be stored: ${written.message}`);
  }
}

beforeEach(() => {
  closeVault();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  vi.unstubAllGlobals();
});

describe('newQuarantineRecordId', () => {
  it('mints an id even where crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', {});
    expect(newQuarantineRecordId()).toMatch(/^quarantine-/);
  });
});

describe('toQuarantineRecord', () => {
  it('keeps the record whole and files it under a key of its own', () => {
    const record = toQuarantineRecord(held(), 1000, 'record-1');
    expect(record).toMatchObject({ recordId: 'record-1', quarantinedAt: 1000, id: 'artifact-1' });
    expect(record.raw).toEqual({ anything: 'at all' });
  });

  it('does not file two damaged records under the same key', () => {
    // Both lost their ids, which is exactly when keying on the record's own id would lose one.
    const first = toQuarantineRecord(held({ id: '' }), 1);
    const second = toQuarantineRecord(held({ id: '' }), 1);
    expect(first.recordId).not.toBe(second.recordId);
  });
});

describe('toQuarantineRecordFromStorage', () => {
  it('reads a stored record back', () => {
    const record = toQuarantineRecord(held(), 5);
    expect(toQuarantineRecordFromStorage(record)).toEqual(record);
  });

  it('needs a key and a raw record, and nothing else', () => {
    expect(toQuarantineRecordFromStorage({ recordId: 'r', raw: null })).toMatchObject({
      recordId: 'r',
      id: '',
      kind: '',
      quarantinedAt: 0,
    });
    expect(toQuarantineRecordFromStorage({ recordId: '', raw: 1 })).toBeUndefined();
    expect(toQuarantineRecordFromStorage({ recordId: 'r' })).toBeUndefined();
    expect(toQuarantineRecordFromStorage('not a record')).toBeUndefined();
  });

  it('reads a reason it does not recognise as the honest general case', () => {
    // The note about the record being imperfect is not a reason to drop the record.
    expect(
      toQuarantineRecordFromStorage({ recordId: 'r', raw: {}, reason: 'something-new' })?.reason,
    ).toBe('invalid-payload');
  });
});

describe('readQuarantinedArtifacts', () => {
  it('lists what is held, newest first', async () => {
    await store([
      toQuarantineRecord(held({ name: 'Older' }), 100, 'a'),
      toQuarantineRecord(held({ name: 'Newer' }), 200, 'b'),
    ]);
    const records = await readQuarantinedArtifacts();
    expect(records.ok).toBe(true);
    if (records.ok) {
      expect(records.value.map((record) => record.name)).toEqual(['Newer', 'Older']);
    }
  });

  it('is empty rather than failing when nothing has ever been quarantined', async () => {
    const records = await readQuarantinedArtifacts();
    expect(records.ok && records.value).toEqual([]);
  });

  it('reports a database it could not reach', async () => {
    vi.stubGlobal('indexedDB', undefined);
    expect(await readQuarantinedArtifacts()).toMatchObject({ ok: false, reason: 'unavailable' });
  });
});

describe('discardQuarantinedArtifact', () => {
  it('removes one, and only on an explicit act', async () => {
    await store([
      toQuarantineRecord(held({ name: 'Kept' }), 1, 'keep'),
      toQuarantineRecord(held({ name: 'Thrown away' }), 2, 'discard'),
    ]);
    expect(await discardQuarantinedArtifact('discard')).toMatchObject({ ok: true });
    const records = await readQuarantinedArtifacts();
    expect(records.ok && records.value.map((record) => record.name)).toEqual(['Kept']);
  });
});

describe('quarantinedForExport', () => {
  it('hands back the raw records, so a file carries what arrived rather than our note about it', () => {
    const records = [
      toQuarantineRecord(held({ raw: { id: 'a' } }), 1, 'r1'),
      toQuarantineRecord(held({ raw: 'not even an object' }), 1, 'r2'),
    ];
    expect(quarantinedForExport(records)).toEqual([{ id: 'a' }, 'not even an object']);
  });
});
