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

/**
 * The completions of real work that may ask the browser for persistence.
 *
 * The whole retry policy is this list. `docs/workshop.md` asks that a refused request be repeated
 * at most once per session and only after the user has done more work; because these three are the
 * only callers of {@link requestPersistenceIfWarranted}, "after more work" is structural rather
 * than a tally somebody has to keep correct. No page load, route change, or timer can ask.
 */
export type PersistenceTrigger = 'projectCreated' | 'vaultExported' | 'projectExported';

/** What the browser itself said when it was asked. */
export type PersistenceGrantOutcome =
  /** `persist()` resolved true: the origin is now protected from automatic eviction. */
  | 'granted'
  /** `persist()` resolved false. A decision the user can revisit in the browser, so it is not stored. */
  | 'refused'
  /** There is no `persist()` here, or calling it threw. Not the same answer as a refusal. */
  | 'unavailable';

/**
 * How one call to {@link requestPersistenceIfWarranted} ended.
 *
 * Five-valued for the same reason {@link PersistenceState} is three-valued: the answers are
 * genuinely different, and collapsing any pair produces a display or a log that is confidently
 * wrong. In particular `refused` is the browser saying no, while `notAsked` and `alreadyPersisted`
 * mean nothing was asked at all.
 */
export type PersistenceRequestOutcome =
  | PersistenceGrantOutcome
  /** The origin was already protected, so no prompt was raised over a question already settled. */
  | 'alreadyPersisted'
  /** This session had asked once already. The gate declined to ask again. */
  | 'notAsked';

/** One pass through the persistence request policy: what prompted it, when, and how it ended. */
export type PersistenceRequest = {
  trigger: PersistenceTrigger;
  requestedAt: number;
  outcome: PersistenceRequestOutcome;
};

/**
 * How long ago something was exported, as facts rather than as a sentence.
 *
 * The same value is phrased two ways — "Last exported 12 days ago" as a headline, "12 days ago" in
 * a table cell — so a type carrying one rendered string would leave the other written out in a
 * template, where none of the rules in docs/storage-panel.md can be tested.
 *
 * `everExported` is separate from {@link lastExportAt} for the reason {@link PersistenceState} is
 * three-valued: never exported is a different answer from exported a long time ago, and both are
 * different from a stamp that could not be read.
 */
export type ExportRecency = {
  everExported: boolean;
  /** Epoch milliseconds of the last successful export. Absent when there has never been one. */
  lastExportAt?: number;
  /**
   * Whole days elapsed since that export, floored, and clamped at zero.
   *
   * Elapsed days rather than calendar days: a figure that changes at midnight because of something
   * nobody did is worse than one that changes when it means something. A timestamp in the future —
   * a corrected clock, a file from another machine — reads as today rather than as a negative.
   */
  daysAgo?: number;
};

/**
 * What the panel says about eviction, and what it is careful not to say.
 *
 * `persisted` never reads as safety. It resists automatic eviction under storage pressure and does
 * nothing about cleared site data, a lost laptop, a different browser, or Safari's ITP — so
 * {@link meaning} always carries the limit, and no branch ends on reassurance. A "Protected" badge
 * presented as a backup would be the most expensive lie in the product, because it would talk
 * someone out of the export that is their actual protection.
 */
export type ProtectionAdvice = {
  state: PersistenceState;
  headline: string;
  meaning: string;
};

/**
 * How full the browser says this origin is.
 *
 * {@link known} means **both** figures arrived, which is what a proportion needs. One figure on its
 * own is still worth saying and is still not a proportion, so it is reported rather than completed
 * with a guess.
 *
 * There is deliberately no `percentage` field. A percentage of an estimate is two layers of
 * imprecision wearing one number's clothes, so it exists only inside the one function that also
 * emits the sizes — see `usageSentence`.
 */
export type UsageProportion = {
  known: boolean;
  usageBytes?: number;
  quotaBytes?: number;
  /** Usage over quota, present only when both are. */
  fraction?: number;
};

/**
 * One line of the panel's project table: {@link ProjectUsage} joined to the project index for a
 * name.
 *
 * The join is a presentation concern rather than a library one. Giving `ProjectUsage` a name field
 * would make it re-derivable state that a rename can falsify, which is the same argument that keeps
 * `StorageStatus` from caching anything the browser answers directly.
 */
export type ProjectStorageRow = {
  projectId: string;
  name: string;
  artifactCount: number;
  byteSize: number;
  lastExport: ExportRecency;
};

/**
 * Everything the storage panel renders, derived on the spot and persisted nowhere.
 *
 * The order of the fields is the order of the panel, and that order is the design: export recency
 * leads because fullness predicts inconvenience while export recency predicts loss. See
 * docs/storage-panel.md.
 */
export type StoragePanelView = {
  lastExport: ExportRecency;
  protection: ProtectionAdvice;
  usage: UsageProportion;
  /** Largest first, as `summarizeProjectUsage` ordered them; the view does not re-sort. */
  projects: ProjectStorageRow[];
};

/**
 * Whether the browser is full enough to say so where the user is working, and the numbers that
 * claim has to carry.
 *
 * It holds a {@link UsageProportion} rather than its own copy of the figures, which is what makes
 * "a percentage never appears without the sizes" structural: the banner and the panel get that
 * sentence from one function. An unknown estimate is never `warranted` — a missing figure is not
 * eighty per cent of anything.
 */
export type StorageWarning = {
  warranted: boolean;
  usage: UsageProportion;
};
