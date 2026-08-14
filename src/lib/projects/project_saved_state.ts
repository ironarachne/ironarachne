import { readScopedJson, writeScopedJson } from '$lib/persistent_save';

import {
  ACTIVE_PROJECT_PAYLOAD_VERSION,
  PROJECTS_PAYLOAD_VERSION,
  type ActiveProjectPayload,
  type Project,
  type ProjectsPayload,
} from './project_types';

/** Storage scope holding every project. User work; travels in an export. */
export const PROJECTS_SAVE_SCOPE_ID = 'workshop.projects' as const;

/**
 * Storage scope holding which project is open. Device-scoped preference, deliberately apart from
 * the projects themselves so an export can carry the work without carrying this.
 */
export const ACTIVE_PROJECT_SAVE_SCOPE_ID = 'workshop.active_project' as const;

function emptyProjectsPayload(): ProjectsPayload {
  return { payloadVersion: PROJECTS_PAYLOAD_VERSION, projects: [] };
}

function emptyActiveProjectPayload(): ActiveProjectPayload {
  return { payloadVersion: ACTIVE_PROJECT_PAYLOAD_VERSION, activeProjectId: null };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

/**
 * A stored record is a project only if every field it needs is the right type. Anything else is
 * not repaired by guessing: a record missing an id has no identity to restore it under, and one
 * with a non-numeric `updatedAt` cannot be ordered against the rest.
 */
export function isProject(value: unknown): value is Project {
  const record = asRecord(value);
  if (record === null) {
    return false;
  }
  if (typeof record.id !== 'string' || record.id === '') {
    return false;
  }
  if (typeof record.name !== 'string') {
    return false;
  }
  if (record.description !== undefined && typeof record.description !== 'string') {
    return false;
  }
  if (!isStringArray(record.tags)) {
    return false;
  }
  return Number.isFinite(record.createdAt) && Number.isFinite(record.updatedAt);
}

/**
 * The project set as stored, or an empty set when there is nothing readable there.
 *
 * Absent, malformed, and wrong-version payloads all read as empty rather than throwing, per
 * requirement 3.3 in docs/workshop.md. Individual records that do not validate are dropped from
 * the result; once the import machinery lands (#35) that is where they get quarantined instead,
 * and this is the single place that has to change to do it.
 */
export function readProjectsPayload(): ProjectsPayload {
  const raw = readScopedJson(PROJECTS_SAVE_SCOPE_ID);
  const record = asRecord(raw);
  if (record === null || record.payloadVersion !== PROJECTS_PAYLOAD_VERSION) {
    return emptyProjectsPayload();
  }
  if (!Array.isArray(record.projects)) {
    return emptyProjectsPayload();
  }
  return {
    payloadVersion: PROJECTS_PAYLOAD_VERSION,
    projects: record.projects.filter(isProject),
  };
}

export function writeProjectsPayload(projects: Project[]): void {
  writeScopedJson(PROJECTS_SAVE_SCOPE_ID, {
    payloadVersion: PROJECTS_PAYLOAD_VERSION,
    projects,
  } satisfies ProjectsPayload);
}

/**
 * The stored active project id, or `null` when there is none. The id is not checked against the
 * project set here — storage does not know the set — so a returned id may name a project that no
 * longer exists. Resolving that is `getActiveProject`'s job.
 */
export function readActiveProjectPayload(): ActiveProjectPayload {
  const raw = readScopedJson(ACTIVE_PROJECT_SAVE_SCOPE_ID);
  const record = asRecord(raw);
  if (record === null || record.payloadVersion !== ACTIVE_PROJECT_PAYLOAD_VERSION) {
    return emptyActiveProjectPayload();
  }
  if (record.activeProjectId !== null && typeof record.activeProjectId !== 'string') {
    return emptyActiveProjectPayload();
  }
  return {
    payloadVersion: ACTIVE_PROJECT_PAYLOAD_VERSION,
    activeProjectId: record.activeProjectId === '' ? null : record.activeProjectId,
  };
}

export function writeActiveProjectPayload(activeProjectId: string | null): void {
  writeScopedJson(ACTIVE_PROJECT_SAVE_SCOPE_ID, {
    payloadVersion: ACTIVE_PROJECT_PAYLOAD_VERSION,
    activeProjectId,
  } satisfies ActiveProjectPayload);
}
