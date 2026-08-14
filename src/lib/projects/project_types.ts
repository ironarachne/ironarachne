import type { TaggedItem } from '$lib/tags';

/**
 * The top-level container in the workshop: one campaign, one setting, one world. Deliberately
 * thin — a project is a namespace and a workspace, not a document with content of its own.
 * Artifacts belong to exactly one project (see docs/workshop.md); they are not modelled yet.
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
 * grows a cascade as soon as artifacts exist (#33): the artifacts inside it, and the bench state
 * that referenced them, are removed with it, and the caller has to be able to say what went.
 */
export type ProjectDeletion = {
  deleted: boolean;
  /** Ids of the artifacts removed with the project. Always empty until artifacts exist (#33). */
  removedArtifactIds: string[];
  /** True when the deleted project was the active one, so the caller knows the context moved. */
  wasActive: boolean;
};

export const PROJECTS_PAYLOAD_VERSION = 1 as const;

/** The stored envelope for the project set. Versioned and validated on read. */
export type ProjectsPayload = {
  payloadVersion: typeof PROJECTS_PAYLOAD_VERSION;
  projects: Project[];
};

export const ACTIVE_PROJECT_PAYLOAD_VERSION = 1 as const;

/**
 * The stored envelope for which project is open. Separate from {@link ProjectsPayload} because
 * this is device-scoped state rather than user work: docs/workshop.md ("What travels and what does
 * not") keeps the last-opened project out of export files, and a separate storage scope is what
 * lets export take one without the other.
 */
export type ActiveProjectPayload = {
  payloadVersion: typeof ACTIVE_PROJECT_PAYLOAD_VERSION;
  activeProjectId: string | null;
};
