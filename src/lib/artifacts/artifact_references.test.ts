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
} from '$lib/artifact_kinds';
import { closeVault } from '$lib/vault_db';

import { resetArtifactIndex } from './artifact_index';
import {
  brokenArtifactReferences,
  collectReferencedArtifacts,
  hasBrokenArtifactReferences,
  listArtifactBacklinks,
  resolveArtifactReferences,
} from './artifact_references';
import type { ArtifactReference, ArtifactSummary } from './artifact_types';
import {
  createArtifact,
  deleteArtifact,
  getArtifactSummary,
  setArtifactReferences,
} from './artifacts';

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

type Note = { title: string };

/** The smallest kind that stores anything, so these tests are about links rather than payloads. */
function noteRegistry(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(
    registry,
    defineArtifactKind<Note, Note>({
      kind: 'note',
      displayName: 'Note',
      payloadVersion: 1,
      loadCodec: async () => ({
        toSnapshot: (value: Note) => ({ ...value }),
        fromSnapshot: (snapshot: Note) => ({ ...snapshot }),
      }),
      nameOf: (snapshot) => snapshot.title,
      validate: (payload) => {
        const record = asRecord(payload);
        return record === null || typeof record.title !== 'string'
          ? rejectedPayload<Note>('invalid-payload', 'a note has a title')
          : acceptedPayload({ title: record.title });
      },
      migrate: (_payload, from) =>
        rejectedPayload<Note>('unsupported-version', `nothing at ${from}`),
    }),
  );
  return registry;
}

const KINDS = noteRegistry();

