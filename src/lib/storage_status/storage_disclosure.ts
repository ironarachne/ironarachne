import { VAULT_META_KEYS, readVaultMeta, writeVaultMeta, type VaultResult } from '$lib/vault_db';

/**
 * Whether the user has already been told their work lives in this browser only.
 *
 * A result rather than a bare boolean, because "the vault would not answer" is not "they have not
 * been told". A caller that flattened a failed read into `false` would show the disclosure again to
 * someone who has seen it, every time the database was unhappy.
 */
export async function hasSeenStorageDisclosure(): Promise<VaultResult<boolean>> {
  const stored = await readVaultMeta(VAULT_META_KEYS.storageDisclosureShownAt);
  if (!stored.ok) {
    return stored;
  }
  return { ok: true, value: typeof stored.value === 'number' && Number.isFinite(stored.value) };
}

/**
 * Record that the disclosure has been shown.
 *
 * A timestamp rather than a flag: when someone was told is answerable for free here, and the
 * storage panel may want to say it. The value is what makes {@link hasSeenStorageDisclosure} true.
 *
 * **A refused write means the disclosure appears again next time**, and that is the right failure.
 * Remembering it in memory and stamping optimistically would produce a user who was told once,
 * during a run where the database was refusing writes, and never again.
 */
export function recordStorageDisclosureShown(
  shownAt: number = Date.now(),
): Promise<VaultResult<void>> {
  return writeVaultMeta(VAULT_META_KEYS.storageDisclosureShownAt, shownAt);
}
