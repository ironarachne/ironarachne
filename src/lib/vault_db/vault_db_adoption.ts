import { listScopedEntries } from '$lib/persistent_save';

import { requestToPromise, runTransaction } from './vault_db_transaction';
import { payloadByteSize } from './vault_payload_size';
import { VAULT_META_KEYS } from './vault_db_types';

/**
 * The `localStorage` scopes the workshop wrote before it had a database, under the
 * `ironarachne.save.v1.` prefix `$lib/persistent_save` adds.
 *
 * They are named here rather than imported from `$lib/projects` and `$lib/artifacts` because those
 * libraries no longer have them: these are the shape of a past release, and a constant that moves
 * with the current code would stop describing the data actually sitting in returning users'
 * browsers.
 */
const LEGACY_PROJECTS_SCOPE_ID = 'workshop.projects';
const LEGACY_ARTIFACT_INDEX_PREFIX = 'workshop.artifact_index.';
const LEGACY_ARTIFACT_PAYLOAD_PREFIX = 'workshop.artifact.';

/** What one adoption run did. Counts rather than records: nothing downstream needs the records. */
export type VaultAdoption = {
  /** False when a previous run already did it, which is the case on every load but the first. */
  adopted: boolean;
  projects: number;
  artifacts: number;
};

const NOTHING_ADOPTED: VaultAdoption = { adopted: false, projects: 0, artifacts: 0 };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

/** A stored record and the id it is filed under, or null when it has no usable identity. */
function identified(value: unknown, field: string): IdentifiedRecord | null {
  const record = asRecord(value);
  const id = record?.[field];
  if (record === null || typeof id !== 'string' || id === '') {
    return null;
  }
  return { id, record };
}

type IdentifiedRecord = { id: string; record: Record<string, unknown> };

type LegacyVault = {
  projects: IdentifiedRecord[];
  summaries: IdentifiedRecord[];
  payloads: Map<string, { payloadVersion: number; payload: unknown }>;
};

/**
 * Everything the old store left in `localStorage`, read structurally rather than validated.
 *
 * The database's job here is to move records, not to judge them: a summary that this build's
 * `$lib/artifacts` would reject is dropped when the index is hydrated, and dropping it here as
 * well would only mean deciding the same thing twice, in the layer that knows least about it. The
 * one thing checked is identity, because a record with no id has nowhere to go.
 */
function readLegacyVault(): LegacyVault {
  const legacy: LegacyVault = { projects: [], summaries: [], payloads: new Map() };
  for (const { scopeId, value } of listScopedEntries()) {
    if (scopeId === LEGACY_PROJECTS_SCOPE_ID) {
      const stored = asRecord(value);
      const projects = Array.isArray(stored?.projects) ? stored.projects : [];
      for (const project of projects) {
        const identity = identified(project, 'id');
        if (identity !== null) {
          legacy.projects.push(identity);
        }
      }
    } else if (scopeId.startsWith(LEGACY_ARTIFACT_INDEX_PREFIX)) {
      const stored = asRecord(value);
      const artifacts = Array.isArray(stored?.artifacts) ? stored.artifacts : [];
      for (const artifact of artifacts) {
        const identity = identified(artifact, 'id');
        if (identity !== null && identified(identity.record, 'projectId') !== null) {
          legacy.summaries.push(identity);
        }
      }
    } else if (scopeId.startsWith(LEGACY_ARTIFACT_PAYLOAD_PREFIX)) {
      const stored = asRecord(value);
      if (stored !== null && 'payload' in stored) {
        legacy.payloads.set(scopeId.slice(LEGACY_ARTIFACT_PAYLOAD_PREFIX.length), {
          payloadVersion: typeof stored.payloadVersion === 'number' ? stored.payloadVersion : 0,
          payload: stored.payload,
        });
      }
    }
  }
  return legacy;
}

async function existingKeys(store: IDBObjectStore): Promise<Set<string>> {
  const keys = await requestToPromise(store.getAllKeys());
  return new Set(keys.filter((key): key is string => typeof key === 'string'));
}

/**
 * Copy the workshop's `localStorage` records into the database, once.
 *
 * **The originals are left exactly where they are.** They are small, they are the only fallback if
 * this has a bug, and #34 settled the same question the same way for the per-generator saves: a
 * migration that deletes its source has no second chance.
 *
 * Idempotent twice over. The run is recorded in `meta` in the same transaction as the records it
 * writes, so it either happened or it did not; and a record whose id is already in the database is
 * skipped rather than overwritten, so nothing a user did after adoption can be replaced by a stale
 * copy of itself.
 *
 * What it does not do is judge the records. `payloadVersion` moves from the payload entry to the
 * summary, `byteSize` is computed because it was never stored, and everything else is carried
 * across as it was written.
 */
export async function adoptLocalStorageVault(
  database: IDBDatabase,
  now: number = Date.now(),
): Promise<VaultAdoption> {
  return runTransaction(
    database,
    ['projects', 'artifacts', 'artifact_payloads', 'meta'],
    'readwrite',
    async (transaction) => {
      const meta = transaction.objectStore('meta');
      const alreadyRun = await requestToPromise(meta.get(VAULT_META_KEYS.localStorageAdoptedAt));
      if (alreadyRun !== undefined) {
        return NOTHING_ADOPTED;
      }

      const legacy = readLegacyVault();
      const projects = transaction.objectStore('projects');
      const artifacts = transaction.objectStore('artifacts');
      const payloads = transaction.objectStore('artifact_payloads');
      const storedProjectIds = await existingKeys(projects);
      const storedArtifactIds = await existingKeys(artifacts);

      const adoption: VaultAdoption = { adopted: true, projects: 0, artifacts: 0 };
      for (const project of legacy.projects) {
        if (storedProjectIds.has(project.id)) {
          continue;
        }
        projects.put({ id: project.id, value: project.record });
        adoption.projects += 1;
      }
      for (const summary of legacy.summaries) {
        if (storedArtifactIds.has(summary.id)) {
          continue;
        }
        // A summary whose payload entry is missing is still adopted, and no payload record is
        // invented for it. It reads as broken either way, and an artifact the user can see and
        // export beats one silently left behind.
        const stored = legacy.payloads.get(summary.id);
        artifacts.put({
          ...summary.record,
          payloadVersion: stored?.payloadVersion ?? 0,
          byteSize: payloadByteSize(stored?.payload),
        });
        if (stored !== undefined) {
          payloads.put({ artifactId: summary.id, payload: stored.payload });
        }
        adoption.artifacts += 1;
      }

      meta.put({ key: VAULT_META_KEYS.localStorageAdoptedAt, value: now });
      return adoption;
    },
  );
}
