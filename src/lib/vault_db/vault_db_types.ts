/**
 * The five object stores, per the *storage layer* diagram in docs/workshop.md. The names are the
 * ones written to disk, so renaming one is a schema migration rather than a rename.
 */
export type VaultStoreName = 'projects' | 'artifacts' | 'artifact_payloads' | 'workspaces' | 'meta';

/**
 * Why the database could not do what was asked.
 *
 * `quota-exceeded` is the only authoritative storage-is-full signal there is — an estimate is
 * advisory and is never what a write is refused on (docs/workshop.md, "Storage limits"), so it is
 * separated from the general failure it would otherwise hide inside.
 *
 * `unavailable` is a browser with no IndexedDB at all, or one that refuses to open a database — a
 * private window, a blocked origin, or prerendering, where `indexedDB` is simply not there.
 */
export type VaultFailureReason = 'unavailable' | 'quota-exceeded' | 'storage-failed';

/**
 * What every database operation returns.
 *
 * **Nothing here returns `void`**, per docs/workshop.md ("Storage limits"): an API that returns
 * nothing makes silent loss the default and leaves "do not lose saves" to the caller's discipline,
 * which is the wrong place for it. A failed write is a value the caller has to look at.
 *
 * Reads use the same type. A read that cannot reach the database has failed in the same way, and a
 * caller that has to tell "empty" from "could not look" is better served by one shape than by two.
 */
export type VaultResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: VaultFailureReason; message: string };

/**
 * A record in the `projects` store: the project under its own id.
 *
 * The stored object is wrapped rather than stored bare so the record can grow fields the project
 * itself does not have — `lastExportAt` is the one docs/workshop.md already names. The database
 * does not know what a project is beyond its id, which is what keeps `$lib/projects` the only
 * library that decides the shape.
 *
 * `lastExportAt` is epoch milliseconds of the last **successful** export of this project, written
 * by export and nothing else. It is here rather than on the `Project` because it is not something
 * the user edits, it does not travel in an export file, and a project written back unchanged must
 * not be able to erase it — which is why {@link writeProjectRecord} preserves it.
 */
export type VaultProjectRecord = { id: string; value: unknown; lastExportAt?: number };

/**
 * The minimum the database knows about an artifact summary: its identity and its project. The
 * rest of the record is whatever `$lib/artifacts` stores, kept as it was handed over.
 *
 * `projectId` is here because the `by_projectId` index is built on it. The field stays
 * authoritative — the index is derived from it, never the other way round.
 */
export type VaultArtifactRecord = { id: string; projectId: string };

/** A record in the `artifact_payloads` store: one payload, loaded only when an artifact is opened. */
export type VaultArtifactPayloadRecord = { artifactId: string; payload: unknown };

/** A record in the `workspaces` store: one project's bench. Not user work; see decision 3. */
export type VaultWorkspaceRecord = { projectId: string; value: unknown };

/** A record in the `meta` store. */
export type VaultMetaRecord = { key: string; value: unknown };

/**
 * The keys the `meta` store holds. Kept together because they are the one store with no schema of
 * its own, so this list is the schema.
 */
export const VAULT_META_KEYS = {
  /** The schema version the database was last upgraded to. Written by the upgrade transaction. */
  schemaVersion: 'schemaVersion',
  /** Identifies this vault in an export file, so an import can tell "mine" from "someone else's". */
  vaultId: 'vaultId',
  /** Epoch milliseconds of the last successful vault export. Written by export, nothing else. */
  lastVaultExportAt: 'lastVaultExportAt',
  /** Epoch milliseconds of the one-time copy of the `localStorage` workshop keys into here. */
  localStorageAdoptedAt: 'localStorageAdoptedAt',
} as const;

export type VaultMetaKey = (typeof VAULT_META_KEYS)[keyof typeof VAULT_META_KEYS];
