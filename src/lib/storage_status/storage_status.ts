import { hydrateArtifacts } from '$lib/artifacts';
import { hydrateProjects } from '$lib/projects';
import {
  VAULT_META_KEYS,
  readProjectExportStamps,
  readVaultMeta,
  writeProjectExportStamp,
  writeVaultMeta,
  type VaultResult,
} from '$lib/vault_db';

import { summarizeProjectUsage, totalAttributedBytes } from './project_usage';
import { measureStorageEstimate, readPersistenceState } from './storage_estimate';
import type { StorageMeasurement, StorageStatus } from './storage_status_types';

/**
 * How far the vault's own accounting has to move before the estimate is taken again.
 *
 * docs/workshop.md ("Storage limits") asks for `estimate()` at startup and after writes that
 * materially change size, cached in between — it is cheap, not free, and nothing calls it per
 * keystroke. A megabyte is the line between the two: renaming an artifact moves the sum by bytes
 * and re-uses the cached figure, while saving a region map moves it by megabytes and is worth a
 * fresh reading.
 *
 * Deriving staleness from the summed size rather than from a caller announcing a write is
 * deliberate. An invalidation somebody has to remember to call is one somebody will forget, and
 * the resulting number is wrong with no sign that it is.
 */
export const MATERIAL_SIZE_CHANGE_BYTES = 1024 * 1024;

let measurement: StorageMeasurement | null = null;

/** The vault's attributed total at the moment {@link measurement} was taken. */
let measuredTotalBytes = 0;

/**
 * Throw away the cached estimate so the next status read takes a fresh one.
 *
 * For the changes the summed size cannot see: a vault import or a "clear everything" moves the
 * origin's usage without the artifact summaries necessarily moving with it, and a granted
 * persistence request changes what the browser is willing to give. Tests use it to start clean.
 */
export function invalidateStorageMeasurement(): void {
  measurement = null;
  measuredTotalBytes = 0;
}

async function cachedMeasurement(attributedBytes: number): Promise<StorageMeasurement> {
  const drift = Math.abs(attributedBytes - measuredTotalBytes);
  if (measurement !== null && drift < MATERIAL_SIZE_CHANGE_BYTES) {
    return measurement;
  }
  measurement = await measureStorageEstimate();
  measuredTotalBytes = attributedBytes;
  return measurement;
}

/** A stored timestamp, or `undefined` when the vault holds nothing usable under that key. */
function storedTimestamp(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
}

/**
 * Assemble what the storage panel shows: how long ago the user exported, whether the origin is
 * protected, how full it is, and which projects account for it.
 *
 * A result rather than a bare status, because three of the four parts come out of the database and
 * a browser that cannot reach it has no status to report — not an empty one. An empty vault and an
 * unreadable one are different answers, and only one of them means the user has lost nothing.
 *
 * The estimate is cached (see {@link MATERIAL_SIZE_CHANGE_BYTES}) and `measuredAt` says when it was
 * taken; everything else is read fresh, because everything else is cheap.
 */
export async function readStorageStatus(): Promise<VaultResult<StorageStatus>> {
  const projects = await hydrateProjects();
  if (!projects.ok) {
    return projects;
  }
  const artifacts = await hydrateArtifacts();
  if (!artifacts.ok) {
    return artifacts;
  }
  const exportStamps = await readProjectExportStamps();
  if (!exportStamps.ok) {
    return exportStamps;
  }
  const vaultExport = await readVaultMeta(VAULT_META_KEYS.lastVaultExportAt);
  if (!vaultExport.ok) {
    return vaultExport;
  }

  const usage = summarizeProjectUsage(projects.value, artifacts.value, exportStamps.value);
  const measured = await cachedMeasurement(totalAttributedBytes(usage));

  const status: StorageStatus = {
    persistence: await readPersistenceState(),
    measuredAt: measured.measuredAt,
    projects: usage,
  };
  if (measured.usageBytes !== undefined) {
    status.usageBytes = measured.usageBytes;
  }
  if (measured.quotaBytes !== undefined) {
    status.quotaBytes = measured.quotaBytes;
  }
  const lastVaultExportAt = storedTimestamp(vaultExport.value);
  if (lastVaultExportAt !== undefined) {
    status.lastVaultExportAt = lastVaultExportAt;
  }
  return { ok: true, value: status };
}

/**
 * Record that the whole vault was exported.
 *
 * **Called only once an export has succeeded**, and by nothing else. This is the number the panel
 * leads with, because fullness predicts inconvenience and export recency predicts loss
 * (docs/workshop.md, decision 6). Stamping it for an export that failed or was cancelled would
 * replace a true warning with a false reassurance — the one lie this display cannot afford.
 */
export function recordVaultExport(exportedAt: number = Date.now()): Promise<VaultResult<void>> {
  return writeVaultMeta(VAULT_META_KEYS.lastVaultExportAt, exportedAt);
}

/**
 * Record that one project was exported, reporting `false` when no project has that id.
 *
 * The same rule as {@link recordVaultExport}: successful exports only. Exporting a project does not
 * stamp the vault — six project exports are not a vault export, and treating them as one is how a
 * user ends up believing the project they forgot is covered.
 */
export function recordProjectExport(
  projectId: string,
  exportedAt: number = Date.now(),
): Promise<VaultResult<boolean>> {
  return writeProjectExportStamp(projectId, exportedAt);
}
