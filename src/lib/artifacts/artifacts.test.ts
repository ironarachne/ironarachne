import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  acceptedPayload,
  asRecord,
  createArtifactKindRegistry,
  defineArtifactKind,
  registerArtifactKind,
  rejectedPayload,
  type ArtifactKindEntry,
  type ArtifactKindRegistry,
} from '$lib/artifact_kinds';
import {
  closeVault,
  readAllArtifactRecords,
  readArtifactPayloadRecord,
  writeArtifactRecord,
  writeArtifactSummaryRecord,
} from '$lib/vault_db';

import { onArtifactsChanged, resetArtifactChangeListeners } from './artifact_events';
import { hydrateArtifacts, resetArtifactIndex } from './artifact_index';
import {
  createArtifact,
  deleteArtifact,
  getArtifactSummary,
  listArtifactReferrers,
  listArtifacts,
  listArtifactsOfKind,
  newArtifactId,
  readArtifact,
  renameArtifact,
  setArtifactReferences,
  tagArtifact,
  updateArtifact,
  updateArtifactPayload,
} from './artifacts';
import type {
  Artifact,
  ArtifactChange,
  ArtifactDraft,
  ArtifactMutationOptions,
  ArtifactProvenance,
  ArtifactSummary,
} from './artifact_types';

