import { getArtifactSummary, hydrateArtifacts, listArtifacts } from '$lib/artifacts';
import { getProject, hydrateProjects } from '$lib/projects';
import { readArtifactPayloadRecord, readVaultId, type VaultResult } from '$lib/vault_db';
import { readProjectWorkspace } from '$lib/workspaces';

import { checksumOf, canonicalJson, exportFileText, tryCanonicalJson } from './vault_file_format';
import {
  EXPORT_FORMAT_MARKER,
  EXPORT_FORMAT_VERSION,
  type ArtifactBody,
  type ExportBody,
  type ExportEnvelope,
  type ExportEnvelopeHeader,
  type ExportFile,
  type ExportFileResult,
  type ExportScope,
  type ExportedArtifact,
  type ProjectBody,
} from './vault_file_types';

/**
 * Which build wrote a file, for the header's diagnostics field.
 *
 * `__APP_VERSION__` is `package.json`'s version, substituted at build time by `vite.config.js`, so
 * the number in a file is the release a user actually had rather than a constant somebody has to
 * remember to bump. It is **never** a gate on import; a file from any version is read on its
 * `formatVersion` alone.
 */
export function appVersion(): string {
  return typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '';
}

export type BuildExportOptions = {
  now?: number;
};

/**
 * The file name a download lands under.
 *
 * `ironarachne-<what>-YYYY-MM-DD.json`, so ten of these in one folder sort by date and read as what
 * they are. The date is the export's own, in UTC — a file named for the day it was made is more
 * use than one named for the reader's timezone.
 */
export function exportFileName(scope: ExportScope, label: string, exportedAt: string): string {
  const day = exportedAt.slice(0, 10);
  const fallback = scope === 'vault' ? 'vault' : scope;
  return `ironarachne-${slugify(label) || fallback}-${day}.json`;
}

/** A name reduced to something a file system, a URL, and a person can all cope with. */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * An artifact and its payload exactly as storage holds them.
 *
 * The payload is **not** migrated and **not** validated on the way out. Storage holding malformed
 * or legacy data is precisely when a backup matters most, and an exporter that refuses to write
 * what it cannot parse is one that fails at the only moment it was needed. The stored
 * `payloadVersion` travels with it, so import routes it through the kind's migration path the same
 * way a read from storage does.
 */
async function exportedArtifact(
  projectId: string,
  artifactId: string,
  issues: string[],
): Promise<ExportedArtifact | undefined> {
  const summary = getArtifactSummary(projectId, artifactId);
  if (summary === undefined) {
    return undefined;
  }
  const { byteSize: _byteSize, ...rest } = summary;
  const stored = await readArtifactPayloadRecord(artifactId);
  if (!stored.ok || stored.value === undefined) {
    issues.push(`“${summary.name}” had no stored payload to export, and travels without one.`);
    return { ...rest, payload: null };
  }
  if (tryCanonicalJson(stored.value.payload) === undefined) {
    // Reported rather than thrown, per "Producing the file". One payload that cannot be written
    // must not cost the user the other two hundred.
    issues.push(`“${summary.name}” could not be written to the file, and travels without content.`);
    return { ...rest, payload: null };
  }
  return { ...rest, payload: stored.value.payload };
}

/** Artifacts sorted by id, which is what makes two exports of unchanged content byte-identical. */
function byId(artifacts: ExportedArtifact[]): ExportedArtifact[] {
  return [...artifacts].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Everything in the header, including the checksum over the body it is about to be attached to.
 *
 * Built separately from the `scope`/`body` pair so that each scope assembles its own envelope
 * without a cast: a union is only a union while its discriminant and its body are written in one
 * object literal.
 */
async function sealedHeader(exportedAt: string, body: ExportBody): Promise<ExportEnvelopeHeader> {
  return {
    format: EXPORT_FORMAT_MARKER,
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt,
    appVersion: appVersion(),
    vaultId: await vaultIdOrEmpty(),
    checksum: await checksumOf(canonicalJson(body)),
  };
}

function toExportFile(envelope: ExportEnvelope, fileName: string, issues: string[]): ExportFile {
  return { fileName, text: exportFileText(envelope), envelope, issues };
}

/**
 * This vault's id, or an empty one.
 *
 * A vault whose id could not be read still exports. The id exists so an import can recognise a file
 * as this browser's own and steer the user to the right mode; losing that costs a hint, and
 * refusing to produce a backup over it costs the backup.
 */
async function vaultIdOrEmpty(): Promise<string> {
  const stored: VaultResult<string> = await readVaultId();
  return stored.ok ? stored.value : '';
}

/**
 * A project and everything in it, as one file.
 *
 * The bench travels when there is one, because reopening an imported project with its panels as
 * they were left is the difference between a backup of the work and a backup of the workshop. It
 * is not user work, so a bench that could not be read is simply absent.
 */
export async function buildProjectExportFile(
  projectId: string,
  options: BuildExportOptions = {},
): Promise<ExportFileResult> {
  await hydrateProjects();
  const project = getProject(projectId);
  if (project === undefined) {
    return { ok: false, reason: 'not-found', message: `no project has the id "${projectId}"` };
  }
  await hydrateArtifacts();

  const issues: string[] = [];
  const artifacts: ExportedArtifact[] = [];
  for (const summary of listArtifacts(projectId)) {
    const artifact = await exportedArtifact(projectId, summary.id, issues);
    if (artifact !== undefined) {
      artifacts.push(artifact);
    }
  }

  const workspace = await readProjectWorkspace(projectId);
  const exportedAt = new Date(options.now ?? Date.now()).toISOString();
  const body: ProjectBody = {
    project,
    artifacts: byId(artifacts),
    ...(workspace.panels.length > 0 ? { workspace } : {}),
  };
  const envelope: ExportEnvelope = {
    ...(await sealedHeader(exportedAt, body)),
    scope: 'project',
    body,
  };
  return {
    ok: true,
    value: toExportFile(envelope, exportFileName('project', project.name, exportedAt), issues),
  };
}

/**
 * One artifact, as one file — what handing a single culture to another person looks like.
 *
 * Its references travel with it and will not resolve on the other side, which is the designed
 * outcome: a broken reference is [tolerated and visible](docs/workshop.md, "Composition"), and
 * quietly stripping them would lose the fact that this culture had a religion at all.
 */
export async function buildArtifactExportFile(
  projectId: string,
  artifactId: string,
  options: BuildExportOptions = {},
): Promise<ExportFileResult> {
  await hydrateArtifacts();
  const issues: string[] = [];
  const artifact = await exportedArtifact(projectId, artifactId, issues);
  if (artifact === undefined) {
    return {
      ok: false,
      reason: 'not-found',
      message: `no artifact has the id "${artifactId}" in that project`,
    };
  }

  const exportedAt = new Date(options.now ?? Date.now()).toISOString();
  const body: ArtifactBody = { artifact };
  const envelope: ExportEnvelope = {
    ...(await sealedHeader(exportedAt, body)),
    scope: 'artifact',
    body,
  };
  return {
    ok: true,
    value: toExportFile(envelope, exportFileName('artifact', artifact.name, exportedAt), issues),
  };
}
