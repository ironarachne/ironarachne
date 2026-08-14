import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SAVE_STORAGE_PREFIX } from '$lib/persistent_save';

import {
  ACTIVE_PROJECT_SAVE_SCOPE_ID,
  PROJECTS_SAVE_SCOPE_ID,
  isProject,
  readActiveProjectPayload,
  readProjectsPayload,
  writeActiveProjectPayload,
  writeProjectsPayload,
} from './project_saved_state';
import type { Project } from './project_types';

const store = new Map<string, string>();

function storageKey(scopeId: string): string {
  return `${SAVE_STORAGE_PREFIX}${scopeId}`;
}

function storeRaw(scopeId: string, value: unknown): void {
  store.set(storageKey(scopeId), JSON.stringify(value));
}

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

describe('isProject', () => {
  it('accepts a well-formed project, with or without a description', () => {
    expect(isProject(aProject())).toBe(true);
    expect(isProject(aProject({ description: 'A ruined empire' }))).toBe(true);
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
  ])('rejects %s', (_label, value) => {
    expect(isProject(value)).toBe(false);
  });
});

describe('readProjectsPayload', () => {
  it('reads an empty set when nothing is stored', () => {
    expect(readProjectsPayload()).toEqual({ payloadVersion: 1, projects: [] });
  });

  it('reads back what was written', () => {
    const project = aProject({ description: 'A ruined empire', tags: ['fantasy'] });
    writeProjectsPayload([project]);
    expect(readProjectsPayload().projects).toEqual([project]);
  });

  it('reads an empty set when the payload version is not this one', () => {
    storeRaw(PROJECTS_SAVE_SCOPE_ID, { payloadVersion: 2, projects: [aProject()] });
    expect(readProjectsPayload().projects).toEqual([]);
  });

  it('reads an empty set when the envelope is malformed', () => {
    storeRaw(PROJECTS_SAVE_SCOPE_ID, ['not', 'an', 'envelope']);
    expect(readProjectsPayload().projects).toEqual([]);

    storeRaw(PROJECTS_SAVE_SCOPE_ID, { payloadVersion: 1, projects: 'nope' });
    expect(readProjectsPayload().projects).toEqual([]);
  });

  it('reads an empty set when the stored JSON is damaged', () => {
    store.set(storageKey(PROJECTS_SAVE_SCOPE_ID), '{');
    expect(readProjectsPayload().projects).toEqual([]);
  });

  it('drops records that are not projects and keeps the rest', () => {
    storeRaw(PROJECTS_SAVE_SCOPE_ID, {
      payloadVersion: 1,
      projects: [aProject(), { id: 'broken' }, null],
    });
    expect(readProjectsPayload().projects).toEqual([aProject()]);
  });
});

describe('readActiveProjectPayload', () => {
  it('reads null when nothing is stored', () => {
    expect(readActiveProjectPayload()).toEqual({ payloadVersion: 1, activeProjectId: null });
  });

  it('reads back what was written, including a cleared selection', () => {
    writeActiveProjectPayload('p1');
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');

    writeActiveProjectPayload(null);
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('reads null for a wrong version, a malformed envelope, or a non-string id', () => {
    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, { payloadVersion: 99, activeProjectId: 'p1' });
    expect(readActiveProjectPayload().activeProjectId).toBeNull();

    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, 'p1');
    expect(readActiveProjectPayload().activeProjectId).toBeNull();

    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, { payloadVersion: 1, activeProjectId: 7 });
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('treats an empty stored id as no selection', () => {
    storeRaw(ACTIVE_PROJECT_SAVE_SCOPE_ID, { payloadVersion: 1, activeProjectId: '' });
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });
});

describe('storage scopes', () => {
  it('keeps the project set and the open project in separate scopes', () => {
    writeProjectsPayload([aProject()]);
    writeActiveProjectPayload('p1');
    expect(store.has(storageKey(PROJECTS_SAVE_SCOPE_ID))).toBe(true);
    expect(store.has(storageKey(ACTIVE_PROJECT_SAVE_SCOPE_ID))).toBe(true);
  });

  it('survives storage being unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => writeProjectsPayload([aProject()])).not.toThrow();
    expect(readProjectsPayload().projects).toEqual([]);
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });
});
