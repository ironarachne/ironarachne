import Download from '$lib/download';
import { hydrateProjects, getProject } from '$lib/projects';
import { hydrateArtifacts, listArtifacts, readArtifact, readArtifactAssets } from '$lib/artifacts';
import { ARTIFACT_KINDS, loadArtifactValue } from '$lib/workshop';
import { readArtifactAssetRecords } from '$lib/vault_db';

import { renderProjectBook } from './project_book_layout';
import {
  incompleteEntry,
  presentArtifact,
  publicationNeedsLiveValue,
  projectPublication,
  type PublicationEntry,
} from './project_publication';

export type ProjectPdfResult = { blob: Blob; warnings: string[]; incompleteEntries: string[] };
export type ProjectPdfDownload = {
  filename: string;
  warnings: string[];
  incompleteEntries: string[];
};

export function projectPdfFilename(name: string): string {
  const stem = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${stem === '' ? 'project' : stem}.pdf`;
}

/**
 * Read every artifact in project order, including ones this build cannot understand. A
 * publication note is more honest than dropping an entry from a book the user expects to be
 * complete. Rehydration uses the kind codec, which rebuilds live helpers without rerolling the
 * saved content; the same path is used when a generator opens a saved artifact.
 */
export async function collectProjectPdfArtifacts(projectId: string): Promise<PublicationEntry[]> {
  await hydrateArtifacts();
  const entries: PublicationEntry[] = [];
  for (const summary of listArtifacts(projectId)) {
    const kindLabel = ARTIFACT_KINDS.byKind.get(summary.kind)?.displayName ?? summary.kind;
    const read = await readArtifact(ARTIFACT_KINDS, projectId, summary.id);
    if (read === undefined || !read.ok) {
      entries.push(
        incompleteEntry(summary, kindLabel, 'The saved contents cannot be read by this version.'),
      );
      continue;
    }
    let value: unknown = read.artifact.payload;
    if (publicationNeedsLiveValue(summary.kind)) {
      const loaded = await loadArtifactValue(projectId, summary.id);
      if (!loaded.ok) {
        entries.push(
          incompleteEntry(
            summary,
            kindLabel,
            'The saved contents could not be prepared for the book.',
          ),
        );
        continue;
      }
      value = loaded.value;
    }
    const assets = await readArtifactAssets(summary.id);
    const assetRecords = await readArtifactAssetRecords(summary.id);
    const entry = await presentArtifact(
      read.artifact,
      assets.ok ? assets.value : [],
      kindLabel,
      value,
    );
    if (!assets.ok || !assetRecords.ok || assetRecords.value.length !== assets.value.length) {
      const message = `Saved images for “${summary.name}” could not be read.`;
      entry.status = 'incomplete';
      entry.warnings.push(message);
      entry.blocks.push({ type: 'notice', text: message });
    }
    entries.push(entry);
  }
  return entries;
}

export async function buildProjectPdfResult(
  projectId: string,
): Promise<ProjectPdfResult | undefined> {
  await hydrateProjects();
  const project = getProject(projectId);
  if (project === undefined) return undefined;
  const entries = await collectProjectPdfArtifacts(projectId);
  return renderProjectBook(projectPublication(project, entries));
}

export async function buildProjectPdf(projectId: string): Promise<Blob | undefined> {
  return (await buildProjectPdfResult(projectId))?.blob;
}

export async function downloadProjectPdf(
  projectId: string,
): Promise<ProjectPdfDownload | undefined> {
  const project = getProject(projectId);
  if (project === undefined) return undefined;
  const result = await buildProjectPdfResult(projectId);
  if (result === undefined) return undefined;
  const filename = projectPdfFilename(project.name);
  const url = URL.createObjectURL(result.blob);
  try {
    Download(url, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
  return {
    filename,
    warnings: result.warnings,
    incompleteEntries: result.incompleteEntries,
  };
}
