import type { ArtifactSummary } from '$lib/artifacts';
import type { Project } from '$lib/projects';

import type { ProjectUsage } from './storage_status_types';

/**
 * Attribute the vault's bytes to the projects that hold them.
 *
 * Pure, and reading only what is already in memory: the summed `byteSize` on each summary is
 * recorded at write time, which is what makes per-project attribution possible at all —
 * `navigator.storage.estimate()` reports for the whole origin and can never answer "which project
 * is large".
 *
 * Every known project appears, including one with no artifacts. A project at zero is a real answer
 * to "where did the space go", and omitting it would make the table disagree with the project list
 * beside it.
 *
 * An artifact naming a project that is not here is counted nowhere. It should not exist — deleting
 * a project removes its artifacts in the same transaction — and inventing a row for it would
 * report a project the user cannot open, name, or delete.
 */
export function summarizeProjectUsage(
  projects: Project[],
  artifacts: ArtifactSummary[],
  exportStamps: Map<string, number>,
): ProjectUsage[] {
  const usage = new Map<string, ProjectUsage>();
  for (const project of projects) {
    const entry: ProjectUsage = { projectId: project.id, artifactCount: 0, byteSize: 0 };
    const lastExportAt = exportStamps.get(project.id);
    if (lastExportAt !== undefined) {
      entry.lastExportAt = lastExportAt;
    }
    usage.set(project.id, entry);
  }

  for (const artifact of artifacts) {
    const entry = usage.get(artifact.projectId);
    if (entry !== undefined) {
      entry.artifactCount += 1;
      entry.byteSize += artifact.byteSize;
    }
  }

  return sortByAttribution([...usage.values()]);
}

/**
 * Largest first, because "which one is big" is the question the table is actually asked
 * (docs/workshop.md, "What the user is told about storage"). Artifact count and then id break
 * ties, so the order is total and two reads of unchanged storage agree.
 */
function sortByAttribution(usage: ProjectUsage[]): ProjectUsage[] {
  return usage.sort(
    (a, b) =>
      b.byteSize - a.byteSize ||
      b.artifactCount - a.artifactCount ||
      a.projectId.localeCompare(b.projectId),
  );
}

/** The vault's own accounting of its size: every project's sum added up. */
export function totalAttributedBytes(usage: ProjectUsage[]): number {
  return usage.reduce((total, project) => total + project.byteSize, 0);
}
