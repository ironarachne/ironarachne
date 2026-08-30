import type { RNG } from '@ironarachne/rng';

/**
 * Stable string id for one payload shape — `culture`, `religion`, `character.swn`. Open rather
 * than an enum on purpose: a file written by a newer build may name a kind this build has never
 * heard of, and closing the type would make that unrepresentable instead of quarantinable
 * (docs/workshop.md, "Kinds, tools, and the snapshot contract").
 *
 * Where the same concept differs by game system the kinds are distinct and system-qualified —
 * `character.swn` and `character.adnd-2e` — per decision 4 of the design document. Renaming a
 * kind is a migration, not a rename.
 */
export type ArtifactKind = string;

/** Why a payload could not be turned into something this build understands. */
export type QuarantineReason =
  | 'unknown-kind'
  | 'invalid-payload'
  | 'unsupported-version'
  | 'migration-failed';

/**
 * The result of reading a stored payload. A discriminated union rather than a boolean because
 * the reason is exactly what quarantine and the import summary have to report: "we dropped
 * something" is not a message a user can act on.
 */
export type PayloadResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: QuarantineReason; message: string };

/**
 * The lossless conversion between a library's live value and its stored snapshot.
 *
 * Separate from the entry, and loaded on demand, because this half is the expensive one.
 * Rebuilding a coat of arms turns stored names back into charges, which reaches
 * `$lib/charges` — 18 MB of glyph art, measured against the bundle. Everything in the workshop
 * touches the kind registry, and only a panel that is opening an artifact touches a codec, so
 * paying for the second everywhere would put the site's entire charge library in the chunk that
 * merely lists what a project contains.
 *
 * It is the same reasoning `TOOL_PANELS` is built on, applied to payloads instead of components.
 */
export type ArtifactKindCodec<TValue, TSnapshot> = {
  /** Live value to storable snapshot. Lossless with {@link ArtifactKindCodec.fromSnapshot}. */
  toSnapshot: (value: TValue) => TSnapshot;
  /**
   * Storable snapshot back to a live value. The RNG is for rehydration — rebuilding name
   * generators and the like — never for regenerating content: the payload is the truth, and a
   * user's edits are not something a seed can reproduce.
   */
  fromSnapshot: (snapshot: TSnapshot, rng: RNG) => TValue;
};

/**
 * What a library implements to make its content storable as an artifact.
 *
 * Two types are in play and keeping them apart is the whole contract:
 *
 * - `TValue` is the live thing the library works with. It may carry functions, class instances,
 *   or generators rebuilt from an RNG, and it is not storable as it stands.
 * - `TSnapshot` is the serialisable form. **It is the artifact's payload**, so `validate` and
 *   `migrate` — which are handed whatever was in storage or in a file — speak in snapshots, and
 *   only the codec's `fromSnapshot` produces a live value.
 *
 * The design document's diagram writes both as "payload"; this is that model with the two roles
 * named, because `fromSnapshot` needs an RNG and so cannot be what a validator returns.
 *
 * Everything here is synchronous, which is what lets a store read and a project view stay
 * synchronous. The one asynchronous member is {@link ArtifactKindEntry.loadCodec}, and it is the
 * one that is worth a chunk boundary.
 */
export type ArtifactKindEntry<TValue, TSnapshot> = {
  /** Stable id. See {@link ArtifactKind}. */
  kind: ArtifactKind;
  /** What a user sees for the kind, e.g. "Coat of Arms". */
  displayName: string;
  /**
   * The kind's mark, imported from `src/lib/assets/icons` with `?raw`.
   *
   * Optional, and deliberately so: a kind that reads fine without one should not have to invent
   * one, and a surface with no mark to show shows none rather than a generic placeholder — a
   * placeholder mark is a sticker. See docs/visual-design.md, "An artifact kind carries its own
   * mark".
   *
   * It lives with the registration because a kind is registered once and read everywhere: the
   * vault, the project view and the picker would otherwise each keep a lookup table of the same
   * five answers.
   */
  icon?: string;
  /** The version of the snapshot shape this build writes. Starts at 1 and only ever rises. */
  payloadVersion: number;
  /** Loads the conversion pair. See {@link ArtifactKindCodec} for why it is not inline. */
  loadCodec: () => Promise<ArtifactKindCodec<TValue, TSnapshot>>;
  /** The default name for an artifact holding this snapshot. Users may rename it afterwards. */
  nameOf: (snapshot: TSnapshot) => string;
  /**
   * Checks that an unknown value is a snapshot at the current {@link
   * ArtifactKindEntry.payloadVersion}. It gates what `fromSnapshot` depends on rather than
   * describing the whole tree — a schema for a generated culture would be a second copy of the
   * culture types, and it would rot.
   */
  validate: (payload: unknown) => PayloadResult<TSnapshot>;
  /**
   * Brings a snapshot written at an older `payloadVersion` up to the current one.
   *
   * Not optional, and not something a future release can add: local-only means there is no
   * server-side migration and no backfill job. Every step runs in the browser, against data that
   * may be arbitrarily old, for someone who has not opened the site in a year.
   *
   * A kind with no older versions still implements this — it rejects, saying so. Callers reach
   * it through `readArtifactPayload`, which handles the current-version and newer-than-us cases
   * so an implementation only ever sees a genuinely older version.
   */
  migrate: (payload: unknown, from: number) => PayloadResult<TSnapshot>;
};

/**
 * The erased entry the registry stores and hands back. Every consumer of the registry — the
 * store, export, the project view — works in this form, because a registry that knew each kind's
 * types would be the hand-maintained list of kinds this exists to remove.
 *
 * `registerArtifactKind` is where a typed entry becomes this one, which confines the cast to a
 * single line instead of spreading it across every caller.
 */
export type AnyArtifactKindEntry = ArtifactKindEntry<unknown, unknown>;

/** The erased codec, as an {@link AnyArtifactKindEntry}'s `loadCodec` resolves it. */
export type AnyArtifactKindCodec = ArtifactKindCodec<unknown, unknown>;

/**
 * Kinds by id, in registration order. Assembled statically (see
 * `$lib/workshop/artifact_kind_catalog`) rather than by self-registration on import: a kind that
 * only exists once some module happens to be loaded is a kind that is missing exactly when an
 * import needs it.
 */
export type ArtifactKindRegistry = {
  readonly byKind: Map<ArtifactKind, AnyArtifactKindEntry>;
};
