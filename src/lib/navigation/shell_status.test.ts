import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { hydrateArtifacts, rememberArtifact, resetArtifactIndex } from '$lib/artifacts';
import type { ArtifactSummary } from '$lib/artifacts';
import { hydrateProjects, rememberProject, resetProjectIndex } from '$lib/projects';
import type { Project } from '$lib/projects';
import { allTools } from '$lib/tools';
import { closeVault } from '$lib/vault_db';

import { readShellStatus } from './shell_status';

/** A summary with only the fields the status reader can see. The rest would be noise here. */
function summary(id: string, projectId: string): ArtifactSummary {
  return {
    id,
    projectId,
    kind: 'culture',
    name: id,
    references: [],
    payloadVersion: 1,
    byteSize: 0,
    tags: [],
    createdAt: 0,
    updatedAt: 0,
  } as ArtifactSummary;
}

function project(id: string, name: string, updatedAt: number): Project {
  return { id, name, tags: [], createdAt: 0, updatedAt };
}

beforeEach(async () => {
  closeVault();
  resetArtifactIndex();
  resetProjectIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
  // Hydrating an empty database is what turns each index from "not looked yet" into an empty map,
  // which is what makes `remember*` below take effect at all.
  await hydrateArtifacts();
  await hydrateProjects();
});

afterEach(() => {
  closeVault();
  resetArtifactIndex();
  resetProjectIndex();
  vi.unstubAllGlobals();
});

describe('readShellStatus', () => {
  it('counts every tool in the catalog', () => {
    expect(readShellStatus().toolCount).toBe(allTools().length);
  });

  it('counts artifacts across every project, not just the open one', () => {
    // The vault is global (decision 2), so a count scoped to the active project would contradict
    // the page the number links to.
    rememberProject(project('p1', 'One', 2));
    rememberProject(project('p2', 'Two', 1));
    rememberArtifact(summary('a1', 'p1'));
    rememberArtifact(summary('a2', 'p2'));
    rememberArtifact(summary('a3', 'p2'));

    expect(readShellStatus().artifactCount).toBe(3);
  });

  it('names the open project', () => {
    rememberProject(project('p1', 'Ashfall', 5));

    const status = readShellStatus();

    expect(status.projectId).toBe('p1');
    expect(status.projectName).toBe('Ashfall');
  });

  it('leaves the project absent when there is none', () => {
    const status = readShellStatus();

    expect(status.projectId).toBeUndefined();
    expect(status.projectName).toBeUndefined();
  });

  it('reports zero rather than throwing before anything is hydrated', () => {
    // The bar renders on the first paint, before hydration has finished. Reading an unhydrated
    // index has to be an answer, not an error, or the shell takes the page down with it.
    resetArtifactIndex();
    resetProjectIndex();

    const status = readShellStatus();

    expect(status.artifactCount).toBe(0);
    expect(status.projectName).toBeUndefined();
  });

  it('reports the date it is given', () => {
    const pinned = new Date('2026-08-20T12:00:00Z');

    expect(readShellStatus(pinned).today).toBe(pinned);
  });
});
