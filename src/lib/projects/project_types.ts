import type { TaggedItem } from '$lib/tags';
import type { GameSystem, Genre } from '$lib/tools';

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
  /**
   * What the project is set in, and what it is played with. Both optional — a project that is a
   * box of tools is neither — and both changeable, per decision 7 in docs/workshop.md.
   *
   * They narrow the workshop's tool list and nothing else: no artifact records the genre of the
   * project it was saved into, so changing one invalidates nothing. `Genre` and `GameSystem` are
   * the tool catalog's own vocabularies rather than a second pair, which is why this library knows
   * about `$lib/tools` and `$lib/tools` must never learn about this one.
   */
  genre?: Genre;
  system?: GameSystem;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  createdAt: number;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  updatedAt: number;
}

/** What a caller supplies to create a project. Everything but the name is optional. */
export type ProjectDraft = {
  name?: string;
  description?: string;
  genre?: Genre;
  system?: GameSystem;
  tags?: string[];
};

/**
 * The fields a caller may change on an existing project. Omitting a field leaves it alone, which
 * is what separates "no change" from "cleared" — passing an empty string or an empty array clears.
 */
export type ProjectChanges = {
  name?: string;
  description?: string;
  /**
   * `null` clears, a value sets, and omitting leaves alone. The convention the fields above use —
   * an empty string clears — has no honest analogue for an enum, and `'' as Genre` would be a lie
   * told to the type system to save a keystroke.
   */
  genre?: Genre | null;
  system?: GameSystem | null;
  tags?: string[];
};

/**
 * Identity and time, supplied rather than generated. Tests pin both; import (#35) needs to
 * recreate a project under the id and timestamps the file carries rather than minting new ones.
 */
export type ProjectMutationOptions = {
  id?: string;
  now?: number;
  /**
   * Only meaningful on create, where it separates "first made" from "written to this vault" —
   * exactly as it does for an artifact. An imported project keeps the day it was started rather
   * than being redated to the day its backup was restored.
   */
  createdAt?: number;
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
