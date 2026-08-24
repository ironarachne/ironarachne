import { downloadTextFile } from '$lib/download';
import { recordVaultExport, requestPersistenceIfWarranted } from '$lib/storage_status';

import { buildVaultExportFile } from './vault_file_export';
import type { VaultExportResult } from './vault_file_types';

/**
 * Export the whole vault: build the file, hand it to the browser, and only then record that it
 * happened.
 *
 * **The order is the rule.** The stamp is what the storage panel leads with, and it is the number
 * that tells a user how long their work has been this browser's only copy. Writing it for an export
 * the browser refused, or one that never built, would replace a true warning with a false
 * reassurance — the one lie this display cannot afford. So nothing is recorded until
 * `downloadTextFile` reports that the file was taken.
 *
 * This lives here rather than in a component because two surfaces run it — the storage panel's
 * primary action and the backup controls — and a backup flow that exists twice is one where the
 * stamp gets written in one copy and forgotten in the other. It is also the only way the rule above
 * can be tested at all.
 *
 * A completed export is one of the three moments allowed to ask the browser for persistence
 * (docs/storage-disclosure.md): the user has just done real work. Nothing waits on the answer and
 * no outcome changes the export.
 *
 * Never rejects. Every way this can end is a status the caller renders.
 */
export async function exportWholeVault(): Promise<VaultExportResult> {
  const built = await buildVaultExportFile();
  if (!built.ok) {
    return { status: 'failed', issues: [], reason: built.reason };
  }

  const { fileName, text, issues } = built.value;
  if (!downloadTextFile(text, fileName)) {
    // The file is intact and the caller can still offer it to be copied out, so this is not a
    // failure — it is a save that has not happened yet.
    return { status: 'blocked', fileName, text, issues };
  }

  // The stamp's own result is deliberately dropped. The backup is already on disk, and reporting a
  // bookkeeping write as an export failure would be worse than the stale figure it costs; it is not
  // the user's work.
  await recordVaultExport();
  await requestPersistenceIfWarranted('vaultExported');

  return { status: 'saved', fileName, issues };
}
