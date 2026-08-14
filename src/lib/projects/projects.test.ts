import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  readActiveProjectPayload,
  readProjectsPayload,
  writeActiveProjectPayload,
} from './project_saved_state';
import {
  DEFAULT_PROJECT_NAME,
  createProject,
  deleteProject,
  getActiveProject,
  getProject,
  listProjects,
  newProjectId,
  renameProject,
  setActiveProject,
  updateProject,
} from './projects';

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

describe('newProjectId', () => {
  it('uses crypto.randomUUID where it exists', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-from-crypto' });
    expect(newProjectId()).toBe('uuid-from-crypto');
  });

  it('falls back to a generated id where randomUUID is absent', () => {
    vi.stubGlobal('crypto', {});
    const first = newProjectId();
    const second = newProjectId();
    expect(first).toMatch(/^project-/);
    expect(second).not.toBe(first);
  });
});

describe('createProject', () => {
  it('stores a project and returns it', () => {
    const project = createProject({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(project).toEqual({
      id: 'p1',
      name: 'Ashfall',
      tags: [],
      createdAt: 1000,
      updatedAt: 1000,
    });
    expect(readProjectsPayload().projects).toEqual([project]);
  });

  it('names an unnamed or blank project rather than storing an empty name', () => {
    expect(createProject({}, { id: 'p1' }).name).toBe(DEFAULT_PROJECT_NAME);
    expect(createProject({ name: '   ' }, { id: 'p2' }).name).toBe(DEFAULT_PROJECT_NAME);
  });

  it('trims the name and description, and omits an empty description', () => {
    const project = createProject(
      { name: '  Dolmenwood  ', description: '  A wood  ' },
      { id: 'p1' },
    );
    expect(project.name).toBe('Dolmenwood');
    expect(project.description).toBe('A wood');
    expect(createProject({ description: '   ' }, { id: 'p2' })).not.toHaveProperty('description');
  });

  it('trims, drops empty, and de-duplicates tags', () => {
    const project = createProject({ tags: [' fantasy ', '', 'fantasy', 'grim'] }, { id: 'p1' });
    expect(project.tags).toEqual(['fantasy', 'grim']);
  });

  it('keeps existing projects', () => {
    createProject({ name: 'One' }, { id: 'p1' });
    createProject({ name: 'Two' }, { id: 'p2' });
    expect(readProjectsPayload().projects.map((project) => project.id)).toEqual(['p1', 'p2']);
  });

  it('does not open the project it created', () => {
    createProject({ name: 'One' }, { id: 'p1' });
    createProject({ name: 'Two' }, { id: 'p2' });
    setActiveProject('p1');
    createProject({ name: 'Three' }, { id: 'p3' });
    expect(getActiveProject()?.id).toBe('p1');
  });

  it('mints an id when none is supplied', () => {
    const first = createProject({ name: 'One' });
    const second = createProject({ name: 'Two' });
    expect(first.id).not.toBe(second.id);
    expect(first.id).not.toBe('');
  });

  it('timestamps with the current time when none is supplied', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-14T00:00:00Z'));
    const project = createProject({ name: 'One' });
    expect(project.createdAt).toBe(Date.now());
    expect(project.updatedAt).toBe(project.createdAt);
    vi.useRealTimers();
  });
});

describe('listProjects and getProject', () => {
  it('lists most recently updated first', () => {
    createProject({ name: 'Old' }, { id: 'p1', now: 1000 });
    createProject({ name: 'New' }, { id: 'p2', now: 3000 });
    createProject({ name: 'Middle' }, { id: 'p3', now: 2000 });
    expect(listProjects().map((project) => project.id)).toEqual(['p2', 'p3', 'p1']);
  });

  it('breaks ties by name, then by id', () => {
    createProject({ name: 'Beta' }, { id: 'p1', now: 1000 });
    createProject({ name: 'Alpha' }, { id: 'p3', now: 1000 });
    createProject({ name: 'Alpha' }, { id: 'p2', now: 1000 });
    expect(listProjects().map((project) => project.id)).toEqual(['p2', 'p3', 'p1']);
  });

  it('lists nothing when nothing is stored', () => {
    expect(listProjects()).toEqual([]);
  });

  it('gets a project by id, and nothing for an unknown id', () => {
    const project = createProject({ name: 'Ashfall' }, { id: 'p1' });
    expect(getProject('p1')).toEqual(project);
    expect(getProject('missing')).toBeUndefined();
  });
});

describe('updateProject', () => {
  it('renames a project and moves its updatedAt', () => {
    createProject({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    const renamed = renameProject('p1', 'Ashfall Reborn', { now: 2000 });
    expect(renamed?.name).toBe('Ashfall Reborn');
    expect(renamed?.updatedAt).toBe(2000);
    expect(renamed?.createdAt).toBe(1000);
    expect(getProject('p1')?.name).toBe('Ashfall Reborn');
  });

  it('falls back to the default name when renamed to blank', () => {
    createProject({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(renameProject('p1', '  ', { now: 2000 })?.name).toBe(DEFAULT_PROJECT_NAME);
  });

  it('edits the description and tags', () => {
    createProject({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    const updated = updateProject(
      'p1',
      { description: '  A ruined empire  ', tags: ['fantasy', 'fantasy'] },
      { now: 2000 },
    );
    expect(updated?.description).toBe('A ruined empire');
    expect(updated?.tags).toEqual(['fantasy']);
  });

  it('clears a description when passed an empty one', () => {
    createProject({ name: 'Ashfall', description: 'A ruined empire' }, { id: 'p1', now: 1000 });
    const cleared = updateProject('p1', { description: '' }, { now: 2000 });
    expect(cleared).not.toHaveProperty('description');
    expect(getProject('p1')).not.toHaveProperty('description');
  });

  it('leaves fields alone when they are not named', () => {
    createProject(
      { name: 'Ashfall', description: 'A ruined empire', tags: ['fantasy'] },
      { id: 'p1', now: 1000 },
    );
    const updated = updateProject('p1', { name: 'Ashfall Reborn' }, { now: 2000 });
    expect(updated?.description).toBe('A ruined empire');
    expect(updated?.tags).toEqual(['fantasy']);
  });

  it('does not touch updatedAt when nothing actually changed', () => {
    createProject({ name: 'Ashfall', tags: ['fantasy'] }, { id: 'p1', now: 1000 });
    const updated = updateProject('p1', { name: 'Ashfall', tags: ['fantasy'] }, { now: 2000 });
    expect(updated?.updatedAt).toBe(1000);
    expect(getProject('p1')?.updatedAt).toBe(1000);
  });

  it('returns nothing for an unknown id and writes nothing', () => {
    createProject({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(updateProject('missing', { name: 'Nope' })).toBeUndefined();
    expect(renameProject('missing', 'Nope')).toBeUndefined();
    expect(listProjects().map((project) => project.name)).toEqual(['Ashfall']);
  });

  it('stamps the current time when none is supplied', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-14T00:00:00Z'));
    createProject({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(renameProject('p1', 'Renamed')?.updatedAt).toBe(Date.now());
    vi.useRealTimers();
  });
});

describe('deleteProject', () => {
  it('removes the project and reports the deletion', () => {
    createProject({ name: 'One' }, { id: 'p1' });
    createProject({ name: 'Two' }, { id: 'p2' });
    expect(deleteProject('p1')).toEqual({
      deleted: true,
      removedArtifactIds: [],
      wasActive: false,
    });
    expect(listProjects().map((project) => project.id)).toEqual(['p2']);
  });

  it('reports nothing deleted for an unknown id', () => {
    createProject({ name: 'One' }, { id: 'p1' });
    expect(deleteProject('missing')).toEqual({
      deleted: false,
      removedArtifactIds: [],
      wasActive: false,
    });
    expect(listProjects()).toHaveLength(1);
  });

  it('clears the selection when the open project is deleted', () => {
    createProject({ name: 'One' }, { id: 'p1', now: 1000 });
    createProject({ name: 'Two' }, { id: 'p2', now: 2000 });
    setActiveProject('p1');
    expect(deleteProject('p1').wasActive).toBe(true);
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
    expect(getActiveProject()?.id).toBe('p2');
  });

  it('leaves the selection alone when another project is deleted', () => {
    createProject({ name: 'One' }, { id: 'p1', now: 1000 });
    createProject({ name: 'Two' }, { id: 'p2', now: 2000 });
    setActiveProject('p1');
    deleteProject('p2');
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
  });

  it('leaves no open project when the last one is deleted', () => {
    createProject({ name: 'Only' }, { id: 'p1' });
    setActiveProject('p1');
    deleteProject('p1');
    expect(getActiveProject()).toBeUndefined();
  });
});

describe('the active project', () => {
  it('is nothing when there are no projects', () => {
    expect(getActiveProject()).toBeUndefined();
  });

  it('is the project that was opened', () => {
    createProject({ name: 'One' }, { id: 'p1', now: 1000 });
    createProject({ name: 'Two' }, { id: 'p2', now: 2000 });
    expect(setActiveProject('p1')?.id).toBe('p1');
    expect(getActiveProject()?.id).toBe('p1');
  });

  it('survives a reload, because the selection is stored', () => {
    createProject({ name: 'One' }, { id: 'p1', now: 1000 });
    createProject({ name: 'Two' }, { id: 'p2', now: 2000 });
    setActiveProject('p1');
    // A reload is a fresh read of the same storage, which is what these functions do every call.
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
    expect(getActiveProject()?.id).toBe('p1');
  });

  it('selects the most recently updated project when nothing is open, and persists that', () => {
    createProject({ name: 'Old' }, { id: 'p1', now: 1000 });
    createProject({ name: 'New' }, { id: 'p2', now: 2000 });
    expect(getActiveProject()?.id).toBe('p2');
    expect(readActiveProjectPayload().activeProjectId).toBe('p2');
  });

  it('recovers when the stored id names a project that is gone', () => {
    createProject({ name: 'One' }, { id: 'p1', now: 1000 });
    writeActiveProjectPayload('deleted-elsewhere');
    expect(getActiveProject()?.id).toBe('p1');
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
  });

  it('clears a stored id when every project is gone', () => {
    writeActiveProjectPayload('deleted-elsewhere');
    expect(getActiveProject()).toBeUndefined();
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('closes the open project when set to null', () => {
    createProject({ name: 'One' }, { id: 'p1' });
    setActiveProject('p1');
    expect(setActiveProject(null)).toBeUndefined();
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('ignores an id that names no project', () => {
    createProject({ name: 'One' }, { id: 'p1' });
    setActiveProject('p1');
    expect(setActiveProject('missing')).toBeUndefined();
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
  });

  it('is exactly one project once one exists', () => {
    createProject({ name: 'One' }, { id: 'p1', now: 1000 });
    createProject({ name: 'Two' }, { id: 'p2', now: 2000 });
    createProject({ name: 'Three' }, { id: 'p3', now: 3000 });
    const active = getActiveProject();
    expect(listProjects().filter((project) => project.id === active?.id)).toHaveLength(1);
  });
});

describe('the whole set', () => {
  it('survives a reload', () => {
    createProject({ name: 'One', tags: ['fantasy'] }, { id: 'p1', now: 1000 });
    createProject({ name: 'Two', description: 'Second' }, { id: 'p2', now: 2000 });
    renameProject('p1', 'One Renamed', { now: 3000 });

    // Storage is the only state these functions hold, so re-reading it is the reload.
    const reloaded = listProjects();
    expect(reloaded.map((project) => project.name)).toEqual(['One Renamed', 'Two']);
    expect(reloaded[0].tags).toEqual(['fantasy']);
    expect(reloaded[1].description).toBe('Second');
  });
});
