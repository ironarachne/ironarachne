import { forgetProjectArtifacts, hydrateArtifacts } from '$lib/artifacts';
import { deleteProjectCascade, writeProjectRecord, type VaultResult } from '$lib/vault_db';

import { readActiveProjectPayload, writeActiveProjectPayload } from './active_project_state';
import { notifyProjectsChanged } from './project_events';
import {
  forgetProject,
  hydrateProjects,
  indexedProject,
  indexedProjects,
  projectsHydrated,
  rememberProject,
} from './project_index';
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
 *
 * Synchronous, from the hydrated index. A caller that has not awaited `hydrateProjects` sees no
 * projects, which is the same answer a browser with no storage gives, so a picker never blocks a
 * render on a database read.
 */
export function listProjects(): Project[] {
  return [...indexedProjects()].sort(
    (a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

export function getProject(id: string): Project | undefined {
  return indexedProject(id);
}

/**
 * A draft as the project the store would write, **without writing it**.
 *
 * The one description of what a stored project looks like: how a blank name is filled in, how tags
 * and the description are normalised, which timestamp goes where. `createProject` writes it a
 * record at a time; a whole-vault import (#47) stages a vault's worth and commits them in one
 * transaction, and those two paths agreeing by coincidence is how an imported project ends up
 * subtly unlike a created one.
 */
export function toProjectRecord(
  draft: ProjectDraft = {},
  options: ProjectMutationOptions = {},
): Project {
  const now = options.now ?? Date.now();
  const project: Project = {
    id: options.id ?? newProjectId(),
    name: normalizeName(draft.name),
    tags: normalizeTags(draft.tags),
    createdAt: options.createdAt ?? now,
    updatedAt: now,
  };
  const description = normalizeDescription(draft.description);
  if (description !== undefined) {
    project.description = description;
  }
  return project;
}

/**
 * Create an empty project and store it. It does not become active on its own: opening what you
 * just made is a decision the caller states with `setActiveProject`, not a side effect of creating
 * it — a project created in the background must not move the workshop out from under the user.
 *
 * The result is the project, or why it could not be stored. A refused write leaves nothing behind
 * and nothing in memory, so the caller can say so and let the user try again.
 */
export async function createProject(
  draft: ProjectDraft = {},
  options: ProjectMutationOptions = {},
): Promise<VaultResult<Project>> {
  const ready = await hydrateProjects();
  if (!ready.ok) {
    return ready;
  }

  const project = toProjectRecord(draft, options);
  const written = await writeProjectRecord(project);
  if (!written.ok) {
    return written;
  }
  rememberProject(project);
  notifyProjectsChanged({ change: 'created', projectId: project.id });
  return { ok: true, value: project };
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
 * Apply changes to a project, or `undefined` when no project has that id. An omitted field is left
 * alone; an empty string or an empty array clears the field it names. A change that changes
 * nothing does not touch `updatedAt` and writes nothing, so reading a project and writing it back
 * unaltered cannot reorder the list.
 */
export async function updateProject(
  id: string,
  changes: ProjectChanges,
  options: ProjectMutationOptions = {},
): Promise<VaultResult<Project> | undefined> {
  const ready = await hydrateProjects();
  if (!ready.ok) {
    return ready;
  }
  const existing = getProject(id);
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
    return { ok: true, value: existing };
  }

  next.updatedAt = options.now ?? Date.now();
  const written = await writeProjectRecord(next);
  if (!written.ok) {
    return written;
  }
  rememberProject(next);
  notifyProjectsChanged({ change: 'updated', projectId: next.id });
  return { ok: true, value: next };
}

export function renameProject(
  id: string,
  name: string,
  options: ProjectMutationOptions = {},
): Promise<VaultResult<Project> | undefined> {
  return updateProject(id, { name }, options);
}

/**
 * Delete a project and everything it owns.
 *
 * A project owns its artifacts and its bench, and nothing else does, so they go with it — in **one
 * transaction**, which is the ownership the domain model draws with a filled diamond. There is no
 * order to reason about and no half-deleted state: under `localStorage` the artifacts had to go
 * first so that an interrupted cascade left an empty project rather than orphaned artifacts, and
 * that whole class of residue is gone.
 *
 * Deleting the active project clears the selection rather than leaving it pointing at nothing;
 * `getActiveProject` then picks whichever project was touched most recently.
 */
export async function deleteProject(id: string): Promise<VaultResult<ProjectDeletion>> {
  const ready = await hydrateProjects();
  if (!ready.ok) {
    return ready;
  }
  if (getProject(id) === undefined) {
    return { ok: true, value: { deleted: false, removedArtifactIds: [], wasActive: false } };
  }
  // The artifact index has to be in memory to be corrected afterwards. A cascade that removed the
  // records but left them listed would be worse than one that had not run at all.
  const artifacts = await hydrateArtifacts();
  if (!artifacts.ok) {
    return artifacts;
  }

  const cascaded = await deleteProjectCascade(id);
  if (!cascaded.ok) {
    return cascaded;
  }
  forgetProject(id);
  const removedArtifactIds = forgetProjectArtifacts(id);

  const wasActive = readActiveProjectPayload().activeProjectId === id;
  if (wasActive) {
    writeActiveProjectPayload(null);
  }
  notifyProjectsChanged({ change: 'deleted', projectId: id });
  return { ok: true, value: { deleted: true, removedArtifactIds, wasActive } };
}

/**
 * The open project.
 *
 * The workshop operates in exactly one project at a time, so this resolves rather than reports: a
 * stored id naming a project that is gone, or no stored id at all, selects the most recently
 * updated project and persists that choice. It is `undefined` only when there are no projects —
 * including before the index has been hydrated, since a project nothing has read yet cannot be
 * opened.
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
    // Only once the index has been read is an empty list evidence that the stored id names nothing.
    // Before that it means "not looked yet", and clearing the pointer would throw away a selection
    // that is about to be valid again.
    if (storedId !== null && projectsHydrated()) {
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
    notifyProjectsChanged({ change: 'opened', projectId: null });
    return undefined;
  }
  const project = getProject(id);
  if (project === undefined) {
    return undefined;
  }
  writeActiveProjectPayload(project.id);
  notifyProjectsChanged({ change: 'opened', projectId: project.id });
  return project;
}
