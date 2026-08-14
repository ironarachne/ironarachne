import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SAVE_STORAGE_PREFIX } from '$lib/persistent_save';

import {
  artifactIndexScopeId,
  artifactPayloadScopeId,
  isArtifactSummary,
  readArtifactIndex,
  readArtifactPayloadRecord,
  removeArtifactIndex,
  removeArtifactPayloadRecord,
  writeArtifactIndex,
  writeArtifactPayloadRecord,
} from './artifact_saved_state';
import type { ArtifactProvenance, ArtifactSummary } from './artifact_types';

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

function summary(overrides: Partial<ArtifactSummary> = {}): ArtifactSummary {
  return {
    id: 'artifact-1',
    projectId: 'project-1',
    kind: 'note',
    name: 'A note',
    tags: [],
    references: [],
    createdAt: 10,
    updatedAt: 10,
    ...overrides,
  };
}

function writeRaw(scopeId: string, value: unknown): void {
  store.set(`${SAVE_STORAGE_PREFIX}${scopeId}`, JSON.stringify(value));
}

describe('scope ids', () => {
  it('keys the index by project and the payload by artifact', () => {
    expect(artifactIndexScopeId('project-1')).toBe('workshop.artifact_index.project-1');
    expect(artifactPayloadScopeId('artifact-1')).toBe('workshop.artifact.artifact-1');
  });

  it('does not let one prefix swallow the other', () => {
    expect(artifactIndexScopeId('x').startsWith('workshop.artifact.')).toBe(false);
    expect(artifactPayloadScopeId('x').startsWith('workshop.artifact_index.')).toBe(false);
  });
});

describe('isArtifactSummary', () => {
  it('accepts a well-formed summary', () => {
    expect(isArtifactSummary(summary())).toBe(true);
  });

  it('accepts optional provenance and rejects a partial one', () => {
    const provenance: ArtifactProvenance = {
      toolPath: '/culture',
      seed: 'abc',
      config: { size: 3 },
    };
    expect(isArtifactSummary(summary({ provenance }))).toBe(true);
    expect(isArtifactSummary({ ...summary(), provenance: { toolPath: '/culture' } })).toBe(false);
    expect(isArtifactSummary({ ...summary(), provenance: { ...provenance, config: 7 } })).toBe(
      false,
    );
  });

  it('accepts references and rejects one with no role', () => {
    const reference = { targetId: 'artifact-2', targetKind: 'note', role: 'sequel' };
    expect(isArtifactSummary(summary({ references: [reference] }))).toBe(true);
    expect(isArtifactSummary({ ...summary(), references: [{ ...reference, role: '' }] })).toBe(
      false,
    );
    expect(isArtifactSummary({ ...summary(), references: [{ ...reference, targetId: '' }] })).toBe(
      false,
    );
    expect(isArtifactSummary({ ...summary(), references: 'none' })).toBe(false);
  });

  it.each([
    ['not an object', 'nope'],
    ['null', null],
    ['an array', []],
    ['no id', { ...summary(), id: '' }],
    ['no project', { ...summary(), projectId: '' }],
    ['no kind', { ...summary(), kind: '' }],
    ['a non-string name', { ...summary(), name: 7 }],
    ['non-string tags', { ...summary(), tags: [1] }],
    ['a non-numeric createdAt', { ...summary(), createdAt: 'yesterday' }],
    ['a non-numeric updatedAt', { ...summary(), updatedAt: undefined }],
  ])('rejects %s', (_label, value) => {
    expect(isArtifactSummary(value)).toBe(false);
  });
});

