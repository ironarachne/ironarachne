import {
  deleteWorkspaceRecord,
  readWorkspaceRecord,
  writeWorkspaceRecord,
  type VaultResult,
} from '$lib/vault_db';

import { emptyWorkspace, toProjectWorkspace } from './workspaces';
import type { ProjectWorkspace } from './workspace_types';

/**
 * A project's bench, or an empty one.
 *
 * Never a rejection, and never `undefined`. A project with no stored bench, a bench written by a
 * shape this build cannot read, and a database that would not answer all mean the same thing to
 * the caller: open the project with nothing on it. Decision 3 in docs/workshop.md is explicit
 * that a workspace that cannot be read resets to a default bench, so reporting a failure here
 * would hand the UI an error it has no better answer to than the one already returned.
 *
 * Not hydrated into an index like projects and artifacts are: a bench is read when a project is
 * opened and at no other time, so there is nothing for a cache to save.
 */
export async function readProjectWorkspace(projectId: string): Promise<ProjectWorkspace> {
  const stored = await readWorkspaceRecord(projectId);
  if (!stored.ok) {
    return emptyWorkspace(projectId);
  }
  const workspace = toProjectWorkspace(stored.value);
  if (workspace === undefined || workspace.projectId !== projectId) {
    return emptyWorkspace(projectId);
  }
  return workspace;
}

/**
 * Store a project's bench.
 *
 * Returns a result like every other write, because the store's API does not return `void` — but
 * a caller is entitled to shrug this one off. Losing a panel arrangement costs a click; the
 * reason to look at the result is diagnostics, not the user's work.
 */
export function writeProjectWorkspace(workspace: ProjectWorkspace): Promise<VaultResult<void>> {
  return writeWorkspaceRecord(workspace.projectId, workspace);
}

/**
 * Forget a project's bench without touching the project.
 *
 * Deleting a project already takes its bench with it in one transaction, so this is for the
 * narrower case of clearing a bench that has gone wrong while keeping the project.
 */
export function deleteProjectWorkspace(projectId: string): Promise<VaultResult<void>> {
  return deleteWorkspaceRecord(projectId);
}
