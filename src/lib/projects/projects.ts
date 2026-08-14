import { deleteProjectArtifacts } from '$lib/artifacts';

import {
  readActiveProjectPayload,
  readProjectsPayload,
  writeActiveProjectPayload,
  writeProjectsPayload,
} from './project_saved_state';
import type {
  Project,
  ProjectChanges,
  ProjectDeletion,
  ProjectDraft,
  ProjectMutationOptions,
} from './project_types';

/** What an unnamed project is called. Names are not required to be unique, so this may repeat. */
export const DEFAULT_PROJECT_NAME = 'Untitled project';

function normalizeName(name: string | undefined): string {
  const trimmed = (name ?? '').trim();
  return trimmed === '' ? DEFAULT_PROJECT_NAME : trimmed;
}

/** Absent rather than empty, so a cleared description does not linger as `''` in storage. */
function normalizeDescription(description: string | undefined): string | undefined {
  const trimmed = (description ?? '').trim();
  return trimmed === '' ? undefined : trimmed;
}

function normalizeTags(tags: string[] | undefined): string[] {
  const seen = new Set<string>();
  for (const tag of tags ?? []) {
    const trimmed = tag.trim();
    if (trimmed !== '') {
      seen.add(trimmed);
    }
  }
  return [...seen];
}

/**
 * A random, never-reused project id. `crypto.randomUUID` is the right answer where it exists; the
 * fallback covers browsers that predate it, because failing to create a project is a worse outcome
 * than an id with less entropy behind it.
 */
export function newProjectId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid !== undefined) {
    return uuid;
  }
  return `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Every project, most recently updated first — the order a project picker wants. Name and id break
 * ties so the order is total and two reads of unchanged storage agree.
 */
export function listProjects(): Project[] {
  return [...readProjectsPayload().projects].sort(
    (a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

export function getProject(id: string): Project | undefined {
  return readProjectsPayload().projects.find((project) => project.id === id);
}

/**
 * Create an empty project and store it. It does not become active on its own: opening what you
 * just made is a decision the caller states with `setActiveProject`, not a side effect of creating
 * it — a project created in the background must not move the workshop out from under the user.
 */
export function createProject(
  draft: ProjectDraft = {},
  options: ProjectMutationOptions = {},
): Project {
  const now = options.now ?? Date.now();
  const project: Project = {
    id: options.id ?? newProjectId(),
    name: normalizeName(draft.name),
    tags: normalizeTags(draft.tags),
    createdAt: now,
    updatedAt: now,
  };
  const description = normalizeDescription(draft.description);
  if (description !== undefined) {
    project.description = description;
  }
  writeProjectsPayload([...readProjectsPayload().projects, project]);
  return project;
}

function sameProject(a: Project, b: Project): boolean {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.tags.length === b.tags.length &&
    a.tags.every((tag, index) => tag === b.tags[index])
  );
}

/**
 * Apply changes to a project, returning the stored result, or `undefined` when no project has that
 * id. An omitted field is left alone; an empty string or an empty array clears the field it names.
 * A change that changes nothing does not touch `updatedAt`, so reading a project and writing it
 * back unaltered cannot reorder the list.
 */
export function updateProject(
  id: string,
  changes: ProjectChanges,
  options: ProjectMutationOptions = {},
): Project | undefined {
  const projects = readProjectsPayload().projects;
  const existing = projects.find((project) => project.id === id);
  if (existing === undefined) {
    return undefined;
  }

  const next: Project = {
    ...existing,
    name: changes.name === undefined ? existing.name : normalizeName(changes.name),
    tags: changes.tags === undefined ? existing.tags : normalizeTags(changes.tags),
  };
  if (changes.description !== undefined) {
    const description = normalizeDescription(changes.description);
    if (description === undefined) {
      delete next.description;
    } else {
      next.description = description;
    }
  }
  if (sameProject(existing, next)) {
    return existing;
  }

  next.updatedAt = options.now ?? Date.now();
  writeProjectsPayload(projects.map((project) => (project.id === id ? next : project)));
  return next;
}

export function renameProject(
  id: string,
  name: string,
  options: ProjectMutationOptions = {},
): Project | undefined {
  return updateProject(id, { name }, options);
}

/**
 * Delete a project and everything it owns.
 *
 * A project owns its artifacts and nothing else does, so they go with it — `$lib/artifacts` does
 * the removal and reports the ids. The dependency runs this way round on purpose: the store is
 * keyed by project id and knows nothing about the project set, which is what keeps it from
 * reaching back into here.
 *
 * The artifacts go first. A refused write between the two leaves a project with nothing in it,
 * which the user can delete again; the reverse order would leave artifacts in a project that no
 * longer exists, which nothing would ever list or collect.
 *
 * Deleting the active project clears the selection rather than leaving it pointing at nothing;
 * `getActiveProject` then picks whichever project was touched most recently.
 */
export function deleteProject(id: string): ProjectDeletion {
  const projects = readProjectsPayload().projects;
  const remaining = projects.filter((project) => project.id !== id);
  if (remaining.length === projects.length) {
    return { deleted: false, removedArtifactIds: [], wasActive: false };
  }

  const removedArtifactIds = deleteProjectArtifacts(id);
  writeProjectsPayload(remaining);

  const wasActive = readActiveProjectPayload().activeProjectId === id;
  if (wasActive) {
    writeActiveProjectPayload(null);
  }
  return { deleted: true, removedArtifactIds, wasActive };
}

/**
 * The open project.
 *
 * The workshop operates in exactly one project at a time, so this resolves rather than reports: a
 * stored id naming a project that is gone, or no stored id at all, selects the most recently
 * updated project and persists that choice. It is `undefined` only when there are no projects.
 */
export function getActiveProject(): Project | undefined {
  const projects = listProjects();
  const storedId = readActiveProjectPayload().activeProjectId;
  const stored = projects.find((project) => project.id === storedId);
  if (stored !== undefined) {
    return stored;
  }

  const fallback = projects[0];
  if (fallback === undefined) {
    if (storedId !== null) {
      writeActiveProjectPayload(null);
    }
    return undefined;
  }
  writeActiveProjectPayload(fallback.id);
  return fallback;
}

/**
 * Open a project, or `null` to close whatever is open. An id that names no project changes
 * nothing and returns `undefined`, because opening a project that is not there is a bug in the
 * caller rather than an instruction to clear the selection.
 */
export function setActiveProject(id: string | null): Project | undefined {
  if (id === null) {
    writeActiveProjectPayload(null);
    return undefined;
  }
  const project = getProject(id);
  if (project === undefined) {
    return undefined;
  }
  writeActiveProjectPayload(project.id);
  return project;
}
