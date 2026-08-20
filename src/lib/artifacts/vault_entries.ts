import type { ArtifactSummary } from './artifact_types';

/**
 * One row of the result vault: an artifact summary joined to the name of the project it belongs
 * to.
 *
 * The join exists so a global listing can show and filter by project without every row
 * re-querying the project index — the vault spans every project, so that lookup would otherwise
 * happen once per artifact on every render.
 */
export type VaultEntry = {
  artifact: ArtifactSummary;
  projectName: string;
};

/**
 * What an artifact's project is called when the project it names is not there.
 *
 * It should never happen: deleting a project removes its artifacts in the same transaction. If it
 * does, the artifact is still listed under this label rather than dropped — `summarizeProjectUsage`
 * can leave such an artifact out because it is answering "where did the space go", but the vault is
 * answering "what do I have", and quietly omitting a user's work is the one thing it must not do.
 */
export const ORPHANED_PROJECT_NAME = 'Project missing';

/**
 * Joins artifacts to their projects' names, preserving the order given.
 *
 * Takes a lookup rather than the projects themselves so this stays a pure function of two plain
 * values, and so `$lib/artifacts` does not have to depend on `$lib/projects` to describe its own
 * listing.
 */
export function toVaultEntries(
  summaries: ArtifactSummary[],
  projectNames: Map<string, string>,
): VaultEntry[] {
  return summaries.map((artifact) => ({
    artifact,
    projectName: projectNames.get(artifact.projectId) ?? ORPHANED_PROJECT_NAME,
  }));
}

/**
 * The projects present in a listing, alphabetically — what the vault's project filter offers.
 *
 * Sorted rather than left in encounter order, for the same reason `artifactTagsOf` is: a list of
 * options that reshuffles as artifacts are added is a list nobody can use.
 */
export function vaultProjectNames(entries: VaultEntry[]): string[] {
  return [...new Set(entries.map((entry) => entry.projectName))].sort((a, b) => a.localeCompare(b));
}

/** Narrows a listing to one project, by name. An unset name does not narrow anything. */
export function filterVaultEntriesByProject(
  entries: VaultEntry[],
  projectName?: string,
): VaultEntry[] {
  return projectName === undefined || projectName === ''
    ? entries
    : entries.filter((entry) => entry.projectName === projectName);
}
