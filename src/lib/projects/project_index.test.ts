import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { closeVault, writeProjectRecord } from '$lib/vault_db';

import {
  forgetProject,
  hydrateProjects,
  indexedProject,
  indexedProjects,
  projectsHydrated,
  rememberProject,
  resetProjectIndex,
  toProject,
} from './project_index';
import type { Project } from './project_types';

function aProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Ashfall',
    tags: [],
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

beforeEach(() => {
  closeVault();
  resetProjectIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  resetProjectIndex();
  vi.unstubAllGlobals();
});

describe('toProject', () => {
  it('accepts a well-formed project, with or without a description', () => {
    expect(toProject(aProject())).toEqual(aProject());
    const described = aProject({ description: 'A ruined empire' });
    expect(toProject(described)).toEqual(described);
  });

  it.each<[string, unknown]>([
    ['null', null],
    ['an array', []],
    ['a string', 'project'],
    ['a missing id', { ...aProject(), id: undefined }],
    ['an empty id', aProject({ id: '' })],
    ['a non-string name', { ...aProject(), name: 7 }],
    ['a non-string description', { ...aProject(), description: 7 }],
    ['missing tags', { ...aProject(), tags: undefined }],
    ['tags that are not all strings', { ...aProject(), tags: ['ok', 3] }],
    ['a non-numeric createdAt', { ...aProject(), createdAt: 'yesterday' }],
    ['a non-finite updatedAt', aProject({ updatedAt: Number.NaN })],
  ])('drops %s', (_label, value) => {
    expect(toProject(value)).toBeUndefined();
  });

  it('keeps only the fields a project has, so a stray one cannot ride along', () => {
    expect(toProject({ ...aProject(), lastExportAt: 5000 })).toEqual(aProject());
  });

  it('reads a genre and a system it knows, and derives their tags', () => {
    const read = toProject({ ...aProject({ tags: ['homebrew'] }), genre: 'horror', system: 'dcc' });

    expect(read?.genre).toBe('horror');
    expect(read?.system).toBe('dcc');
    expect(read?.tags).toEqual(['homebrew', 'genre:horror', 'system:dcc']);
  });

  it.each<[string, unknown, string]>([
    ['a genre from a later build', { genre: 'weird-west' }, 'genre'],
    ['a system from a later build', { system: 'pf2e' }, 'system'],
    ['a genre that is not a string', { genre: 7 }, 'genre'],
  ])('drops %s and keeps the project', (_label, extra, field) => {
    // The alternative — rejecting the record — loses the project's name, description, tags and id,
    // and spills its artifacts into the recovered bucket, all over a field that only decides which
    // tools get listed.
    const read = toProject({ ...aProject(), ...(extra as object) });

    expect(read).toEqual(aProject());
    expect(read).not.toHaveProperty(field);
  });

  it('rebuilds a setting tag that disagrees with the field it came from', () => {
    const read = toProject({ ...aProject({ tags: ['genre:scifi'] }), genre: 'fantasy' });

    expect(read?.tags).toEqual(['genre:fantasy']);
  });
});

describe('hydrateProjects', () => {
  it('reads the database once, and answers from memory afterwards', async () => {
    await writeProjectRecord(aProject());
    await writeProjectRecord(aProject({ id: 'p2' }));

    expect(projectsHydrated()).toBe(false);
    const first = await hydrateProjects();
    expect(first.ok === true && first.value.map((project) => project.id).sort()).toEqual([
      'p1',
      'p2',
    ]);
    expect(projectsHydrated()).toBe(true);

    await writeProjectRecord(aProject({ id: 'p3' }));
    expect(indexedProject('p3')).toBeUndefined();
    resetProjectIndex();
    await hydrateProjects();
    expect(indexedProject('p3')).toBeDefined();
  });

  it('drops a stored record this build cannot read, and keeps the rest', async () => {
    await writeProjectRecord(aProject());
    await writeProjectRecord({ id: 'broken' });

    await hydrateProjects();

    expect(indexedProjects().map((project) => project.id)).toEqual(['p1']);
  });

  it('shares one read between callers that race at startup', async () => {
    await writeProjectRecord(aProject());

    const [first, second] = await Promise.all([hydrateProjects(), hydrateProjects()]);

    expect(first.ok && second.ok).toBe(true);
    expect(indexedProjects()).toHaveLength(1);
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

    const result = await hydrateProjects();

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('storage-failed');
    expect(projectsHydrated()).toBe(false);
    await hydrateProjects();
    expect(attempts).toBe(2);
  });
});

describe('the cache', () => {
  it('ignores a remembered or forgotten project until it has been hydrated', () => {
    // Writing into a cache that has not been read would be inventing state, not caching it.
    rememberProject(aProject());
    expect(indexedProjects()).toEqual([]);
    expect(() => forgetProject('p1')).not.toThrow();
  });

  it('records a project once hydrated, and forgets one', async () => {
    await hydrateProjects();

    rememberProject(aProject());
    expect(indexedProject('p1')).toEqual(aProject());

    forgetProject('p1');
    expect(indexedProject('p1')).toBeUndefined();
  });
});
