import type { TaggedItem } from '$lib/tags';

/**
 * The top-level container in the workshop: one campaign, one setting, one world. Deliberately
 * thin — a project is a namespace and a workspace, not a document with content of its own.
 * Artifacts belong to exactly one project (see docs/workshop.md) and live in `$lib/artifacts`.
 */
export interface Project extends TaggedItem {
  /** Stable identity. Never reused, including after the project is deleted. */
  id: string;
  /** User-facing and user-editable. Not required to be unique. */
  name: string;
  /** Optional, and absent rather than empty when the user has not written one. */
  description?: string;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  createdAt: number;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  updatedAt: number;
}

/** What a caller supplies to create a project. Everything but the name is optional. */
export type ProjectDraft = {
  name?: string;
  description?: string;
  tags?: string[];
};

/**
 * The fields a caller may change on an existing project. Omitting a field leaves it alone, which
 * is what separates "no change" from "cleared" — passing an empty string or an empty array clears.
 */
export type ProjectChanges = {
  name?: string;
  description?: string;
  tags?: string[];
};

/**
 * Identity and time, supplied rather than generated. Tests pin both; import (#35) needs to
 * recreate a project under the id and timestamps the file carries rather than minting new ones.
 */
export type ProjectMutationOptions = {
  id?: string;
  now?: number;
};

/**
 * What a delete removed. It reports rather than returns a bare boolean because deleting a project
 * cascades: the artifacts inside it and its bench go with it, in one transaction, and the caller
 * has to be able to say what went.
 */
export type ProjectDeletion = {
  deleted: boolean;
  /** Ids of the artifacts removed with the project. */
  removedArtifactIds: string[];
  /** True when the deleted project was the active one, so the caller knows the context moved. */
  wasActive: boolean;
};

/**
 * What happened to a project. `opened` is not a change to the project itself but to which one the
 * workshop is working in, which is the same news to everything watching. See `project_events.ts`.
 */
export type ProjectChangeType = 'created' | 'updated' | 'deleted' | 'opened';

/** A committed change. `projectId` is null when the change is that nothing is open any more. */
export type ProjectChange = {
  change: ProjectChangeType;
  projectId: string | null;
};

export type ProjectChangeListener = (change: ProjectChange) => void;

export const ACTIVE_PROJECT_PAYLOAD_VERSION = 1 as const;

/**
 * The stored envelope for which project is open.
 *
 * This is the one thing about projects that is still in `localStorage`, and deliberately: it is a
 * small synchronous pointer rather than user work (docs/workshop.md, "Storage substrate"). Losing
 * it costs a click. Keeping it out of the database is also what lets the answer to "which project
 * is open" be available before anything has been read, and what keeps it out of an export —
 * "What travels and what does not" puts the last-opened project firmly in the second column.
 */
export type ActiveProjectPayload = {
  payloadVersion: typeof ACTIVE_PROJECT_PAYLOAD_VERSION;
  activeProjectId: string | null;
};
