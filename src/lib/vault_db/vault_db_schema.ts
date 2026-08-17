import { VAULT_META_KEYS, type VaultStoreName } from './vault_db_types';

/** The database name. One database per origin holds the whole vault. */
export const VAULT_DATABASE_NAME = 'ironarachne.vault' as const;

/**
 * The schema version. Raised when a store or an index is added, removed, or re-keyed, and never
 * for a change to what is inside a record — payload shapes are versioned per kind by
 * `payloadVersion`, which is the artifact kind registry's business rather than the database's.
 *
 * This number replaces the per-record `storeVersion` the `localStorage` store carried. A database
 * has one version and one upgrade transaction, so a record no longer has to describe its own
 * schema (docs/workshop.md, "The storage layer").
 */
export const VAULT_SCHEMA_VERSION = 2;

/** The index on the `artifacts` store that replaces the per-project summary array. */
export const ARTIFACTS_BY_PROJECT_INDEX = 'by_projectId' as const;

type StoreDefinition = {
  name: VaultStoreName;
  keyPath: string;
  indexes?: { name: string; keyPath: string }[];
};

/**
 * The stores, their keys, and the one index. This is the *storage layer* diagram in
 * docs/workshop.md expressed as data, so the diagram and the upgrade transaction cannot drift.
 *
 * `quarantine` arrived with version 2 (#47). It holds records this build could not interpret,
 * kept verbatim so a later build that understands them can still find them — invariant 2 in
 * docs/workshop.md. It is deliberately not keyed by the record's own id: a record damaged enough
 * to have lost its id has none to be filed under, and two of those would collide.
 */
export const VAULT_STORES: StoreDefinition[] = [
  { name: 'projects', keyPath: 'id' },
  {
    name: 'artifacts',
    keyPath: 'id',
    indexes: [{ name: ARTIFACTS_BY_PROJECT_INDEX, keyPath: 'projectId' }],
  },
  { name: 'artifact_payloads', keyPath: 'artifactId' },
  { name: 'workspaces', keyPath: 'projectId' },
  { name: 'quarantine', keyPath: 'recordId' },
  { name: 'meta', keyPath: 'key' },
];

/**
 * Bring a database up to {@link VAULT_SCHEMA_VERSION}.
 *
 * Still written as "create what is missing" rather than as an `oldVersion` ladder, and version 2 is
 * the case that shows why that is enough so far: it **adds a store** and changes no record. Adding
 * a store is idempotent and order-independent; rewriting the records inside one is neither, and the
 * first version that has to do that is the version this function grows a ladder for.
 */
export function upgradeVaultDatabase(database: IDBDatabase, transaction: IDBTransaction): void {
  for (const definition of VAULT_STORES) {
    const store = database.objectStoreNames.contains(definition.name)
      ? transaction.objectStore(definition.name)
      : database.createObjectStore(definition.name, { keyPath: definition.keyPath });
    for (const index of definition.indexes ?? []) {
      if (!store.indexNames.contains(index.name)) {
        store.createIndex(index.name, index.keyPath);
      }
    }
  }
  // The upgrade transaction covers every store, so the version the database was last brought to is
  // recorded here rather than by a later write that could fail on its own.
  transaction
    .objectStore('meta')
    .put({ key: VAULT_META_KEYS.schemaVersion, value: VAULT_SCHEMA_VERSION });
}
