import { canonicalJson, checksumOf } from '$lib/vault_file';
import {
  readArtifactAsset,
  readArtifactAssetRecords,
  writeArtifactAssets,
  type VaultArtifactAssetRecord,
  type VaultArtifactAssetWrite,
  type VaultResult,
} from '$lib/vault_db';

export type ArtifactAssetRole = string;
export type ArtifactAsset = VaultArtifactAssetRecord;
export type ArtifactAssetDraft = {
  role: ArtifactAssetRole;
  mediaType: string;
  blob: Blob;
  width?: number;
  height?: number;
  sourceFingerprint: string;
  rendererId: string;
  rendererVersion: string;
};
export type ArtifactAssetRead = { metadata: ArtifactAsset; blob: Blob };

export function newArtifactAssetId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

export async function artifactSourceFingerprint(
  snapshot: unknown,
  rendererId: string,
  rendererVersion: string,
): Promise<string> {
  return checksumOf(`${canonicalJson(snapshot)}\n${rendererId}\n${rendererVersion}`);
}

export function assetWrite(artifactId: string, draft: ArtifactAssetDraft): VaultArtifactAssetWrite {
  const id = newArtifactAssetId();
  return {
    metadata: {
      id,
      artifactId,
      role: draft.role,
      mediaType: draft.mediaType,
      byteSize: draft.blob.size,
      ...(draft.width === undefined ? {} : { width: draft.width }),
      ...(draft.height === undefined ? {} : { height: draft.height }),
      sourceFingerprint: draft.sourceFingerprint,
      rendererId: draft.rendererId,
      rendererVersion: draft.rendererVersion,
      createdAt: Date.now(),
    },
    blob: { assetId: id, blob: draft.blob },
  };
}

export async function writeArtifactAsset(
  artifactId: string,
  draft: ArtifactAssetDraft,
): Promise<VaultResult<ArtifactAsset>> {
  const write = assetWrite(artifactId, draft);
  const result = await writeArtifactAssets([write]);
  return result.ok ? { ok: true, value: write.metadata } : result;
}

export async function readArtifactAssets(
  artifactId: string,
): Promise<VaultResult<ArtifactAssetRead[]>> {
  const records = await readArtifactAssetRecords(artifactId);
  if (!records.ok) return records;
  const result: ArtifactAssetRead[] = [];
  for (const metadata of records.value) {
    const blob = await readArtifactAsset(metadata.id);
    if (blob.ok && blob.value !== undefined) result.push({ metadata, blob: blob.value.blob });
  }
  return { ok: true, value: result };
}

export function isArtifactAssetCurrent(
  asset: ArtifactAsset,
  fingerprint: string,
  rendererId: string,
  rendererVersion: string,
): boolean {
  return (
    asset.sourceFingerprint === fingerprint &&
    asset.rendererId === rendererId &&
    asset.rendererVersion === rendererVersion
  );
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(',', 2);
  if (header === undefined || encoded === undefined) throw new Error('invalid data URL');
  const values = header.includes(';base64')
    ? Uint8Array.from(atob(encoded), (byte) => byte.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(encoded));
  return new Blob([values], {
    type: header.match(/^data:([^;]+)/)?.[1] ?? 'application/octet-stream',
  });
}

export function textToDataUrl(text: string, mediaType: string): string {
  return `data:${mediaType};charset=utf-8,${encodeURIComponent(text)}`;
}

export { readAllArtifactAssetRecords, readAllArtifactAssetBlobs } from '$lib/vault_db';
