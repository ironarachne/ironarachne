import type {
  PersistenceGrantOutcome,
  PersistenceState,
  StorageMeasurement,
} from './storage_status_types';

/**
 * The parts of `navigator.storage` this library uses, described rather than assumed.
 *
 * Both methods are optional here because both are optional in the wild: `StorageManager` is typed
 * as though `estimate` and `persisted` always exist, and on a browser where they do not, calling
 * one throws instead of answering. Typing them as possibly-absent is what makes the "unknown"
 * branches reachable rather than dead code the type checker insists cannot happen.
 */
type OptionalStorageManager = {
  estimate?: () => Promise<{ usage?: number; quota?: number }>;
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
};

function storageManager(): OptionalStorageManager | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }
  return navigator.storage as OptionalStorageManager | undefined;
}

/**
 * A byte count, or `undefined` when the browser did not give one this code can use.
 *
 * A missing, non-numeric, or negative figure is reported as unknown rather than repaired to zero.
 * Zero is a claim — "this origin stores nothing" — and it is the wrong one to make on the strength
 * of an absent answer.
 */
function optionalBytes(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return value;
}

/**
 * Ask the browser how much of the origin's storage is used and how much it is willing to give.
 *
 * Never rejects. A browser with no `estimate()`, and one whose `estimate()` throws, both produce a
 * measurement with neither figure in it — which is the honest answer and is what the panel renders
 * as unknown. Failing here would take down a status display over a number that was optional in the
 * first place.
 */
export async function measureStorageEstimate(
  measuredAt: number = Date.now(),
): Promise<StorageMeasurement> {
  const manager = storageManager();
  if (manager?.estimate === undefined) {
    return { measuredAt };
  }
  try {
    const estimate = await manager.estimate();
    const measurement: StorageMeasurement = { measuredAt };
    const usageBytes = optionalBytes(estimate.usage);
    if (usageBytes !== undefined) {
      measurement.usageBytes = usageBytes;
    }
    const quotaBytes = optionalBytes(estimate.quota);
    if (quotaBytes !== undefined) {
      measurement.quotaBytes = quotaBytes;
    }
    return measurement;
  } catch {
    return { measuredAt };
  }
}

/**
 * Whether the browser has promised not to evict this origin.
 *
 * Read fresh on every status read rather than cached with the estimate: it is one cheap call with
 * none of the fuzzing or cost that makes `estimate()` worth caching, and it changes the moment
 * `navigator.storage.persist()` is granted (#178). A cached "not protected" surviving a granted
 * request would be a stale warning, which is the failure this whole display exists to avoid.
 *
 * Never rejects — an API that is absent, and one that throws, are both `unknown`.
 */
export async function readPersistenceState(): Promise<PersistenceState> {
  const manager = storageManager();
  if (manager?.persisted === undefined) {
    return 'unknown';
  }
  try {
    return (await manager.persisted()) ? 'persisted' : 'notPersisted';
  } catch {
    return 'unknown';
  }
}

/**
 * Ask the browser not to evict this origin, and report what it said.
 *
 * The browser surface and nothing else: **when** to ask is
 * `requestPersistenceIfWarranted`'s decision, and this function will ask whenever it is called.
 * Firefox raises a permission prompt here and Chromium decides silently on engagement heuristics,
 * which is why the caller shows the disclosure first — see `docs/storage-disclosure.md`.
 *
 * Never rejects. A browser with no `persist()`, and one whose `persist()` throws, are both
 * `unavailable`, which is deliberately not `refused`: one is a browser that could not be asked and
 * the other is a browser that said no.
 */
export async function requestPersistence(): Promise<PersistenceGrantOutcome> {
  const manager = storageManager();
  if (manager?.persist === undefined) {
    return 'unavailable';
  }
  try {
    return (await manager.persist()) ? 'granted' : 'refused';
  } catch {
    return 'unavailable';
  }
}
