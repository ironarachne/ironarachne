import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  acceptedPayload,
  asRecord,
  createArtifactKindRegistry,
  defineArtifactKind,
  registerArtifactKind,
  rejectedPayload,
} from '$lib/artifact_kinds';
import {
  createArtifact,
  listArtifacts,
  readArtifact,
  resetArtifactIndex,
  type Artifact,
} from '$lib/artifacts';
import { closeVault, type VaultResult } from '$lib/vault_db';
import { IRONARACHNE_RULESET_REF } from '$lib/rulesets';

import { readActiveProjectPayload, writeActiveProjectPayload } from './active_project_state';
import { onProjectsChanged, resetProjectChangeListeners } from './project_events';
import { hydrateProjects, resetProjectIndex } from './project_index';
import type { Project, ProjectChange, ProjectDeletion } from './project_types';
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

const local = new Map<string, string>();

beforeEach(() => {
  local.clear();
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('localStorage', {
    get length() {
      return local.size;
    },
    key: (i: number) => [...local.keys()][i] ?? null,
    getItem: (key: string) => local.get(key) ?? null,
    setItem: (key: string, value: string) => {
      local.set(key, value);
    },
    removeItem: (key: string) => {
      local.delete(key);
    },
  });
});

afterEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

/** Unwraps a stored result, failing the test rather than an assertion when the write was refused. */
function stored<T>(result: VaultResult<T> | undefined): T {
  if (result === undefined) {
    throw new Error('expected a project, got nothing at all');
  }
  if (!result.ok) {
    throw new Error(`expected the vault to store it, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

function make(
  draft: Parameters<typeof createProject>[0] = {},
  options: Parameters<typeof createProject>[1] = {},
): Promise<Project> {
  return createProject(draft, options).then(stored);
}

function removed(result: VaultResult<ProjectDeletion>): ProjectDeletion {
  return stored(result);
}

type Note = { title: string };

const note: Note = { title: 'A note' };

/** Enough of a kind to put something in a project, so the delete cascade has work to do. */
const NOTE_KINDS = (() => {
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
        if (record === null || typeof record.title !== 'string') {
          return rejectedPayload<Note>('invalid-payload', 'note has no title');
        }
        return acceptedPayload({ title: record.title });
      },
      migrate: (_payload, from) =>
        rejectedPayload<Note>('unsupported-version', `nothing at ${from}`),
    }),
  );
  return registry;
})();

function addNote(projectId: string, id?: string): Promise<Artifact> {
  return createArtifact(NOTE_KINDS, { projectId, kind: 'note', payload: note }, { id }).then(
    (result) => {
      if (!result.ok) {
        throw new Error(`expected a stored artifact, got ${result.reason}`);
      }
      return result.value;
    },
  );
}

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
  it('stores a project and returns it', async () => {
    const project = await make({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(project).toEqual({
      id: 'p1',
      name: 'Ashfall',
      tags: [],
      createdAt: 1000,
      updatedAt: 1000,
    });

    // A reload: memory is dropped, the database is not.
    resetProjectIndex();
    await hydrateProjects();
    expect(listProjects()).toEqual([project]);
  });

  it('names an unnamed or blank project rather than storing an empty name', async () => {
    expect((await make({}, { id: 'p1' })).name).toBe(DEFAULT_PROJECT_NAME);
    expect((await make({ name: '   ' }, { id: 'p2' })).name).toBe(DEFAULT_PROJECT_NAME);
  });

  it('trims the name and description, and omits an empty description', async () => {
    const project = await make({ name: '  Dolmenwood  ', description: '  A wood  ' }, { id: 'p1' });
    expect(project.name).toBe('Dolmenwood');
    expect(project.description).toBe('A wood');
    expect(await make({ description: '   ' }, { id: 'p2' })).not.toHaveProperty('description');
  });

  it('trims, drops empty, and de-duplicates tags', async () => {
    const project = await make({ tags: [' fantasy ', '', 'fantasy', 'grim'] }, { id: 'p1' });
    expect(project.tags).toEqual(['fantasy', 'grim']);
  });

  it('keeps existing projects', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    await make({ name: 'Two' }, { id: 'p2' });
    expect(
      listProjects()
        .map((project) => project.id)
        .sort(),
    ).toEqual(['p1', 'p2']);
  });

  it('does not open the project it created', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    await make({ name: 'Two' }, { id: 'p2' });
    setActiveProject('p1');
    await make({ name: 'Three' }, { id: 'p3' });
    expect(getActiveProject()?.id).toBe('p1');
  });

  it('mints an id when none is supplied', async () => {
    const first = await make({ name: 'One' });
    const second = await make({ name: 'Two' });
    expect(first.id).not.toBe(second.id);
    expect(first.id).not.toBe('');
  });

  it('timestamps with the current time when none is supplied', async () => {
    // Only the clock: fake-indexeddb runs its request queue on real timers, and faking those
    // would leave every await here waiting for a callback that never fires.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-14T00:00:00Z'));
    const project = await make({ name: 'One' });
    expect(project.createdAt).toBe(Date.now());
    expect(project.updatedAt).toBe(project.createdAt);
    vi.useRealTimers();
  });

  it('reports a refused write rather than leaving a project only memory believes in', async () => {
    await hydrateProjects();
    closeVault();
    vi.stubGlobal('indexedDB', {
      open: () => {
        const request = { error: new Error('storage is gone'), onerror: null };
        queueMicrotask(() => (request.onerror as (() => void) | null)?.());
        return request;
      },
    });

    const result = await createProject({ name: 'Ashfall' }, { id: 'p1' });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('storage-failed');
    expect(listProjects()).toEqual([]);
  });
});

describe('listProjects and getProject', () => {
  it('lists most recently updated first', async () => {
    await make({ name: 'Old' }, { id: 'p1', now: 1000 });
    await make({ name: 'New' }, { id: 'p2', now: 3000 });
    await make({ name: 'Middle' }, { id: 'p3', now: 2000 });
    expect(listProjects().map((project) => project.id)).toEqual(['p2', 'p3', 'p1']);
  });

  it('breaks ties by name, then by id', async () => {
    await make({ name: 'Beta' }, { id: 'p1', now: 1000 });
    await make({ name: 'Alpha' }, { id: 'p3', now: 1000 });
    await make({ name: 'Alpha' }, { id: 'p2', now: 1000 });
    expect(listProjects().map((project) => project.id)).toEqual(['p2', 'p3', 'p1']);
  });

  it('lists nothing when nothing is stored', async () => {
    await hydrateProjects();
    expect(listProjects()).toEqual([]);
  });

  it('lists nothing before the index has been read, rather than blocking a render', async () => {
    await make({ name: 'Ashfall' }, { id: 'p1' });
    resetProjectIndex();

    expect(listProjects()).toEqual([]);
    await hydrateProjects();
    expect(listProjects()).toHaveLength(1);
  });

  it('gets a project by id, and nothing for an unknown id', async () => {
    const project = await make({ name: 'Ashfall' }, { id: 'p1' });
    expect(getProject('p1')).toEqual(project);
    expect(getProject('missing')).toBeUndefined();
  });
});

describe('updateProject', () => {
  it('renames a project and moves its updatedAt', async () => {
    await make({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    const renamed = stored(await renameProject('p1', 'Ashfall Reborn', { now: 2000 }));
    expect(renamed.name).toBe('Ashfall Reborn');
    expect(renamed.updatedAt).toBe(2000);
    expect(renamed.createdAt).toBe(1000);
    expect(getProject('p1')?.name).toBe('Ashfall Reborn');
  });

  it('falls back to the default name when renamed to blank', async () => {
    await make({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(stored(await renameProject('p1', '  ', { now: 2000 })).name).toBe(DEFAULT_PROJECT_NAME);
  });

  it('edits the description and tags', async () => {
    await make({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    const updated = stored(
      await updateProject(
        'p1',
        { description: '  A ruined empire  ', tags: ['fantasy', 'fantasy'] },
        { now: 2000 },
      ),
    );
    expect(updated.description).toBe('A ruined empire');
    expect(updated.tags).toEqual(['fantasy']);
  });

  it('clears a description when passed an empty one', async () => {
    await make({ name: 'Ashfall', description: 'A ruined empire' }, { id: 'p1', now: 1000 });
    const cleared = stored(await updateProject('p1', { description: '' }, { now: 2000 }));
    expect(cleared).not.toHaveProperty('description');
    expect(getProject('p1')).not.toHaveProperty('description');
  });

  it('leaves fields alone when they are not named', async () => {
    await make(
      { name: 'Ashfall', description: 'A ruined empire', tags: ['fantasy'] },
      { id: 'p1', now: 1000 },
    );
    const updated = stored(await updateProject('p1', { name: 'Ashfall Reborn' }, { now: 2000 }));
    expect(updated.description).toBe('A ruined empire');
    expect(updated.tags).toEqual(['fantasy']);
  });

  it('does not touch updatedAt when nothing actually changed', async () => {
    await make({ name: 'Ashfall', tags: ['fantasy'] }, { id: 'p1', now: 1000 });
    const updated = stored(
      await updateProject('p1', { name: 'Ashfall', tags: ['fantasy'] }, { now: 2000 }),
    );
    expect(updated.updatedAt).toBe(1000);
    expect(getProject('p1')?.updatedAt).toBe(1000);
  });

  it('returns nothing for an unknown id and writes nothing', async () => {
    await make({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(await updateProject('missing', { name: 'Nope' })).toBeUndefined();
    expect(await renameProject('missing', 'Nope')).toBeUndefined();
    expect(listProjects().map((project) => project.name)).toEqual(['Ashfall']);
  });

  it('stamps the current time when none is supplied', async () => {
    // Only the clock: fake-indexeddb runs its request queue on real timers, and faking those
    // would leave every await here waiting for a callback that never fires.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-14T00:00:00Z'));
    await make({ name: 'Ashfall' }, { id: 'p1', now: 1000 });
    expect(stored(await renameProject('p1', 'Renamed')).updatedAt).toBe(Date.now());
    vi.useRealTimers();
  });
});

describe("a project's genre and system", () => {
  it('stores what a draft asked for, and derives the tags from it', async () => {
    const created = await make(
      { name: 'Ashfall', genre: 'fantasy', system: 'adnd-2e', tags: ['homebrew'] },
      { id: 'p1', now: 1000 },
    );
    expect(created.genre).toBe('fantasy');
    expect(created.system).toBe('adnd-2e');
    expect(created.tags).toEqual(['homebrew', 'genre:fantasy', 'system:adnd-2e']);
  });

  it('leaves both unset when the draft says nothing, and derives no tags', async () => {
    const created = await make({ name: 'A box of tools' }, { id: 'p1', now: 1000 });
    expect(created).not.toHaveProperty('genre');
    expect(created).not.toHaveProperty('system');
    expect(created.tags).toEqual([]);
  });

  it('changes both, because neither is permanent', async () => {
    await make({ name: 'Ashfall', genre: 'fantasy' }, { id: 'p1', now: 1000 });
    const updated = stored(
      await updateProject('p1', { genre: 'cyberpunk', system: 'swn' }, { now: 2000 }),
    );
    expect(updated.genre).toBe('cyberpunk');
    expect(updated.system).toBe('swn');
    expect(updated.tags).toEqual(['genre:cyberpunk', 'system:swn']);
    expect(updated.updatedAt).toBe(2000);
  });

  it('clears one when passed null, and leaves an unnamed one alone', async () => {
    await make({ name: 'Ashfall', genre: 'fantasy', system: 'adnd-2e' }, { id: 'p1', now: 1000 });
    const cleared = stored(await updateProject('p1', { genre: null }, { now: 2000 }));
    expect(cleared).not.toHaveProperty('genre');
    expect(cleared.system).toBe('adnd-2e');
    expect(cleared.tags).toEqual(['system:adnd-2e']);
  });

  it('does not touch updatedAt when the setting is written back unchanged', async () => {
    await make({ name: 'Ashfall', genre: 'fantasy' }, { id: 'p1', now: 1000 });
    const updated = stored(await updateProject('p1', { genre: 'fantasy' }, { now: 2000 }));
    expect(updated.updatedAt).toBe(1000);
  });

  it('refuses a setting tag written through tags, because the field owns it', async () => {
    await make({ name: 'Ashfall', genre: 'fantasy' }, { id: 'p1', now: 1000 });
    // A wholesale tag rewrite is what `ProjectChanges.tags` is, so this is the accident the
    // derivation exists to make impossible rather than a caller doing something exotic.
    const updated = stored(
      await updateProject(
        'p1',
        { tags: ['genre:horror', 'system:dcc', 'homebrew'] },
        { now: 2000 },
      ),
    );
    expect(updated.genre).toBe('fantasy');
    expect(updated.tags).toEqual(['homebrew', 'genre:fantasy']);
  });
});

describe("a project's ruleset default", () => {
  it('stores a registered default and derives its game-system filter', async () => {
    const created = await make(
      { name: 'Ashfall', ruleset: IRONARACHNE_RULESET_REF },
      { id: 'p1', now: 1000 },
    );

    expect(created.ruleset).toEqual(IRONARACHNE_RULESET_REF);
    expect(created).not.toHaveProperty('system');
    expect(created.tags).toEqual([]);
  });

  it('refuses a draft whose explicit system contradicts its ruleset', async () => {
    await expect(
      make({ name: 'Ashfall', system: 'dcc', ruleset: IRONARACHNE_RULESET_REF }, { id: 'p1' }),
    ).rejects.toThrow(/must describe the same game system/);
  });

  it('clears a default while retaining the newly selected system filter', async () => {
    await make({ name: 'Ashfall', ruleset: IRONARACHNE_RULESET_REF }, { id: 'p1', now: 1000 });

    const updated = stored(
      await updateProject('p1', { ruleset: null, system: 'dnd-5e' }, { now: 2000 }),
    );

    expect(updated).not.toHaveProperty('ruleset');
    expect(updated.system).toBe('dnd-5e');
    expect(updated.tags).toEqual(['system:dnd-5e']);
  });

  it('requires an incompatible filter change to explicitly clear the default', async () => {
    await make({ name: 'Ashfall', ruleset: IRONARACHNE_RULESET_REF }, { id: 'p1', now: 1000 });

    await expect(updateProject('p1', { system: 'dnd-5e' })).rejects.toThrow(
      /explicitly clear the project ruleset/,
    );
    expect(getProject('p1')?.ruleset).toEqual(IRONARACHNE_RULESET_REF);
  });

  it('changes only the project and leaves its existing artifacts untouched', async () => {
    await make({ name: 'Ashfall', ruleset: IRONARACHNE_RULESET_REF }, { id: 'p1', now: 1000 });
    const artifact = await addNote('p1', 'a1');

    await updateProject('p1', { ruleset: null, system: 'dnd-5e' }, { now: 2000 });

    expect(listArtifacts('p1')).toEqual([
      expect.objectContaining({ id: artifact.id, updatedAt: artifact.updatedAt }),
    ]);
    const read = await readArtifact(NOTE_KINDS, 'p1', artifact.id);
    expect(read?.ok && read.artifact.payload).toEqual(note);
  });

  it('refuses to author an unregistered release', async () => {
    await expect(
      make({ name: 'Ashfall', ruleset: { id: 'dcc', release: 'unregistered' } }, { id: 'p1' }),
    ).rejects.toThrow(/is not registered/);
  });
});

describe('deleteProject', () => {
  it('removes the project and reports the deletion', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    await make({ name: 'Two' }, { id: 'p2' });

    expect(removed(await deleteProject('p1'))).toEqual({
      deleted: true,
      removedArtifactIds: [],
      wasActive: false,
    });
    expect(listProjects().map((project) => project.id)).toEqual(['p2']);
  });

  it('takes the artifacts in the project with it, and leaves other projects alone', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    await make({ name: 'Two' }, { id: 'p2' });
    const kept = await addNote('p2');
    await addNote('p1', 'a1');
    await addNote('p1', 'a2');

    const deletion = removed(await deleteProject('p1'));

    expect(deletion.removedArtifactIds.sort()).toEqual(['a1', 'a2']);
    expect(listArtifacts('p1')).toEqual([]);
    expect(await readArtifact(NOTE_KINDS, 'p1', 'a1')).toBeUndefined();
    expect(listArtifacts('p2').map((summary) => summary.id)).toEqual([kept.id]);
  });

  it('reports nothing deleted for an unknown id', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    expect(removed(await deleteProject('missing'))).toEqual({
      deleted: false,
      removedArtifactIds: [],
      wasActive: false,
    });
    expect(listProjects()).toHaveLength(1);
  });

  it('clears the selection when the open project is deleted', async () => {
    await make({ name: 'One' }, { id: 'p1', now: 1000 });
    await make({ name: 'Two' }, { id: 'p2', now: 2000 });
    setActiveProject('p1');

    expect(removed(await deleteProject('p1')).wasActive).toBe(true);
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
    expect(getActiveProject()?.id).toBe('p2');
  });

  it('leaves the selection alone when another project is deleted', async () => {
    await make({ name: 'One' }, { id: 'p1', now: 1000 });
    await make({ name: 'Two' }, { id: 'p2', now: 2000 });
    setActiveProject('p1');
    await deleteProject('p2');
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
  });

  it('leaves no open project when the last one is deleted', async () => {
    await make({ name: 'Only' }, { id: 'p1' });
    setActiveProject('p1');
    await deleteProject('p1');
    expect(getActiveProject()).toBeUndefined();
  });

  it('reports a refused cascade, and keeps the project and its artifacts listed', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    await addNote('p1', 'a1');
    closeVault();
    vi.stubGlobal('indexedDB', {
      open: () => {
        const request = { error: new Error('storage is gone'), onerror: null };
        queueMicrotask(() => (request.onerror as (() => void) | null)?.());
        return request;
      },
    });

    const result = await deleteProject('p1');

    expect(result.ok === false && result.reason).toBe('storage-failed');
    expect(listProjects().map((project) => project.id)).toEqual(['p1']);
    expect(listArtifacts('p1').map((summary) => summary.id)).toEqual(['a1']);
  });
});

describe('the active project', () => {
  it('is nothing when there are no projects', async () => {
    await hydrateProjects();
    expect(getActiveProject()).toBeUndefined();
  });

  it('is the project that was opened', async () => {
    await make({ name: 'One' }, { id: 'p1', now: 1000 });
    await make({ name: 'Two' }, { id: 'p2', now: 2000 });
    expect(setActiveProject('p1')?.id).toBe('p1');
    expect(getActiveProject()?.id).toBe('p1');
  });

  it('survives a reload, because the selection is stored', async () => {
    await make({ name: 'One' }, { id: 'p1', now: 1000 });
    await make({ name: 'Two' }, { id: 'p2', now: 2000 });
    setActiveProject('p1');

    resetProjectIndex();
    await hydrateProjects();

    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
    expect(getActiveProject()?.id).toBe('p1');
  });

  it('selects the most recently updated project when nothing is open, and persists that', async () => {
    await make({ name: 'Old' }, { id: 'p1', now: 1000 });
    await make({ name: 'New' }, { id: 'p2', now: 2000 });
    expect(getActiveProject()?.id).toBe('p2');
    expect(readActiveProjectPayload().activeProjectId).toBe('p2');
  });

  it('recovers when the stored id names a project that is gone', async () => {
    await make({ name: 'One' }, { id: 'p1', now: 1000 });
    writeActiveProjectPayload('deleted-elsewhere');
    expect(getActiveProject()?.id).toBe('p1');
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
  });

  it('clears a stored id when every project is gone', async () => {
    await hydrateProjects();
    writeActiveProjectPayload('deleted-elsewhere');
    expect(getActiveProject()).toBeUndefined();
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('keeps a stored id while the index has not been read yet', () => {
    writeActiveProjectPayload('not-read-yet');
    // An empty list before hydration means "not looked", and a selection is not something to throw
    // away over a read that has not happened.
    expect(getActiveProject()).toBeUndefined();
    expect(readActiveProjectPayload().activeProjectId).toBe('not-read-yet');
  });

  it('closes the open project when set to null', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    setActiveProject('p1');
    expect(setActiveProject(null)).toBeUndefined();
    expect(readActiveProjectPayload().activeProjectId).toBeNull();
  });

  it('ignores an id that names no project', async () => {
    await make({ name: 'One' }, { id: 'p1' });
    setActiveProject('p1');
    expect(setActiveProject('missing')).toBeUndefined();
    expect(readActiveProjectPayload().activeProjectId).toBe('p1');
  });

  it('is exactly one project once one exists', async () => {
    await make({ name: 'One' }, { id: 'p1', now: 1000 });
    await make({ name: 'Two' }, { id: 'p2', now: 2000 });
    await make({ name: 'Three' }, { id: 'p3', now: 3000 });
    const active = getActiveProject();
    expect(listProjects().filter((project) => project.id === active?.id)).toHaveLength(1);
  });
});

describe('the whole set', () => {
  it('survives a reload', async () => {
    await make({ name: 'One', tags: ['fantasy'] }, { id: 'p1', now: 1000 });
    await make({ name: 'Two', description: 'Second' }, { id: 'p2', now: 2000 });
    await renameProject('p1', 'One Renamed', { now: 3000 });

    resetProjectIndex();
    await hydrateProjects();

    const reloaded = listProjects();
    expect(reloaded.map((project) => project.name)).toEqual(['One Renamed', 'Two']);
    expect(reloaded[0].tags).toEqual(['fantasy']);
    expect(reloaded[1].description).toBe('Second');
  });
});

/**
 * The store announcing what it committed, which is what keeps the project bar and a generator
 * saving from inside a panel in step. The mechanism is covered in `project_events.test.ts`; what
 * is checked here is that every write reaches it, and — the one that would be a loop rather than a
 * missing feature — that reading the active project does not.
 */
describe('change notifications', () => {
  let changes: ProjectChange[] = [];
  let unsubscribe: () => void = () => {};

  beforeEach(() => {
    changes = [];
    unsubscribe = onProjectsChanged((change) => changes.push(change));
  });

  afterEach(() => {
    unsubscribe();
    resetProjectChangeListeners();
  });

  it('announces a created project', async () => {
    const project = stored(await createProject({ name: 'Ashfall' }));

    expect(changes).toEqual([{ change: 'created', projectId: project.id }]);
  });

  it('announces an edit', async () => {
    const project = stored(await createProject({ name: 'Ashfall' }));
    changes = [];

    await renameProject(project.id, 'Ashfall Revised');

    expect(changes).toEqual([{ change: 'updated', projectId: project.id }]);
  });

  it('says nothing when an edit changed nothing', async () => {
    const project = stored(await createProject({ name: 'Ashfall' }));
    changes = [];

    await renameProject(project.id, 'Ashfall');

    expect(changes).toEqual([]);
  });

  it('announces a delete', async () => {
    const project = stored(await createProject({ name: 'Ashfall' }));
    changes = [];

    await deleteProject(project.id);

    expect(changes).toEqual([{ change: 'deleted', projectId: project.id }]);
  });

  it('says nothing when there was nothing to delete', async () => {
    await hydrateProjects();
    changes = [];

    await deleteProject('never-existed');

    expect(changes).toEqual([]);
  });

  it('announces which project was opened, and which was closed', async () => {
    const project = stored(await createProject({ name: 'Ashfall' }));
    changes = [];

    setActiveProject(project.id);
    setActiveProject(null);

    expect(changes).toEqual([
      { change: 'opened', projectId: project.id },
      { change: 'opened', projectId: null },
    ]);
  });

  it('says nothing when asked to open a project that is not there', async () => {
    await hydrateProjects();
    changes = [];

    setActiveProject('never-existed');

    expect(changes).toEqual([]);
  });

  it('stays quiet when reading the active project, even where that rewrites the pointer', async () => {
    const project = stored(await createProject({ name: 'Ashfall' }));
    writeActiveProjectPayload('a project that is gone');
    changes = [];

    expect(getActiveProject()?.id).toBe(project.id);
    expect(changes).toEqual([]);
  });
});
