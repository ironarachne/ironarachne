import { strToU8, unzipSync, zipSync } from 'fflate';

import {
  readAllArtifactAssetBlobs,
  readAllArtifactAssetRecords,
  type VaultArtifactAssetRecord,
} from '$lib/vault_db';
import {
  importExportFile,
  type ImportedAsset,
  type ImportExportFileOptions,
} from './vault_file_import';
import {
  buildArtifactExportFile,
  buildProjectExportFile,
  buildVaultExportFile,
} from './vault_file_export';
import type { ArtifactKindRegistry } from '$lib/artifact_kinds';
import type { ExportEnvelope, ExportFileResult } from './vault_file_types';

export type BinaryExportFile = {
  fileName: string;
  bytes: Uint8Array;
  manifest: Record<string, unknown>;
  issues: string[];
};

export function isBinaryExportBytes(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

type BinaryAsset = VaultArtifactAssetRecord & { digest: string };

async function digest(bytes: Uint8Array): Promise<string> {
  const result = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
  return [...new Uint8Array(result)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function artifactIds(envelope: ExportEnvelope): Set<string> {
  if (envelope.scope === 'artifact') return new Set([envelope.body.artifact.id]);
  return new Set(envelope.body.artifacts.map((artifact) => artifact.id));
}

async function packageExport(
  built: ExportFileResult,
): Promise<{ ok: true; value: BinaryExportFile } | { ok: false; reason: string; message: string }> {
  if (!built.ok) return built;
  const envelope = built.value.envelope;
  const ids = artifactIds(envelope);
  const records = await readAllArtifactAssetRecords();
  const blobs = await readAllArtifactAssetBlobs();
  if (!records.ok || !blobs.ok) {
    return {
      ok: false,
      reason: 'storage-failed',
      message: 'The saved previews could not be read.',
    };
  }
  const byId = new Map(blobs.value.map((blob) => [blob.assetId, blob.blob]));
  const assets: BinaryAsset[] = [];
  const files: Record<string, Uint8Array> = { 'manifest.json': strToU8('') };
  for (const record of records.value
    .filter((asset) => ids.has(asset.artifactId))
    .sort((a, b) => a.id.localeCompare(b.id))) {
    const blob = byId.get(record.id);
    if (blob === undefined) continue;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    assets.push({ ...record, digest: await digest(bytes) });
    files[`assets/${record.id}`] = bytes;
  }
  const manifest = { ...envelope, assets } as Record<string, unknown>;
  files['manifest.json'] = strToU8(JSON.stringify(manifest));
  return {
    ok: true,
    value: {
      fileName: built.value.fileName.replace(/\.json$/, '.zip'),
      bytes: zipSync(files),
      manifest,
      issues: built.value.issues,
    },
  };
}

export async function buildArtifactBinaryExportFile(
  projectId: string,
  artifactId: string,
): Promise<{ ok: true; value: BinaryExportFile } | { ok: false; reason: string; message: string }> {
  return packageExport(await buildArtifactExportFile(projectId, artifactId));
}

export async function buildProjectBinaryExportFile(
  projectId: string,
): Promise<{ ok: true; value: BinaryExportFile } | { ok: false; reason: string; message: string }> {
  return packageExport(await buildProjectExportFile(projectId));
}

export async function buildVaultBinaryExportFile(): Promise<
  { ok: true; value: BinaryExportFile } | { ok: false; reason: string; message: string }
> {
  return packageExport(await buildVaultExportFile());
}

export async function importBinaryExportFile(
  registry: ArtifactKindRegistry,
  bytes: Uint8Array,
  options: ImportExportFileOptions = {},
) {
  const files = unzipSync(bytes);
  const manifest = files['manifest.json'];
  if (manifest === undefined)
    return { ok: false as const, reason: 'damaged' as const, message: 'The ZIP has no manifest.' };
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(new TextDecoder().decode(manifest)) as Record<string, unknown>;
  } catch {
    return {
      ok: false as const,
      reason: 'damaged' as const,
      message: 'The ZIP manifest is damaged.',
    };
  }
  const assets = Array.isArray(parsed.assets) ? (parsed.assets as BinaryAsset[]) : [];
  delete parsed.assets;
  const assetInputs: ImportedAsset[] = [];
  const assetIssues: string[] = [];
  for (const asset of assets) {
    const data = files[`assets/${asset.id}`];
    if (data === undefined) {
      assetIssues.push(`asset ${asset.id} is missing from the archive.`);
      continue;
    }
    if ((await digest(data)) !== asset.digest) {
      assetIssues.push(`asset ${asset.id} failed its checksum.`);
      continue;
    }
    const { digest: _digest, ...metadata } = asset;
    assetInputs.push({
      metadata,
      blob: new Blob([data], { type: asset.mediaType }),
    });
  }
  return importExportFile(registry, JSON.stringify(parsed), {
    ...options,
    assetInputs,
    assetIssues,
  });
}