beforeEach(() => {
  closeVault();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

/** A database that refuses to open, for the writes that have to survive being refused. */
function refuseTheDatabase(): void {
  closeVault();
  vi.stubGlobal('indexedDB', {
    open: () => {
      const request = { error: new Error('storage is gone'), onerror: null };
      queueMicrotask(() => (request.onerror as (() => void) | null)?.());
      return request;
    },
  });
}

/** A reload: memory is dropped, the database is not. */
async function reload(): Promise<void> {
  resetArtifactIndex();
  await hydrateArtifacts();
}

type Note = { title: string };
type NoteV2 = { title: string; body: string };

/** A one-version kind: the ordinary case, and the one with nothing to migrate from. */
function noteKind(kind = 'note') {
  return defineArtifactKind<Note, Note>({
    kind,
    displayName: `Note (${kind})`,
    payloadVersion: 1,
    loadCodec: async () => ({
      toSnapshot: (value: Note) => ({ ...value }),
      fromSnapshot: (snapshot: Note) => ({ ...snapshot }),
    }),
    nameOf: (snapshot) => snapshot.title,
    validate: (payload) => {
      const record = asRecord(payload);
      if (record === null || typeof record.title !== 'string') {
        return rejectedPayload<Note>('invalid-payload', `${kind} has no title`);
      }
      return acceptedPayload({ title: record.title });
    },
    migrate: (_payload, from) => rejectedPayload<Note>('unsupported-version', `nothing at ${from}`),
  });
}

/** The same kind id, a version later: what a returning user's stored payload has to survive. */
function noteKindV2() {
  return defineArtifactKind<NoteV2, NoteV2>({
    kind: 'note',
    displayName: 'Note',
    payloadVersion: 2,
    loadCodec: async () => ({
      toSnapshot: (value: NoteV2) => ({ ...value }),
      fromSnapshot: (snapshot: NoteV2) => ({ ...snapshot }),
    }),
    nameOf: (snapshot) => snapshot.title,
    validate: (payload) => {
      const record = asRecord(payload);
      if (record === null || typeof record.title !== 'string' || typeof record.body !== 'string') {
        return rejectedPayload<NoteV2>('invalid-payload', 'note is not a v2 note');
      }
      return acceptedPayload({ title: record.title, body: record.body });
    },
    migrate: (payload, from) => {
      const record = asRecord(payload);
      if (from !== 1 || record === null || typeof record.title !== 'string') {
        return rejectedPayload<NoteV2>('migration-failed', `cannot migrate a note from ${from}`);
      }
      return acceptedPayload({ title: record.title, body: '' });
    },
  });
}

/** A kind whose migration returns something its own validator rejects. */
function brokenMigrationKind() {
  return defineArtifactKind<Note, Note>({
    kind: 'broken',
    displayName: 'Broken',
    payloadVersion: 2,
    loadCodec: async () => ({
      toSnapshot: (value: Note) => value,
      fromSnapshot: (snapshot: Note) => snapshot,
    }),
    nameOf: () => 'Broken',
    validate: (payload) => {
      const record = asRecord(payload);
      if (record === null || typeof record.title !== 'string') {
        return rejectedPayload<Note>('invalid-payload', 'broken has no title');
      }
      return acceptedPayload({ title: record.title });
    },
    migrate: () => acceptedPayload({ title: 42 } as unknown as Note),
  });
}

/**
 * A registry holding nothing but the kinds a test invented. What the store is handed is a
 * parameter, so no test here depends on which kinds the real build happens to register.
 */
function registryOf<TValue, TSnapshot>(
  ...entries: ArtifactKindEntry<TValue, TSnapshot>[]
): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  for (const entry of entries) {
    registerArtifactKind(registry, entry);
  }
  return registry;
}

const KINDS = registryOf(noteKind(), noteKind('sketch'));

function draft(overrides: Partial<ArtifactDraft> = {}): ArtifactDraft {
  return {
    projectId: 'project-1',
    kind: 'note',
    payload: { title: 'Ashfall' },
    ...overrides,
  };
}

/** Creates an artifact and fails the test rather than the assertion if it was not stored. */
async function create(
  overrides: Partial<ArtifactDraft> = {},
  options: ArtifactMutationOptions = {},
): Promise<Artifact> {
  const result = await createArtifact(KINDS, draft(overrides), options);
  if (!result.ok) {
    throw new Error(`expected a stored artifact, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

/** The summary as the database holds it, rather than as memory remembers it. */
async function storedSummary(id: string): Promise<ArtifactSummary | undefined> {
  const records = await readAllArtifactRecords();
  const stored = records.ok ? records.value : [];
  return stored.find((record) => (record as ArtifactSummary).id === id) as
    | ArtifactSummary
    | undefined;
}

async function storedPayload(id: string): Promise<unknown> {
  const record = await readArtifactPayloadRecord(id);
  return record.ok && record.value !== undefined ? record.value.payload : undefined;
}

describe('newArtifactId', () => {
  it('uses crypto.randomUUID where it exists', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-from-crypto' });
    expect(newArtifactId()).toBe('uuid-from-crypto');
  });

  it('falls back to a generated id where randomUUID is absent', () => {
    vi.stubGlobal('crypto', {});
    const first = newArtifactId();
    expect(first).toMatch(/^artifact-/);
    expect(newArtifactId()).not.toBe(first);
  });
});

describe('createArtifact', () => {
  it('stores an artifact of any registered kind and survives a reload', async () => {
    const artifact = await create({}, { id: 'artifact-1', now: 100 });

    expect(artifact).toEqual({
      id: 'artifact-1',
      projectId: 'project-1',
      kind: 'note',
      name: 'Ashfall',
      tags: [],
      references: [],
      payload: { title: 'Ashfall' },
      payloadVersion: 1,
      byteSize: 19,
      createdAt: 100,
      updatedAt: 100,
    });

    await reload();
    expect(getArtifactSummary('project-1', 'artifact-1')?.name).toBe('Ashfall');
    expect(await storedPayload('artifact-1')).toEqual({ title: 'Ashfall' });
  });

  it('records the payload version and size on the summary, where a listing can read them', async () => {
    await create({ payload: { title: 'Dolmenwood' } }, { id: 'artifact-1' });

    const stored = await storedSummary('artifact-1');
    expect(stored?.payloadVersion).toBe(1);
    expect(stored?.byteSize).toBe(22);
  });

  it('names an artifact from the kind when the caller does not', async () => {
    expect((await create({ payload: { title: 'Dolmenwood' } })).name).toBe('Dolmenwood');
  });

  it('falls back to the kind display name when the payload yields none', async () => {
    expect((await create({ payload: { title: '  ' } })).name).toBe('Note (note)');
  });

  it('prefers a supplied name, trimmed', async () => {
    expect((await create({ name: '  My notes  ' })).name).toBe('My notes');
  });

  it('normalizes tags and references', async () => {
    const artifact = await create({
      tags: ['  worlds ', 'worlds', '', 'draft'],
      references: [
        { targetId: ' artifact-2 ', targetKind: 'note', role: ' sequel ' },
        { targetId: 'artifact-2', targetKind: 'note', role: 'sequel' },
        { targetId: 'artifact-3', targetKind: 'note', role: '' },
        { targetId: '', targetKind: 'note', role: 'prequel' },
      ],
    });

    expect(artifact.tags).toEqual(['worlds', 'draft']);
    expect(artifact.references).toEqual([
      { targetId: 'artifact-2', targetKind: 'note', role: 'sequel' },
    ]);
  });

  it('keeps provenance as given, defaulting only an absent config', async () => {
    const provenance: ArtifactProvenance = {
      toolPath: '/culture',
      seed: 'seed-1',
      config: { size: 3 },
    };
    expect((await create({ provenance })).provenance).toEqual(provenance);

    const bare = { toolPath: '/culture', seed: 'seed-1' } as unknown as ArtifactProvenance;
    expect((await create({ provenance: bare })).provenance).toEqual({
      toolPath: '/culture',
      seed: 'seed-1',
      config: {},
    });
  });

  it('leaves provenance absent rather than inventing one', async () => {
    expect(await create()).not.toHaveProperty('provenance');
  });

  it('separates when it was first made from when it was written here', async () => {
    const artifact = await create({}, { id: 'artifact-1', now: 500, createdAt: 20 });
    expect(artifact.createdAt).toBe(20);
    expect(artifact.updatedAt).toBe(500);
  });

  it('rejects an unknown kind without writing anything', async () => {
    const result = await createArtifact(KINDS, draft({ kind: 'starship.swn' }));
    expect(result).toEqual({
      ok: false,
      reason: 'unknown-kind',
      message: 'no artifact kind registered as "starship.swn"',
    });
    expect(listArtifacts('project-1')).toEqual([]);
    expect(await readAllArtifactRecords()).toEqual({ ok: true, value: [] });
  });

  it('rejects a payload the kind refuses without writing anything', async () => {
    const result = await createArtifact(KINDS, draft({ payload: { titel: 'typo' } }));
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
    expect(await readAllArtifactRecords()).toEqual({ ok: true, value: [] });
  });

  it('refuses a reused id rather than overwriting the payload it belongs to', async () => {
    await create({}, { id: 'artifact-1' });

    await expect(createArtifact(KINDS, draft(), { id: 'artifact-1' })).rejects.toThrow(
      /already in use/,
    );
    // Including from another project: summaries are keyed by their own id, vault-wide.
    await expect(
      createArtifact(KINDS, draft({ projectId: 'project-2' }), { id: 'artifact-1' }),
    ).rejects.toThrow(/already in use/);
    expect(await storedPayload('artifact-1')).toEqual({ title: 'Ashfall' });
    expect(listArtifacts('project-2')).toEqual([]);
  });

  it('throws for a draft with no project, which is a bug in the caller', async () => {
    await expect(createArtifact(KINDS, draft({ projectId: '  ' }))).rejects.toThrow(/project id/);
  });

  it('reports a refused write instead of pretending it saved', async () => {
    await create({}, { id: 'artifact-1' });
    refuseTheDatabase();

    const result = await createArtifact(KINDS, draft(), { id: 'artifact-2' });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('storage-failed');
    // The hydrated index is not updated until the transaction commits, so memory does not claim a
    // save the database never took.
    expect(listArtifacts('project-1').map((summary) => summary.id)).toEqual(['artifact-1']);
  });
});

describe('listing', () => {
  it('lists a project most recently updated first, breaking ties by name then id', async () => {
    await create({ name: 'Older' }, { id: 'a', now: 100 });
    await create({ name: 'Bravo' }, { id: 'c', now: 300 });
    await create({ name: 'Alpha' }, { id: 'b', now: 300 });

    expect(listArtifacts('project-1').map((summary) => summary.id)).toEqual(['b', 'c', 'a']);
  });

  it('keeps projects apart', async () => {
    await create({}, { id: 'a' });
    await create({ projectId: 'project-2' }, { id: 'b' });

    expect(listArtifacts('project-1').map((s) => s.id)).toEqual(['a']);
    expect(listArtifacts('project-2').map((s) => s.id)).toEqual(['b']);
    expect(listArtifacts('project-3')).toEqual([]);
    expect(getArtifactSummary('project-2', 'a')).toBeUndefined();
  });

  it('lists by kind', async () => {
    await create({}, { id: 'a' });
    await create({ kind: 'sketch' }, { id: 'b' });

    expect(listArtifactsOfKind('project-1', 'sketch').map((s) => s.id)).toEqual(['b']);
    expect(listArtifactsOfKind('project-1', 'note').map((s) => s.id)).toEqual(['a']);
    expect(listArtifactsOfKind('project-1', 'culture')).toEqual([]);
  });

  it('is empty before anything has been hydrated, rather than blocking on a read', async () => {
    await create({}, { id: 'a' });
    resetArtifactIndex();

    expect(listArtifacts('project-1')).toEqual([]);
    await hydrateArtifacts();
    expect(listArtifacts('project-1').map((s) => s.id)).toEqual(['a']);
  });
});

describe('readArtifact', () => {
  it('hands back a stored artifact', async () => {
    await create({}, { id: 'artifact-1', now: 100 });

    const result = await readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(true);
    expect(result?.ok === true && result.artifact.payload).toEqual({ title: 'Ashfall' });
    expect(result?.ok === true && result.migrated).toBe(false);
  });

  it('is undefined for an artifact that is not in that project', async () => {
    await create({}, { id: 'artifact-1' });
    expect(await readArtifact(KINDS, 'project-1', 'nope')).toBeUndefined();
    expect(await readArtifact(KINDS, 'project-2', 'artifact-1')).toBeUndefined();
  });

  it('migrates a payload stored at an older version, without writing it back', async () => {
    await create({}, { id: 'artifact-1' });
    const laterBuild = registryOf(noteKindV2());

    const result = await readArtifact(laterBuild, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(true);
    expect(result?.ok === true && result.artifact.payload).toEqual({ title: 'Ashfall', body: '' });
    expect(result?.ok === true && result.artifact.payloadVersion).toBe(2);
    expect(result?.ok === true && result.migrated).toBe(true);
    // Storage is untouched: a read must not be the operation that fills a full disk.
    expect((await storedSummary('artifact-1'))?.payloadVersion).toBe(1);
  });

  it('reports a payload from a newer build rather than guessing at it', async () => {
    const artifact = await create({}, { id: 'artifact-1' });
    const fromANewerBuild = { ...artifact, payloadVersion: 9 };
    await writeArtifactRecord(fromANewerBuild, { title: 'From the future' });
    await reload();

    const result = await readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('unsupported-version');
    expect(result?.ok === false && result.summary.name).toBe('Ashfall');
  });

  it('reports a failed migration and keeps the artifact visible', async () => {
    await createArtifact(registryOf(noteKind('broken')), draft({ kind: 'broken' }), {
      id: 'artifact-1',
    });

    const result = await readArtifact(registryOf(brokenMigrationKind()), 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('migration-failed');
    expect(result?.ok === false && result.summary.id).toBe('artifact-1');
  });

  it('reports a kind this build does not have, and still shows the summary', async () => {
    await create({}, { id: 'artifact-1' });

    const result = await readArtifact(registryOf(noteKind('sketch')), 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('unknown-kind');
    expect(result?.ok === false && result.summary.name).toBe('Ashfall');
  });

  it('reports a summary whose payload record is gone', async () => {
    const artifact = await create({}, { id: 'artifact-1' });
    // A summary with no payload beside it: what adoption leaves when the old payload entry was
    // already missing.
    await writeArtifactSummaryRecord({ ...artifact, id: 'artifact-2' });
    await reload();

    const result = await readArtifact(KINDS, 'project-1', 'artifact-2');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('invalid-payload');
  });

  it('reports a payload that no longer matches its kind', async () => {
    const artifact = await create({}, { id: 'artifact-1' });
    await writeArtifactRecord(artifact, { corrupted: true });

    const result = await readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok === false && result.reason).toBe('invalid-payload');
  });

  it('reports a database it could not reach, rather than an artifact that is not there', async () => {
    await create({}, { id: 'artifact-1' });
    refuseTheDatabase();

    const result = await readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('storage-failed');
    expect(result?.ok === false && result.summary.name).toBe('Ashfall');
  });
});

describe('updateArtifactPayload', () => {
  it('replaces the payload and moves updatedAt', async () => {
    await create({}, { id: 'artifact-1', now: 100 });

    const result = await updateArtifactPayload(
      KINDS,
      'project-1',
      'artifact-1',
      { title: 'Ashfall Revised' },
      { now: 200 },
    );

    expect(result?.ok).toBe(true);
    expect(result?.ok === true && result.value.updatedAt).toBe(200);
    expect(result?.ok === true && result.value.createdAt).toBe(100);
    expect(await storedPayload('artifact-1')).toEqual({ title: 'Ashfall Revised' });
    expect(getArtifactSummary('project-1', 'artifact-1')?.updatedAt).toBe(200);
  });

  it('re-measures the payload, so the storage panel does not report a stale size', async () => {
    await create({}, { id: 'artifact-1' });

    await updateArtifactPayload(KINDS, 'project-1', 'artifact-1', {
      title: 'A considerably longer title',
    });

    expect(getArtifactSummary('project-1', 'artifact-1')?.byteSize).toBe(39);
  });

  it('stores an edit at the current version, which is what ends a migration', async () => {
    await create({}, { id: 'artifact-1' });
    const laterBuild = registryOf(noteKindV2());

    await updateArtifactPayload(laterBuild, 'project-1', 'artifact-1', {
      title: 'Ashfall',
      body: 'Ash',
    });

    expect((await storedSummary('artifact-1'))?.payloadVersion).toBe(2);
    const result = await readArtifact(laterBuild, 'project-1', 'artifact-1');
    expect(result?.ok === true && result.migrated).toBe(false);
  });

  it('is undefined for an artifact that is not there', async () => {
    expect(await updateArtifactPayload(KINDS, 'project-1', 'nope', { title: 'x' })).toBeUndefined();
  });

  it('rejects a payload the kind refuses and leaves the stored one alone', async () => {
    await create({}, { id: 'artifact-1' });

    const result = await updateArtifactPayload(KINDS, 'project-1', 'artifact-1', {
      titel: 'typo',
    });
    expect(result?.ok).toBe(false);
    expect(await storedPayload('artifact-1')).toEqual({ title: 'Ashfall' });
  });

  it('rejects an edit to a kind this build does not have', async () => {
    await create({}, { id: 'artifact-1' });

    const result = await updateArtifactPayload(
      registryOf(noteKind('sketch')),
      'project-1',
      'artifact-1',
      { title: 'x' },
    );
    expect(result?.ok === false && result.reason).toBe('unknown-kind');
  });

  it('reports a refused write and leaves memory agreeing with the database', async () => {
    await create({}, { id: 'artifact-1', now: 100 });
    refuseTheDatabase();

    const result = await updateArtifactPayload(
      KINDS,
      'project-1',
      'artifact-1',
      { title: 'Never saved' },
      { now: 200 },
    );

    expect(result?.ok === false && result.reason).toBe('storage-failed');
    expect(getArtifactSummary('project-1', 'artifact-1')?.updatedAt).toBe(100);
  });
});

describe('metadata edits', () => {
  it('renames without touching the payload record', async () => {
    await create({}, { id: 'artifact-1', now: 100 });

    const renamed = await renameArtifact('project-1', 'artifact-1', 'The Ashfall notes', {
      now: 200,
    });

    expect(renamed?.ok === true && renamed.value.name).toBe('The Ashfall notes');
    expect(renamed?.ok === true && renamed.value.updatedAt).toBe(200);
    expect(await storedPayload('artifact-1')).toEqual({ title: 'Ashfall' });
  });

  it('keeps the existing name when a rename is blank', async () => {
    await create({}, { id: 'artifact-1', now: 100 });
    const renamed = await renameArtifact('project-1', 'artifact-1', '   ', { now: 200 });
    expect(renamed?.ok === true && renamed.value.name).toBe('Ashfall');
    expect(renamed?.ok === true && renamed.value.updatedAt).toBe(100);
  });

  it('tags and clears tags', async () => {
    await create({}, { id: 'artifact-1', now: 100 });

    const tagged = await tagArtifact('project-1', 'artifact-1', ['worlds', 'worlds'], { now: 200 });
    expect(tagged?.ok === true && tagged.value.tags).toEqual(['worlds']);
    const cleared = await tagArtifact('project-1', 'artifact-1', [], { now: 300 });
    expect(cleared?.ok === true && cleared.value.tags).toEqual([]);
    expect(getArtifactSummary('project-1', 'artifact-1')?.updatedAt).toBe(300);
  });

  it('leaves updatedAt alone, and writes nothing, when nothing actually changed', async () => {
    await create({ tags: ['worlds'] }, { id: 'artifact-1', now: 100 });

    const unchanged = await updateArtifact(
      'project-1',
      'artifact-1',
      { name: 'Ashfall', tags: ['worlds'] },
      { now: 999 },
    );
    expect(unchanged?.ok === true && unchanged.value.updatedAt).toBe(100);
  });

  it('leaves an omitted field alone', async () => {
    await create({ tags: ['worlds'], name: 'Ashfall' }, { id: 'artifact-1', now: 100 });

    const updated = await updateArtifact(
      'project-1',
      'artifact-1',
      { name: 'Ember' },
      { now: 200 },
    );
    expect(updated?.ok === true && updated.value.tags).toEqual(['worlds']);
  });

  it('is undefined for an artifact that is not in that project', async () => {
    await create({}, { id: 'artifact-1' });
    expect(await renameArtifact('project-1', 'nope', 'x')).toBeUndefined();
    expect(await renameArtifact('project-2', 'artifact-1', 'x')).toBeUndefined();
  });
});

describe('references', () => {
  it('records references and reports what points at an artifact', async () => {
    const target = await create({ name: 'Ashfall' }, { id: 'culture-1' });
    await create({ name: 'Emberhold' }, { id: 'settlement-1', now: 200 });
    await create({ name: 'Ashmoor' }, { id: 'settlement-2', now: 100 });

    await setArtifactReferences(
      'project-1',
      'settlement-1',
      [{ targetId: target.id, targetKind: 'note', role: 'culture' }],
      { now: 400 },
    );
    await setArtifactReferences(
      'project-1',
      'settlement-2',
      [{ targetId: target.id, targetKind: 'note', role: 'culture' }],
      { now: 300 },
    );

    expect(listArtifactReferrers('project-1', 'culture-1').map((s) => s.id)).toEqual([
      'settlement-1',
      'settlement-2',
    ]);
    expect(listArtifactReferrers('project-1', 'settlement-1')).toEqual([]);
  });

  it('tolerates a reference to an artifact that is not there', async () => {
    await create({}, { id: 'artifact-1' });
    const updated = await setArtifactReferences('project-1', 'artifact-1', [
      { targetId: 'deleted-thing', targetKind: 'note', role: 'culture' },
    ]);
    expect(updated?.ok === true && updated.value.references).toEqual([
      { targetId: 'deleted-thing', targetKind: 'note', role: 'culture' },
    ]);
  });

  it('does not walk a cycle', async () => {
    await create({}, { id: 'a' });
    await create({}, { id: 'b' });
    await setArtifactReferences('project-1', 'a', [
      { targetId: 'b', targetKind: 'note', role: 'ruler' },
    ]);
    await setArtifactReferences('project-1', 'b', [
      { targetId: 'a', targetKind: 'note', role: 'realm' },
    ]);

    expect(listArtifactReferrers('project-1', 'a').map((s) => s.id)).toEqual(['b']);
    expect(listArtifactReferrers('project-1', 'b').map((s) => s.id)).toEqual(['a']);
  });
});

describe('deleteArtifact', () => {
  it('removes the summary and the payload', async () => {
    await create({}, { id: 'artifact-1' });

    const deletion = await deleteArtifact('project-1', 'artifact-1');

    expect(deletion).toEqual({
      ok: true,
      value: { deleted: true, id: 'artifact-1', referrers: [] },
    });
    expect(listArtifacts('project-1')).toEqual([]);
    expect(await storedPayload('artifact-1')).toBeUndefined();
    expect(await readArtifact(KINDS, 'project-1', 'artifact-1')).toBeUndefined();
  });

  it('reports what pointed at it and deletes anyway', async () => {
    await create({}, { id: 'culture-1' });
    await create({ name: 'Emberhold' }, { id: 'settlement-1' });
    await setArtifactReferences('project-1', 'settlement-1', [
      { targetId: 'culture-1', targetKind: 'note', role: 'culture' },
    ]);

    const deletion = await deleteArtifact('project-1', 'culture-1');

    expect(deletion.ok === true && deletion.value.deleted).toBe(true);
    expect(deletion.ok === true && deletion.value.referrers.map((summary) => summary.id)).toEqual([
      'settlement-1',
    ]);
    // The dangling reference is left as it is, to be surfaced as broken rather than repaired here.
    expect(getArtifactSummary('project-1', 'settlement-1')?.references).toEqual([
      { targetId: 'culture-1', targetKind: 'note', role: 'culture' },
    ]);
  });

  it('reports nothing deleted for an artifact that is not in that project', async () => {
    await create({}, { id: 'artifact-1' });

    const wrongProject = await deleteArtifact('project-2', 'artifact-1');
    const noSuchId = await deleteArtifact('project-1', 'nope');

    expect(wrongProject.ok === true && wrongProject.value.deleted).toBe(false);
    expect(noSuchId.ok === true && noSuchId.value.deleted).toBe(false);
    expect(await storedPayload('artifact-1')).toEqual({ title: 'Ashfall' });
  });

  it('reports a refused delete, and keeps the artifact listed', async () => {
    await create({}, { id: 'artifact-1' });
    refuseTheDatabase();

    const deletion = await deleteArtifact('project-1', 'artifact-1');

    expect(deletion.ok === false && deletion.reason).toBe('storage-failed');
    expect(listArtifacts('project-1').map((s) => s.id)).toEqual(['artifact-1']);
  });
});

/**
 * The store announcing what it committed, which is what lets a project view and a generator in
 * another panel stay in step without either knowing the other exists. The mechanism itself is
 * covered in `artifact_events.test.ts`; what is checked here is that every write reaches it, and
 * that a write which stored nothing stays quiet.
 */
describe('change notifications', () => {
  let changes: ArtifactChange[] = [];
  let unsubscribe: () => void = () => {};

  beforeEach(() => {
    changes = [];
    unsubscribe = onArtifactsChanged((change) => changes.push(change));
  });

  afterEach(() => {
    unsubscribe();
    resetArtifactChangeListeners();
  });

  it('announces a created artifact', async () => {
    const artifact = await create();

    expect(changes).toEqual([
      { change: 'created', projectId: 'project-1', artifactId: artifact.id },
    ]);
  });

  it('announces a new payload', async () => {
    const artifact = await create();
    changes = [];

    await updateArtifactPayload(KINDS, 'project-1', artifact.id, { title: 'Ashfall Revised' });

    expect(changes).toEqual([
      { change: 'updated', projectId: 'project-1', artifactId: artifact.id },
    ]);
  });

  it('announces a metadata edit', async () => {
    const artifact = await create();
    changes = [];

    await renameArtifact('project-1', artifact.id, 'Renamed');

    expect(changes).toEqual([
      { change: 'updated', projectId: 'project-1', artifactId: artifact.id },
    ]);
  });

  it('announces a delete', async () => {
    const artifact = await create();
    changes = [];

    await deleteArtifact('project-1', artifact.id);

    expect(changes).toEqual([
      { change: 'deleted', projectId: 'project-1', artifactId: artifact.id },
    ]);
  });

  it('says nothing when an edit changed nothing', async () => {
    const artifact = await create();
    changes = [];

    await renameArtifact('project-1', artifact.id, artifact.name);

    expect(changes).toEqual([]);
  });

  it('says nothing when there was nothing to delete', async () => {
    await deleteArtifact('project-1', 'never-existed');

    expect(changes).toEqual([]);
  });

  it('says nothing when the database refused the write', async () => {
    refuseTheDatabase();

    await createArtifact(KINDS, draft());

    expect(changes).toEqual([]);
  });
});
