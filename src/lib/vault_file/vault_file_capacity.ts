import { measureStorageEstimate } from '$lib/storage_status';

/**
 * How much room an import needs, and whether the browser looks like it has it.
 *
 * docs/workshop.md asks for this to be checked **before** writing rather than discovered at
 * artifact 900: an import refused up front, with a number attached, is something a user can act on,
 * where one that dies part way through is something they have to recover from.
 *
 * It is advisory in both directions and deliberately so. `navigator.storage.estimate()` is
 * unavailable in some browsers, fuzzed in others, and reports for the whole origin rather than for
 * this database — so a pass here is not a promise the write will succeed, and the authoritative
 * signal is still `QuotaExceededError` on the transaction itself, which unwinds the whole import.
 * This is the courtesy; the transaction is the guarantee.
 */

/**
 * Headroom kept back from the estimate before an import is allowed to fill it.
 *
 * Filling storage exactly to the quota leaves the site unable to save anything the user does next,
 * so an import is not permitted to claim the last of it. The multiplier covers what the file does
 * not describe: index entries, key overhead, and the browser's own per-record cost.
 */
export const IMPORT_SIZE_MULTIPLIER = 1.5;

export type CapacityCheck =
  | { ok: true; requiredBytes: number; availableBytes?: number }
  | { ok: false; requiredBytes: number; availableBytes: number; message: string };

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Whether an import of roughly `bytes` looks like it will fit.
 *
 * Passes when the browser will not say — an unknown quota is not a reason to refuse someone their
 * own backup, and the transaction will report the truth either way.
 */
export async function checkImportCapacity(bytes: number): Promise<CapacityCheck> {
  const requiredBytes = Math.ceil(bytes * IMPORT_SIZE_MULTIPLIER);
  const estimate = await measureStorageEstimate();
  if (estimate.quotaBytes === undefined || estimate.usageBytes === undefined) {
    return { ok: true, requiredBytes };
  }
  const availableBytes = Math.max(0, estimate.quotaBytes - estimate.usageBytes);
  if (requiredBytes <= availableBytes) {
    return { ok: true, requiredBytes, availableBytes };
  }
  return {
    ok: false,
    requiredBytes,
    availableBytes,
    message: `This import needs about ${formatMegabytes(requiredBytes)} and this browser has about ${formatMegabytes(availableBytes)} left for the site. Nothing was changed. Export and delete a project you are not using, and try again.`,
  };
}
