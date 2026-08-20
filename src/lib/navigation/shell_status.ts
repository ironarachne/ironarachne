import { indexedArtifacts } from '$lib/artifacts';
import { getActiveProject } from '$lib/projects';
import { allTools } from '$lib/tools';

/**
 * What the top bar says: how much the site holds, what the user is working in, and the date.
 *
 * `projectId` and `projectName` are absent together or present together — there is one active
 * project or there is none. They are not folded into a single `Project` because the bar wants the
 * name and the id and nothing else, and holding the whole record would invite a caller to reach
 * through the status object for state it should be reading from `$lib/projects`.
 */
export type ShellStatus = {
  toolCount: number;
  artifactCount: number;
  projectId?: string;
  projectName?: string;
  today: Date;
};

/**
 * Assembles the status strip from the catalogs and indexes that already exist. Owns no storage.
 *
 * Synchronous, and reads the hydrated indexes rather than the database, exactly as `listArtifacts`
 * does: a caller that has not awaited `hydrateArtifacts` sees zero, which is the same answer a
 * browser with no storage would give. A status bar must never be the thing that blocks a render.
 *
 * `now` is a parameter rather than a `new Date()` inside, so the one value here that changes on its
 * own is supplied by the caller and can be pinned in a test.
 */
export function readShellStatus(now: Date = new Date()): ShellStatus {
  const project = getActiveProject();

  return {
    toolCount: allTools().length,
    artifactCount: indexedArtifacts().length,
    projectId: project?.id,
    projectName: project?.name,
    today: now,
  };
}
