/**
 * Whether the browser has promised not to evict this origin's storage on its own.
 *
 * Three-valued on purpose, per docs/workshop.md ("Storage status"). `unknown` covers both a
 * browser with no `navigator.storage.persisted()` and an answer that has not arrived, and it is
 * kept separate because collapsing it into `notPersisted` reports a protected origin as
 * unprotected — a warning about a risk the user does not have, which is how a storage display
 * teaches people to ignore it.
 *
 * None of the three means "backed up". Persistence resists automatic eviction under storage
 * pressure and does nothing about a cleared browser, a lost laptop, or a different machine.
 */
export type PersistenceState = 'persisted' | 'notPersisted' | 'unknown';

/** How much of the vault one project accounts for, and when it was last exported. */
export type ProjectUsage = {
  projectId: string;
  artifactCount: number;
  /**
   * The sum of `byteSize` over this project's artifact summaries.
   *
   * **A sum, not a measurement.** It is attribution — which project is large — and it is
   * deliberately not reconciled against {@link StorageStatus.usageBytes}, which counts index
   * overhead, the other stores, and whatever else the browser charges the origin for. The two
   * disagreeing is expected, and scaling one to the other would turn two honest numbers into one
   * invented one.
   */
  byteSize: number;
  /**
   * Epoch milliseconds of the last successful export of this project, absent when it has never
   * been exported. Stored on the project record; see `$lib/vault_db`.
   */
  lastExportAt?: number;
};

/**
 * What the storage panel displays: the origin's usage, whether it is protected, how long ago the
 * user exported, and where the bytes went.
 *
 * Almost all of it is derived rather than stored — recomputed from the artifact summaries and from
 * `navigator.storage`. The two exceptions are {@link lastVaultExportAt} and
 * {@link ProjectUsage.lastExportAt}, which are persisted because they are the numbers that predict
 * loss and a measurement that resets on reload cannot answer "how long has this been the only
 * copy".
 */
export type StorageStatus = {
  /**
   * Bytes the browser says this origin is using, absent when it will not say.
   *
   * **Optional means unknown, not zero.** `navigator.storage.estimate()` is not universally
   * available, and zero is a claim the code cannot support. Browsers also fuzz what they do
   * report, so this is a proportion and a rough band rather than a byte budget.
   */
  usageBytes?: number;
  /** Bytes the browser is currently willing to give this origin. Optional for the same reason. */
  quotaBytes?: number;
  persistence: PersistenceState;
  /** Epoch milliseconds of the last successful whole-vault export. Absent when there has been none. */
  lastVaultExportAt?: number;
  /**
   * When {@link usageBytes} and {@link quotaBytes} were measured, in epoch milliseconds.
   *
   * The estimate is cached between measurements, so this is what keeps the display honest: the UI
   * can say how stale the figure is instead of presenting a cached number as a live one.
   */
  measuredAt: number;
  /** Every known project, largest first. Projects with no artifacts are listed at zero. */
  projects: ProjectUsage[];
};

/** One reading of `navigator.storage.estimate()`, and the moment it was taken. */
export type StorageMeasurement = {
  usageBytes?: number;
  quotaBytes?: number;
  measuredAt: number;
};
