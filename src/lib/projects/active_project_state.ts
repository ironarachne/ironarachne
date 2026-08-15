import { readScopedJson, writeScopedJson } from '$lib/persistent_save';

import { ACTIVE_PROJECT_PAYLOAD_VERSION, type ActiveProjectPayload } from './project_types';

/**
 * Storage scope holding which project is open.
 *
 * `localStorage`, not the database, and it is the only part of a project that stayed there: it is
 * a device-scoped pointer rather than user work, it has to be readable synchronously, and an
 * export deliberately does not carry it.
 */
export const ACTIVE_PROJECT_SAVE_SCOPE_ID = 'workshop.active_project' as const;

function emptyActiveProjectPayload(): ActiveProjectPayload {
  return { payloadVersion: ACTIVE_PROJECT_PAYLOAD_VERSION, activeProjectId: null };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
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
