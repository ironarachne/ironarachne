import Download from '$lib/download';
import { getProject, hydrateProjects, type Project } from '$lib/projects';
import {
  hydrateArtifacts,
  listArtifacts,
  readArtifact,
  readArtifactAssets,
  type ArtifactAssetRead,
  type Artifact,
  type ArtifactSummary,
} from '$lib/artifacts';

const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const MARGIN = 15;
const BODY_FONT_SIZE = 9;
const HEADING_FONT_SIZE = 13;
const TITLE_FONT_SIZE = 22;
const LINE_HEIGHT = 4.5;

type PdfDoc = import('jspdf').jsPDF;

export type ProjectPdfArtifact = {
  summary: ArtifactSummary;
  artifact: Artifact;
  assets: ArtifactAssetRead[];
};

function displaySetting(project: Project): string[] {
  return [
    project.genre === undefined ? undefined : `Genre: ${project.genre}`,
    project.system === undefined ? undefined : `System: ${project.system}`,
    project.ruleset === undefined
      ? undefined
      : `Ruleset: ${project.ruleset.id} ${project.ruleset.release}`,
  ].filter((line): line is string => line !== undefined);
}

function printable(value: unknown): string {
  if (value === null) return 'None';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

export function projectArtifactPayloadToLines(value: unknown, indent = ''): string[] {
  if (value === null || typeof value !== 'object') return [`${indent}${printable(value)}`];
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${indent}None`];
    return value.flatMap((item) => [
      `${indent}-`,
      ...projectArtifactPayloadToLines(item, `${indent}  `),
    ]);
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return [`${indent}None`];
  return entries.flatMap(([key, item]) => {
    if (item !== null && typeof item === 'object') {
      return [`${indent}${key}:`, ...projectArtifactPayloadToLines(item, `${indent}  `)];
    }
    return [`${indent}${key}: ${printable(item)}`];
  });
}

export function projectPdfFilename(name: string): string {
  const stem = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${stem === '' ? 'project' : stem}.pdf`;
}

function writeLines(doc: PdfDoc, lines: string[], state: { y: number }): void {
  doc.setFontSize(BODY_FONT_SIZE);
  doc.setFont('helvetica', 'normal');
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, PAGE_WIDTH - MARGIN * 2);
    for (const part of wrapped) {
      if (state.y > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        state.y = MARGIN;
      }
      doc.text(part, MARGIN, state.y);
      state.y += LINE_HEIGHT;
    }
  }
}

function heading(doc: PdfDoc, text: string, state: { y: number }): void {
  if (state.y > PAGE_HEIGHT - MARGIN - 12) {
    doc.addPage();
    state.y = MARGIN;
  }
  doc.setFontSize(HEADING_FONT_SIZE);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN, state.y);
  state.y += 8;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
}

async function writeAssets(
  doc: PdfDoc,
  artifact: ProjectPdfArtifact,
  state: { y: number },
): Promise<void> {
  for (const asset of artifact.assets) {
    if (!asset.blob.type.startsWith('image/')) continue;
    if (asset.blob.type === 'image/svg+xml') {
      // jsPDF's SVG plugin rasterises through the browser DOM. A non-browser caller can still
      // export the readable artifact; it simply cannot embed this optional preview.
      if (typeof document === 'undefined') continue;
      const svg = await asset.blob.text();
      const width = Math.min(asset.metadata.width ?? 120, PAGE_WIDTH - MARGIN * 2);
      const height = Math.min(asset.metadata.height ?? 80, 80);
      if (state.y > PAGE_HEIGHT - height - MARGIN) {
        doc.addPage();
        state.y = MARGIN;
      }
      doc.addSvgAsImage(svg, MARGIN, state.y, width, height);
      state.y += height + 8;
      continue;
    }
    const dataUrl = await blobToDataUrl(asset.blob);
    const format =
      asset.blob.type === 'image/png'
        ? 'PNG'
        : asset.blob.type === 'image/jpeg'
          ? 'JPEG'
          : undefined;
    if (format === undefined) continue;
    if (state.y > PAGE_HEIGHT - 80) {
      doc.addPage();
      state.y = MARGIN;
    }
    const width = Math.min(asset.metadata.width ?? 120, PAGE_WIDTH - MARGIN * 2);
    const height = Math.min(asset.metadata.height ?? 80, 80);
    doc.addImage(dataUrl, format, MARGIN, state.y, width, height, undefined, 'FAST');
    state.y += height + 8;
  }
}

export async function collectProjectPdfArtifacts(projectId: string): Promise<ProjectPdfArtifact[]> {
  const { ARTIFACT_KINDS } = await import('$lib/workshop');
  await hydrateArtifacts();
  const result: ProjectPdfArtifact[] = [];
  for (const summary of listArtifacts(projectId)) {
    const read = await readArtifact(ARTIFACT_KINDS, projectId, summary.id);
    if (read === undefined || !read.ok) continue;
    const assets = await readArtifactAssets(summary.id);
    result.push({
      summary,
      artifact: read.artifact,
      assets: assets.ok ? assets.value : [],
    });
  }
  return result;
}

export async function buildProjectPdf(projectId: string): Promise<Blob | undefined> {
  await hydrateProjects();
  const project = getProject(projectId);
  if (project === undefined) return undefined;
  const artifacts = await collectProjectPdfArtifacts(projectId);
  const { ARTIFACT_KINDS } = await import('$lib/workshop');
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.text(project.name, PAGE_WIDTH / 2, 80, {
    align: 'center',
    maxWidth: PAGE_WIDTH - MARGIN * 2,
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE);
  if (project.description !== undefined) {
    doc.text(
      doc.splitTextToSize(project.description, PAGE_WIDTH - MARGIN * 2),
      PAGE_WIDTH / 2,
      100,
      {
        align: 'center',
        maxWidth: PAGE_WIDTH - MARGIN * 2,
      },
    );
  }
  doc.text(displaySetting(project), PAGE_WIDTH / 2, 125, { align: 'center' });

  const state = { y: MARGIN };
  for (const artifact of artifacts) {
    doc.addPage();
    state.y = MARGIN;
    heading(doc, artifact.summary.name, state);
    doc.setFontSize(BODY_FONT_SIZE - 1);
    doc.setFont('helvetica', 'italic');
    doc.text(
      ARTIFACT_KINDS.byKind.get(artifact.summary.kind)?.displayName ?? artifact.summary.kind,
      MARGIN,
      state.y,
    );
    state.y += 7;
    writeLines(doc, projectArtifactPayloadToLines(artifact.artifact.payload), state);
    await writeAssets(doc, artifact, state);
  }

  return doc.output('blob');
}

export async function downloadProjectPdf(projectId: string): Promise<string | undefined> {
  const project = getProject(projectId);
  if (project === undefined) return undefined;
  const blob = await buildProjectPdf(projectId);
  if (blob === undefined) return undefined;
  const url = URL.createObjectURL(blob);
  Download(url, projectPdfFilename(project.name));
  URL.revokeObjectURL(url);
  return projectPdfFilename(project.name);
}
