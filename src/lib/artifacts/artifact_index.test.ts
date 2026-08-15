import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { closeVault, writeArtifactSummaryRecord } from '$lib/vault_db';

import {
  artifactsHydrated,
  forgetProjectArtifacts,
  hydrateArtifacts,
  indexedArtifact,
  indexedArtifacts,
  resetArtifactIndex,
  toArtifactSummary,
} from './artifact_index';
import type { ArtifactProvenance, ArtifactSummary } from './artifact_types';

function aSummary(overrides: Partial<ArtifactSummary> = {}): ArtifactSummary {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: 'note',
    name: 'Ashfall',
    tags: [],
    references: [],
    payloadVersion: 1,
    byteSize: 19,
    createdAt: 100,
    updatedAt: 200,
    ...overrides,
  };
}

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

describe('toArtifactSummary', () => {
  it('accepts a stored record as it was written', () => {
    expect(toArtifactSummary(aSummary())).toEqual(aSummary());
  });

  it('keeps provenance when it is whole, and refuses half of one', () => {
    const provenance: ArtifactProvenance = { toolPath: '/culture', seed: 'seed-1', config: {} };
    expect(toArtifactSummary(aSummary({ provenance }))?.provenance).toEqual(provenance);
    expect(
      toArtifactSummary({ ...aSummary(), provenance: { toolPath: '/culture' } }),
    ).toBeUndefined();
  });

  it('keeps a reference only when it carries a target and a role', () => {
    const references = [{ targetId: 'artifact-2', targetKind: 'note', role: 'sequel' }];
    expect(toArtifactSummary(aSummary({ references }))?.references).toEqual(references);
    expect(
      toArtifactSummary({
        ...aSummary(),
        references: [{ targetId: 'artifact-2', targetKind: 'note', role: '' }],
      }),
    ).toBeUndefined();
  });

  it('drops a record with no identity or nothing to order it by', () => {
    expect(toArtifactSummary(null)).toBeUndefined();
    expect(toArtifactSummary([aSummary()])).toBeUndefined();
    expect(toArtifactSummary({ ...aSummary(), id: '' })).toBeUndefined();
    expect(toArtifactSummary({ ...aSummary(), projectId: '' })).toBeUndefined();
    expect(toArtifactSummary({ ...aSummary(), kind: '' })).toBeUndefined();
    expect(toArtifactSummary({ ...aSummary(), name: 7 })).toBeUndefined();
    expect(toArtifactSummary({ ...aSummary(), tags: [7] })).toBeUndefined();
    expect(toArtifactSummary({ ...aSummary(), references: 'none' })).toBeUndefined();
    expect(toArtifactSummary({ ...aSummary(), updatedAt: 'recently' })).toBeUndefined();
  });

  it('defaults the bookkeeping numbers rather than hiding the artifact', () => {
    // What a record adopted from the `localStorage` store looks like: it never had either field.
    const adopted = toArtifactSummary({
      ...aSummary(),
      payloadVersion: undefined,
      byteSize: undefined,
    });
    expect(adopted?.payloadVersion).toBe(0);
    expect(adopted?.byteSize).toBe(0);
  });
});

describe('hydrateArtifacts', () => {
  it('reads the database once, and answers from memory afterwards', async () => {
    await writeArtifactSummaryRecord(aSummary());
    await writeArtifactSummaryRecord(aSummary({ id: 'artifact-2' }));

    expect(artifactsHydrated()).toBe(false);
    const first = await hydrateArtifacts();
    expect(first.ok === true && first.value.map((summary) => summary.id).sort()).toEqual([
      'artifact-1',
      'artifact-2',
    ]);
    expect(artifactsHydrated()).toBe(true);

    // A record written behind the index's back is not seen until it is rebuilt, which is what
    // makes this a cache rather than a second source of truth.
    await writeArtifactSummaryRecord(aSummary({ id: 'artifact-3' }));
    expect(indexedArtifact('artifact-3')).toBeUndefined();
    resetArtifactIndex();
    await hydrateArtifacts();
    expect(indexedArtifact('artifact-3')).toBeDefined();
  });

  it('drops a stored record this build cannot read, and keeps the rest', async () => {
    await writeArtifactSummaryRecord(aSummary());
    await writeArtifactSummaryRecord({ id: 'artifact-2', projectId: 'project-1', name: 42 } as {
      id: string;
      projectId: string;
    });

    await hydrateArtifacts();

    expect(indexedArtifacts().map((summary) => summary.id)).toEqual(['artifact-1']);
  });

  it('shares one read between callers that race at startup', async () => {
    await writeArtifactSummaryRecord(aSummary());

    const [first, second] = await Promise.all([hydrateArtifacts(), hydrateArtifacts()]);

    expect(first.ok && second.ok).toBe(true);
    expect(indexedArtifacts()).toHaveLength(1);
  });

  it('reports a database it could not read, and does not cache the failure', async () => {
    let attempts = 0;
    vi.stubGlobal('indexedDB', {
      open: () => {
        attempts += 1;
        const request = { error: new Error('storage is gone'), onerror: null };
        queueMicrotask(() => (request.onerror as (() => void) | null)?.());
        return request;
      },
    });

    const result = await hydrateArtifacts();

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('storage-failed');
    expect(artifactsHydrated()).toBe(false);
    await hydrateArtifacts();
    expect(attempts).toBe(2);
  });
});

describe('forgetProjectArtifacts', () => {
  it('drops one project from the index and reports what went', async () => {
    await writeArtifactSummaryRecord(aSummary({ id: 'a' }));
    await writeArtifactSummaryRecord(aSummary({ id: 'b' }));
    await writeArtifactSummaryRecord(aSummary({ id: 'c', projectId: 'project-2' }));
    await hydrateArtifacts();

    expect(forgetProjectArtifacts('project-1').sort()).toEqual(['a', 'b']);

    expect(indexedArtifacts().map((summary) => summary.id)).toEqual(['c']);
  });

  it('reports nothing for a project with nothing in it', async () => {
    await hydrateArtifacts();
    expect(forgetProjectArtifacts('project-9')).toEqual([]);
  });
});
