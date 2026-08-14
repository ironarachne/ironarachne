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
  artifactIndexScopeId,
  readArtifactIndex,
  readArtifactPayloadRecord,
  writeArtifactPayloadRecord,
} from './artifact_saved_state';
import {
  createArtifact,
  deleteArtifact,
  deleteProjectArtifacts,
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
  ArtifactDraft,
  ArtifactMutationOptions,
  ArtifactProvenance,
} from './artifact_types';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    get length() {
      return store.size;
    },
    key: (i: number) => [...store.keys()][i] ?? null,
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

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

/** Creates an artifact and fails the test rather than the assertion if the kind refused it. */
function create(
  overrides: Partial<ArtifactDraft> = {},
  options: ArtifactMutationOptions = {},
): Artifact {
  const result = createArtifact(KINDS, draft(overrides), options);
  if (!result.ok) {
    throw new Error(`expected a stored artifact, got ${result.reason}: ${result.message}`);
  }
  return result.value;
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
  it('stores an artifact of any registered kind and survives a reload', () => {
    const artifact = create({}, { id: 'artifact-1', now: 100 });

    expect(artifact).toEqual({
      id: 'artifact-1',
      projectId: 'project-1',
      kind: 'note',
      name: 'Ashfall',
      tags: [],
      references: [],
      payload: { title: 'Ashfall' },
      payloadVersion: 1,
      createdAt: 100,
      updatedAt: 100,
    });
    // Nothing is cached in memory: a fresh read goes back to storage, as a reload would.
    expect(getArtifactSummary('project-1', 'artifact-1')?.name).toBe('Ashfall');
    expect(readArtifactPayloadRecord('artifact-1')).toEqual({
      storeVersion: 1,
      payloadVersion: 1,
      payload: { title: 'Ashfall' },
    });
  });

  it('names an artifact from the kind when the caller does not', () => {
    expect(create({ payload: { title: 'Dolmenwood' } }).name).toBe('Dolmenwood');
  });

  it('falls back to the kind display name when the payload yields none', () => {
    expect(create({ payload: { title: '  ' } }).name).toBe('Note (note)');
  });

  it('prefers a supplied name, trimmed', () => {
    expect(create({ name: '  My notes  ' }).name).toBe('My notes');
  });

  it('normalizes tags and references', () => {
    const artifact = create({
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

  it('keeps provenance as given, defaulting only an absent config', () => {
    const provenance: ArtifactProvenance = {
      toolPath: '/culture',
      seed: 'seed-1',
      config: { size: 3 },
    };
    expect(create({ provenance }).provenance).toEqual(provenance);

    const bare = { toolPath: '/culture', seed: 'seed-1' } as unknown as ArtifactProvenance;
    expect(create({ provenance: bare }).provenance).toEqual({
      toolPath: '/culture',
      seed: 'seed-1',
      config: {},
    });
  });

  it('leaves provenance absent rather than inventing one', () => {
    expect(create()).not.toHaveProperty('provenance');
  });

  it('separates when it was first made from when it was written here', () => {
    const artifact = create({}, { id: 'artifact-1', now: 500, createdAt: 20 });
    expect(artifact.createdAt).toBe(20);
    expect(artifact.updatedAt).toBe(500);
  });

  it('rejects an unknown kind without writing anything', () => {
    const result = createArtifact(KINDS, draft({ kind: 'starship.swn' }));
    expect(result).toEqual({
      ok: false,
      reason: 'unknown-kind',
      message: 'no artifact kind registered as "starship.swn"',
    });
    expect(listArtifacts('project-1')).toEqual([]);
    expect(store.size).toBe(0);
  });

  it('rejects a payload the kind refuses without writing anything', () => {
    const result = createArtifact(KINDS, draft({ payload: { titel: 'typo' } }));
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
    expect(store.size).toBe(0);
  });

  it('refuses a reused id rather than overwriting the payload it belongs to', () => {
    create({}, { id: 'artifact-1' });

    expect(() => createArtifact(KINDS, draft(), { id: 'artifact-1' })).toThrow(/already in use/);
    // Including from another project: the index is per project, but payload keys are not.
    expect(() =>
      createArtifact(KINDS, draft({ projectId: 'project-2' }), { id: 'artifact-1' }),
    ).toThrow(/already in use/);
    expect(readArtifactPayloadRecord('artifact-1')?.payload).toEqual({ title: 'Ashfall' });
    expect(listArtifacts('project-2')).toEqual([]);
  });

  it('throws for a draft with no project, which is a bug in the caller', () => {
    expect(() => createArtifact(KINDS, draft({ projectId: '  ' }))).toThrow(/project id/);
  });

  it('leaves nothing behind when the index write is refused', () => {
    const artifact = create({}, { id: 'artifact-1' });
    const failing = new Error('QuotaExceededError');
    const setItem = vi.fn((key: string, value: string) => {
      if (key.includes(artifactIndexScopeId('project-2'))) {
        throw failing;
      }
      store.set(key, value);
    });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem,
      removeItem: (key: string) => {
        store.delete(key);
      },
    });

    expect(() =>
      createArtifact(KINDS, draft({ projectId: 'project-2' }), { id: 'artifact-2' }),
    ).toThrow(failing);
    // The payload written first is rolled back, so no payload is left with nothing pointing at it.
    expect(readArtifactPayloadRecord('artifact-2')).toBeNull();
    expect(readArtifactPayloadRecord(artifact.id)).not.toBeNull();
  });
});

describe('listing', () => {
  it('lists a project most recently updated first, breaking ties by name then id', () => {
    create({ name: 'Older' }, { id: 'a', now: 100 });
    create({ name: 'Bravo' }, { id: 'c', now: 300 });
    create({ name: 'Alpha' }, { id: 'b', now: 300 });

    expect(listArtifacts('project-1').map((summary) => summary.id)).toEqual(['b', 'c', 'a']);
  });

  it('keeps projects apart', () => {
    create({}, { id: 'a' });
    create({ projectId: 'project-2' }, { id: 'b' });

    expect(listArtifacts('project-1').map((s) => s.id)).toEqual(['a']);
    expect(listArtifacts('project-2').map((s) => s.id)).toEqual(['b']);
    expect(listArtifacts('project-3')).toEqual([]);
    expect(getArtifactSummary('project-2', 'a')).toBeUndefined();
  });

  it('lists by kind', () => {
    create({}, { id: 'a' });
    create({ kind: 'sketch' }, { id: 'b' });

    expect(listArtifactsOfKind('project-1', 'sketch').map((s) => s.id)).toEqual(['b']);
    expect(listArtifactsOfKind('project-1', 'note').map((s) => s.id)).toEqual(['a']);
    expect(listArtifactsOfKind('project-1', 'culture')).toEqual([]);
  });
});

describe('readArtifact', () => {
  it('hands back a stored artifact', () => {
    create({}, { id: 'artifact-1', now: 100 });

    const result = readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(true);
    expect(result?.ok === true && result.artifact.payload).toEqual({ title: 'Ashfall' });
    expect(result?.ok === true && result.migrated).toBe(false);
  });

  it('is undefined for an artifact that is not in that project', () => {
    create({}, { id: 'artifact-1' });
    expect(readArtifact(KINDS, 'project-1', 'nope')).toBeUndefined();
    expect(readArtifact(KINDS, 'project-2', 'artifact-1')).toBeUndefined();
  });

  it('migrates a payload stored at an older version, without writing it back', () => {
    create({}, { id: 'artifact-1' });
    const laterBuild = registryOf(noteKindV2());

    const result = readArtifact(laterBuild, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(true);
    expect(result?.ok === true && result.artifact.payload).toEqual({ title: 'Ashfall', body: '' });
    expect(result?.ok === true && result.artifact.payloadVersion).toBe(2);
    expect(result?.ok === true && result.migrated).toBe(true);
    // Storage is untouched: a read must not be the operation that fills a full disk.
    expect(readArtifactPayloadRecord('artifact-1')?.payloadVersion).toBe(1);
  });

  it('reports a payload from a newer build rather than guessing at it', () => {
    create({}, { id: 'artifact-1' });
    writeArtifactPayloadRecord('artifact-1', 9, { title: 'From the future' });

    const result = readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('unsupported-version');
    expect(result?.ok === false && result.summary.name).toBe('Ashfall');
  });

  it('reports a failed migration and keeps the artifact visible', () => {
    const registry = registryOf(brokenMigrationKind());
    createArtifact(registryOf(noteKind('broken')), draft({ kind: 'broken' }), { id: 'artifact-1' });

    const result = readArtifact(registry, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('migration-failed');
    expect(result?.ok === false && result.summary.id).toBe('artifact-1');
  });

  it('reports a kind this build does not have, and still shows the summary', () => {
    create({}, { id: 'artifact-1' });

    const result = readArtifact(registryOf(noteKind('sketch')), 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('unknown-kind');
    expect(result?.ok === false && result.summary.name).toBe('Ashfall');
  });

  it('reports a summary whose payload entry is gone', () => {
    create({}, { id: 'artifact-1' });
    store.delete(`ironarachne.save.v1.workshop.artifact.artifact-1`);

    const result = readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe('invalid-payload');
  });

  it('reports a payload that no longer matches its kind', () => {
    create({}, { id: 'artifact-1' });
    writeArtifactPayloadRecord('artifact-1', 1, { corrupted: true });

    const result = readArtifact(KINDS, 'project-1', 'artifact-1');
    expect(result?.ok === false && result.reason).toBe('invalid-payload');
  });
});

describe('updateArtifactPayload', () => {
  it('replaces the payload and moves updatedAt', () => {
    create({}, { id: 'artifact-1', now: 100 });

    const result = updateArtifactPayload(
      KINDS,
      'project-1',
      'artifact-1',
      { title: 'Ashfall Revised' },
      { now: 200 },
    );

    expect(result?.ok).toBe(true);
    expect(result?.ok === true && result.value.updatedAt).toBe(200);
    expect(result?.ok === true && result.value.createdAt).toBe(100);
    expect(readArtifactPayloadRecord('artifact-1')?.payload).toEqual({ title: 'Ashfall Revised' });
    expect(getArtifactSummary('project-1', 'artifact-1')?.updatedAt).toBe(200);
  });

  it('stores an edit at the current version, which is what ends a migration', () => {
    create({}, { id: 'artifact-1' });
    const laterBuild = registryOf(noteKindV2());

    updateArtifactPayload(laterBuild, 'project-1', 'artifact-1', { title: 'Ashfall', body: 'Ash' });

    expect(readArtifactPayloadRecord('artifact-1')?.payloadVersion).toBe(2);
    const result = readArtifact(laterBuild, 'project-1', 'artifact-1');
    expect(result?.ok === true && result.migrated).toBe(false);
  });

  it('is undefined for an artifact that is not there', () => {
    expect(updateArtifactPayload(KINDS, 'project-1', 'nope', { title: 'x' })).toBeUndefined();
  });

  it('rejects a payload the kind refuses and leaves the stored one alone', () => {
    create({}, { id: 'artifact-1' });

    const result = updateArtifactPayload(KINDS, 'project-1', 'artifact-1', { titel: 'typo' });
    expect(result?.ok).toBe(false);
    expect(readArtifactPayloadRecord('artifact-1')?.payload).toEqual({ title: 'Ashfall' });
  });

  it('rejects an edit to a kind this build does not have', () => {
    create({}, { id: 'artifact-1' });

    const result = updateArtifactPayload(
      registryOf(noteKind('sketch')),
      'project-1',
      'artifact-1',
      { title: 'x' },
    );
    expect(result?.ok === false && result.reason).toBe('unknown-kind');
  });
});

describe('metadata edits', () => {
  it('renames without touching the payload entry', () => {
    create({}, { id: 'artifact-1', now: 100 });
    const before = store.get('ironarachne.save.v1.workshop.artifact.artifact-1');

    const renamed = renameArtifact('project-1', 'artifact-1', 'The Ashfall notes', { now: 200 });

    expect(renamed?.name).toBe('The Ashfall notes');
    expect(renamed?.updatedAt).toBe(200);
    expect(store.get('ironarachne.save.v1.workshop.artifact.artifact-1')).toBe(before);
  });

  it('keeps the existing name when a rename is blank', () => {
    create({}, { id: 'artifact-1', now: 100 });
    const renamed = renameArtifact('project-1', 'artifact-1', '   ', { now: 200 });
    expect(renamed?.name).toBe('Ashfall');
    expect(renamed?.updatedAt).toBe(100);
  });

  it('tags and clears tags', () => {
    create({}, { id: 'artifact-1', now: 100 });

    expect(
      tagArtifact('project-1', 'artifact-1', ['worlds', 'worlds'], { now: 200 })?.tags,
    ).toEqual(['worlds']);
    expect(tagArtifact('project-1', 'artifact-1', [], { now: 300 })?.tags).toEqual([]);
    expect(getArtifactSummary('project-1', 'artifact-1')?.updatedAt).toBe(300);
  });

  it('leaves updatedAt alone when nothing actually changed', () => {
    create({ tags: ['worlds'] }, { id: 'artifact-1', now: 100 });

    const unchanged = updateArtifact(
      'project-1',
      'artifact-1',
      { name: 'Ashfall', tags: ['worlds'] },
      { now: 999 },
    );
    expect(unchanged?.updatedAt).toBe(100);
  });

  it('leaves an omitted field alone', () => {
    create({ tags: ['worlds'], name: 'Ashfall' }, { id: 'artifact-1', now: 100 });

    const updated = updateArtifact('project-1', 'artifact-1', { name: 'Ember' }, { now: 200 });
    expect(updated?.tags).toEqual(['worlds']);
  });

  it('is undefined for an artifact that is not in that project', () => {
    create({}, { id: 'artifact-1' });
    expect(renameArtifact('project-1', 'nope', 'x')).toBeUndefined();
    expect(renameArtifact('project-2', 'artifact-1', 'x')).toBeUndefined();
  });
});

describe('references', () => {
  it('records references and reports what points at an artifact', () => {
    const target = create({ name: 'Ashfall' }, { id: 'culture-1' });
    create({ name: 'Emberhold' }, { id: 'settlement-1', now: 200 });
    create({ name: 'Ashmoor' }, { id: 'settlement-2', now: 100 });

    setArtifactReferences(
      'project-1',
      'settlement-1',
      [{ targetId: target.id, targetKind: 'note', role: 'culture' }],
      { now: 400 },
    );
    setArtifactReferences(
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

  it('tolerates a reference to an artifact that is not there', () => {
    create({}, { id: 'artifact-1' });
    const updated = setArtifactReferences('project-1', 'artifact-1', [
      { targetId: 'deleted-thing', targetKind: 'note', role: 'culture' },
    ]);
    expect(updated?.references).toEqual([
      { targetId: 'deleted-thing', targetKind: 'note', role: 'culture' },
    ]);
  });

  it('does not walk a cycle', () => {
    create({}, { id: 'a' });
    create({}, { id: 'b' });
    setArtifactReferences('project-1', 'a', [{ targetId: 'b', targetKind: 'note', role: 'ruler' }]);
    setArtifactReferences('project-1', 'b', [{ targetId: 'a', targetKind: 'note', role: 'realm' }]);

    expect(listArtifactReferrers('project-1', 'a').map((s) => s.id)).toEqual(['b']);
    expect(listArtifactReferrers('project-1', 'b').map((s) => s.id)).toEqual(['a']);
  });
});

describe('deleteArtifact', () => {
  it('removes the summary and the payload', () => {
    create({}, { id: 'artifact-1' });

    expect(deleteArtifact('project-1', 'artifact-1')).toEqual({
      deleted: true,
      id: 'artifact-1',
      referrers: [],
    });
    expect(listArtifacts('project-1')).toEqual([]);
    expect(readArtifactPayloadRecord('artifact-1')).toBeNull();
    expect(readArtifact(KINDS, 'project-1', 'artifact-1')).toBeUndefined();
  });

  it('reports what pointed at it and deletes anyway', () => {
    create({}, { id: 'culture-1' });
    create({ name: 'Emberhold' }, { id: 'settlement-1' });
    setArtifactReferences('project-1', 'settlement-1', [
      { targetId: 'culture-1', targetKind: 'note', role: 'culture' },
    ]);

    const deletion = deleteArtifact('project-1', 'culture-1');

    expect(deletion.deleted).toBe(true);
    expect(deletion.referrers.map((s) => s.id)).toEqual(['settlement-1']);
    // The dangling reference is left as it is, to be surfaced as broken rather than repaired here.
    expect(getArtifactSummary('project-1', 'settlement-1')?.references).toEqual([
      { targetId: 'culture-1', targetKind: 'note', role: 'culture' },
    ]);
  });

  it('reports nothing deleted for an artifact that is not in that project', () => {
    create({}, { id: 'artifact-1' });

    expect(deleteArtifact('project-2', 'artifact-1').deleted).toBe(false);
    expect(deleteArtifact('project-1', 'nope').deleted).toBe(false);
    expect(readArtifactPayloadRecord('artifact-1')).not.toBeNull();
  });
});

describe('deleteProjectArtifacts', () => {
  it('removes every artifact in the project and nothing outside it', () => {
    create({}, { id: 'a' });
    create({ kind: 'sketch' }, { id: 'b' });
    create({ projectId: 'project-2' }, { id: 'c' });

    expect(deleteProjectArtifacts('project-1').sort()).toEqual(['a', 'b']);

    expect(readArtifactIndex('project-1').artifacts).toEqual([]);
    expect(readArtifactPayloadRecord('a')).toBeNull();
    expect(readArtifactPayloadRecord('b')).toBeNull();
    expect(listArtifacts('project-2').map((s) => s.id)).toEqual(['c']);
    expect(readArtifactPayloadRecord('c')).not.toBeNull();
  });

  it('is a no-op for a project with nothing in it', () => {
    expect(deleteProjectArtifacts('project-9')).toEqual([]);
  });
});