async function create(
  id: string,
  name: string,
  projectId = 'project-1',
  now = 100,
): Promise<ArtifactSummary> {
  const result = await createArtifact(
    KINDS,
    { projectId, kind: 'note', payload: { title: name }, name },
    { id, now },
  );
  if (!result.ok) {
    throw new Error(`expected a stored artifact, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

function reference(targetId: string, role: string): ArtifactReference {
  return { targetId, targetKind: 'note', role };
}

async function link(id: string, references: ArtifactReference[], projectId = 'project-1') {
  await setArtifactReferences(projectId, id, references, { now: 200 });
}

/** The artifact as the index holds it now, rather than as it was when it was created. */
function summary(id: string, projectId = 'project-1'): ArtifactSummary {
  const found = getArtifactSummary(projectId, id);
  if (found === undefined) {
    throw new Error(`no artifact "${id}" in ${projectId}`);
  }
  return found;
}

describe('resolveArtifactReferences', () => {
  it('pairs each reference with the artifact it names', async () => {
    await create('culture-1', 'Ashfall');
    await create('religion-1', 'The Ember');
    await create('settlement-1', 'Emberhold');
    await link('settlement-1', [
      reference('culture-1', 'culture'),
      reference('religion-1', 'faith'),
    ]);

    const resolved = resolveArtifactReferences('project-1', summary('settlement-1'));

    expect(resolved).toHaveLength(2);
    expect(resolved[0].reference.role).toBe('culture');
    expect(resolved[0].target?.name).toBe('Ashfall');
    expect(resolved[1].target?.name).toBe('The Ember');
  });

  it('reports a reference whose target has been deleted, in place and in order', async () => {
    await create('culture-1', 'Ashfall');
    await create('religion-1', 'The Ember');
    await create('settlement-1', 'Emberhold');
    await link('settlement-1', [
      reference('culture-1', 'culture'),
      reference('religion-1', 'faith'),
    ]);
    await deleteArtifact('project-1', 'culture-1');

    const resolved = resolveArtifactReferences('project-1', summary('settlement-1'));

    expect(resolved[0]).toEqual({ reference: reference('culture-1', 'culture') });
    expect(resolved[0].target).toBeUndefined();
    expect(resolved[1].target?.name).toBe('The Ember');
  });

  it('does not resolve a target held by another project', async () => {
    await create('culture-1', 'Ashfall', 'project-2');
    await create('settlement-1', 'Emberhold');
    await link('settlement-1', [reference('culture-1', 'culture')]);

    expect(
      resolveArtifactReferences('project-1', summary('settlement-1'))[0].target,
    ).toBeUndefined();
  });

  it('is empty for an artifact that references nothing', async () => {
    const alone = await create('artifact-1', 'Alone');
    expect(resolveArtifactReferences('project-1', alone)).toEqual([]);
  });
});

describe('brokenArtifactReferences', () => {
  it('lists only the references that point at nothing', async () => {
    await create('culture-1', 'Ashfall');
    await create('settlement-1', 'Emberhold');
    await link('settlement-1', [reference('culture-1', 'culture'), reference('gone', 'faith')]);

    expect(brokenArtifactReferences('project-1', summary('settlement-1'))).toEqual([
      reference('gone', 'faith'),
    ]);
    expect(hasBrokenArtifactReferences('project-1', summary('settlement-1'))).toBe(true);
  });

  it('finds nothing broken while every target is still there', async () => {
    await create('culture-1', 'Ashfall');
    await create('settlement-1', 'Emberhold');
    await link('settlement-1', [reference('culture-1', 'culture')]);

    expect(brokenArtifactReferences('project-1', summary('settlement-1'))).toEqual([]);
    expect(hasBrokenArtifactReferences('project-1', summary('settlement-1'))).toBe(false);
  });

  it('counts a target in another project as broken, since references are project-local', async () => {
    await create('culture-1', 'Ashfall', 'project-2');
    await create('settlement-1', 'Emberhold');
    await link('settlement-1', [reference('culture-1', 'culture')]);

    expect(hasBrokenArtifactReferences('project-1', summary('settlement-1'))).toBe(true);
  });
});

describe('listArtifactBacklinks', () => {
  it('reports every artifact that points at one', async () => {
    await create('culture-1', 'Ashfall');
    await create('settlement-1', 'Emberhold', 'project-1', 300);
    await create('region-1', 'The Ashmoor', 'project-1', 200);
    await link('settlement-1', [reference('culture-1', 'culture')]);
    await link('region-1', [reference('culture-1', 'culture')]);

    const backlinks = listArtifactBacklinks('project-1', 'culture-1');

    expect(backlinks.map((backlink) => backlink.referrer.name)).toEqual([
      'Emberhold',
      'The Ashmoor',
    ]);
    expect(backlinks[0].references).toEqual([reference('culture-1', 'culture')]);
  });

  it('groups two references from one artifact into a single backlink', async () => {
    await create('settlement-1', 'Emberhold');
    await create('region-1', 'The Ashmoor');
    await link('region-1', [
      reference('settlement-1', 'capital'),
      reference('settlement-1', 'settlement'),
    ]);

    const backlinks = listArtifactBacklinks('project-1', 'settlement-1');

    expect(backlinks).toHaveLength(1);
    expect(backlinks[0].references.map((held) => held.role)).toEqual(['capital', 'settlement']);
  });

  it('reports an artifact that points at itself', async () => {
    await create('realm-1', 'The Ashmoor');
    await link('realm-1', [reference('realm-1', 'ruler')]);

    expect(listArtifactBacklinks('project-1', 'realm-1').map((b) => b.referrer.id)).toEqual([
      'realm-1',
    ]);
  });

  it('does not cross a project boundary', async () => {
    await create('culture-1', 'Ashfall');
    await create('settlement-1', 'Emberhold', 'project-2');
    await link('settlement-1', [reference('culture-1', 'culture')], 'project-2');

    expect(listArtifactBacklinks('project-1', 'culture-1')).toEqual([]);
  });

  it('is empty for an artifact nothing points at', async () => {
    await create('culture-1', 'Ashfall');
    expect(listArtifactBacklinks('project-1', 'culture-1')).toEqual([]);
  });
});

describe('collectReferencedArtifacts', () => {
  it('follows references transitively, nearest first', async () => {
    await create('region-1', 'The Ashmoor');
    await create('settlement-1', 'Emberhold');
    await create('culture-1', 'Ashfall');
    await link('region-1', [reference('settlement-1', 'capital')]);
    await link('settlement-1', [reference('culture-1', 'culture')]);

    expect(collectReferencedArtifacts('project-1', 'region-1').map((s) => s.id)).toEqual([
      'settlement-1',
      'culture-1',
    ]);
  });

  it('terminates on a cycle rather than hanging, and leaves the artifact itself out', async () => {
    await create('realm-1', 'The Ashmoor');
    await create('ruler-1', 'Lady Ash');
    await link('realm-1', [reference('ruler-1', 'ruler')]);
    await link('ruler-1', [reference('realm-1', 'realm')]);

    expect(collectReferencedArtifacts('project-1', 'realm-1').map((s) => s.id)).toEqual([
      'ruler-1',
    ]);
    expect(collectReferencedArtifacts('project-1', 'ruler-1').map((s) => s.id)).toEqual([
      'realm-1',
    ]);
  });

  it('terminates on an artifact that references itself', async () => {
    await create('realm-1', 'The Ashmoor');
    await link('realm-1', [reference('realm-1', 'ruler')]);

    expect(collectReferencedArtifacts('project-1', 'realm-1')).toEqual([]);
  });

  it('visits an artifact reached by two paths exactly once', async () => {
    await create('region-1', 'The Ashmoor');
    await create('settlement-1', 'Emberhold');
    await create('culture-1', 'Ashfall');
    await link('region-1', [
      reference('settlement-1', 'capital'),
      reference('culture-1', 'culture'),
    ]);
    await link('settlement-1', [reference('culture-1', 'culture')]);

    expect(collectReferencedArtifacts('project-1', 'region-1').map((s) => s.id)).toEqual([
      'settlement-1',
      'culture-1',
    ]);
  });

  it('stops at a reference whose target is gone', async () => {
    await create('region-1', 'The Ashmoor');
    await link('region-1', [reference('gone', 'capital')]);

    expect(collectReferencedArtifacts('project-1', 'region-1')).toEqual([]);
  });

  it('is empty for an artifact that is not in the project', async () => {
    await create('region-1', 'The Ashmoor');

    expect(collectReferencedArtifacts('project-1', 'nope')).toEqual([]);
    expect(collectReferencedArtifacts('project-2', 'region-1')).toEqual([]);
  });
});