describe('readArtifactIndex', () => {
  it('reads back what was written', () => {
    writeArtifactIndex('project-1', [summary()]);
    expect(readArtifactIndex('project-1').artifacts).toEqual([summary()]);
  });

  it('reads an empty index for a project with nothing stored', () => {
    expect(readArtifactIndex('project-1')).toEqual({
      storeVersion: 1,
      projectId: 'project-1',
      artifacts: [],
    });
  });

  it.each([
    ['a malformed envelope', 'not an object'],
    ['a wrong store version', { storeVersion: 99, projectId: 'project-1', artifacts: [summary()] }],
    ['a non-array artifacts field', { storeVersion: 1, projectId: 'project-1', artifacts: {} }],
  ])('reads empty rather than throwing for %s', (_label, value) => {
    writeRaw(artifactIndexScopeId('project-1'), value);
    expect(readArtifactIndex('project-1').artifacts).toEqual([]);
  });

  it('drops records that are not summaries and keeps the rest', () => {
    writeRaw(artifactIndexScopeId('project-1'), {
      storeVersion: 1,
      projectId: 'project-1',
      artifacts: [summary(), { id: 'artifact-2' }, null],
    });
    expect(readArtifactIndex('project-1').artifacts).toEqual([summary()]);
  });

  it('drops a summary filed under a project it does not claim', () => {
    writeRaw(artifactIndexScopeId('project-1'), {
      storeVersion: 1,
      projectId: 'project-1',
      artifacts: [summary(), summary({ id: 'artifact-2', projectId: 'project-2' })],
    });
    expect(readArtifactIndex('project-1').artifacts).toEqual([summary()]);
  });

  it('keeps projects apart', () => {
    writeArtifactIndex('project-1', [summary()]);
    writeArtifactIndex('project-2', [summary({ id: 'artifact-2', projectId: 'project-2' })]);
    expect(readArtifactIndex('project-1').artifacts.map((a) => a.id)).toEqual(['artifact-1']);
    expect(readArtifactIndex('project-2').artifacts.map((a) => a.id)).toEqual(['artifact-2']);

    removeArtifactIndex('project-1');
    expect(readArtifactIndex('project-1').artifacts).toEqual([]);
    expect(readArtifactIndex('project-2').artifacts).toHaveLength(1);
  });
});

describe('artifact payload records', () => {
  it('reads back the payload and the version it was written at', () => {
    writeArtifactPayloadRecord('artifact-1', 3, { title: 'A note' });
    expect(readArtifactPayloadRecord('artifact-1')).toEqual({
      storeVersion: 1,
      payloadVersion: 3,
      payload: { title: 'A note' },
    });
  });

  it('reads null for an absent record', () => {
    expect(readArtifactPayloadRecord('artifact-1')).toBeNull();
  });

  it.each([
    ['a malformed envelope', 42],
    ['a wrong store version', { storeVersion: 99, payloadVersion: 1, payload: {} }],
    ['no payload at all', { storeVersion: 1, payloadVersion: 1 }],
  ])('reads null rather than throwing for %s', (_label, value) => {
    writeRaw(artifactPayloadScopeId('artifact-1'), value);
    expect(readArtifactPayloadRecord('artifact-1')).toBeNull();
  });

  it('reports an unusable version as 0 rather than assuming it is current', () => {
    writeRaw(artifactPayloadScopeId('artifact-1'), { storeVersion: 1, payload: { title: 'A' } });
    expect(readArtifactPayloadRecord('artifact-1')?.payloadVersion).toBe(0);
  });

  it('stores a null payload as a payload rather than as absence', () => {
    writeArtifactPayloadRecord('artifact-1', 1, null);
    expect(readArtifactPayloadRecord('artifact-1')).toEqual({
      storeVersion: 1,
      payloadVersion: 1,
      payload: null,
    });
  });

  it('removes a record', () => {
    writeArtifactPayloadRecord('artifact-1', 1, { title: 'A note' });
    removeArtifactPayloadRecord('artifact-1');
    expect(readArtifactPayloadRecord('artifact-1')).toBeNull();
  });
});

describe('without localStorage', () => {
  it('reads empty and swallows writes rather than throwing', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(readArtifactIndex('project-1').artifacts).toEqual([]);
    expect(readArtifactPayloadRecord('artifact-1')).toBeNull();
    expect(() => writeArtifactIndex('project-1', [summary()])).not.toThrow();
    expect(() => writeArtifactPayloadRecord('artifact-1', 1, {})).not.toThrow();
  });
});
