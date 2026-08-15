import type { ArtifactKind } from '$lib/artifact_kinds';
import type { ArtifactFailureReason } from '$lib/artifacts';

/**
 * One of the three historical per-generator save scopes, described well enough to be read without
 * loading the library that wrote it.
 *
 * The set is closed. These are the only generators that could ever save, no build will add a
 * fourth, and #44 retires the page that reads them — so this is a record of what happened rather
 * than a registry that grows.
 *
 * `identityField` is the field the owning library already treats as an item's identity, proven by
 * its own delete function: heraldry deletes by blazon, culture by name, religion by seed. Adoption
 * keys off the same field so that what counts as "this item" does not become a second opinion.
 */
export type LegacySaveScope = {
  /** Storage scope id under `ironarachne.save.v1.`, e.g. `generator.culture`. */
  scopeId: string;
  /** The array field inside the stored envelope, e.g. `cultures`. */
  itemsField: string;
  /** The registered artifact kind these snapshots become. */
  kind: ArtifactKind;
  /** The snapshot field holding the item's identity. See the type comment. */
  identityField: string;
};

/**
 * What reading a legacy scope found.
 *
 * `absent` and `unreadable` are kept apart because they mean different things to a user: nothing
 * was ever saved there, versus something is there and this build could not make sense of it. The
 * second is worth reporting; the first is the ordinary state of a browser that never used the
 * generator.
 */
export type LegacyScopeReadStatus = 'absent' | 'unreadable' | 'read';

export type LegacyScopeContents = {
  scope: LegacySaveScope;
  status: LegacyScopeReadStatus;
  /**
   * The envelope's own `payloadVersion`, read as stored and not repaired. It is handed to the kind
   * registry, which decides what that version means — including rejecting it.
   */
  payloadVersion: number;
  /** The raw items, unvalidated. Empty unless `status` is `read`. */
  items: unknown[];
};

/** A legacy snapshot that became an artifact. */
export type AdoptedLegacyItem = {
  scopeId: string;
  kind: ArtifactKind;
  artifactId: string;
  name: string;
};

/**
 * A legacy snapshot this build could not turn into an artifact, with the reason.
 *
 * Nothing is deleted to make this true: the item stays in its legacy scope, and because a skip
 * records no adoption key, a later build that understands it will adopt it on its next run. That
 * is the same promise import quarantine makes, applied to storage.
 */
export type SkippedLegacyItem = {
  scopeId: string;
  kind: ArtifactKind;
  /** The item's identity where it had a readable one, for a message a user can act on. */
  identity: string | null;
  /**
   * Why it was not adopted: the payload was not something this build understands, or the database
   * refused the write. The second is retried on the next load, because a skip records no key.
   */
  reason: ArtifactFailureReason;
  message: string;
};

/**
 * What one adoption run did.
 *
 * A run that found nothing to adopt reports `projectId: null` and creates no project — a browser
 * with no legacy saves must not end up with an empty project it never asked for.
 */
export type LegacyAdoptionResult = {
  projectId: string | null;
  projectCreated: boolean;
  adopted: AdoptedLegacyItem[];
  skipped: SkippedLegacyItem[];
  /** Items a previous run already adopted. The count that makes a second run a no-op. */
  alreadyAdopted: number;
  /** Scopes holding something this build could not parse at all. */
  unreadableScopeIds: string[];
};

export const LEGACY_ADOPTION_PAYLOAD_VERSION = 1 as const;

/**
 * What the user has not been told yet. Set by a run that adopted something and cleared when they
 * acknowledge it, because "the user should be told this happened" is not satisfied by a message
 * that appears only if they happened to be looking at the right page during the one run that
 * migrated their work.
 */
export type LegacyAdoptionNotice = {
  projectId: string;
  adoptedCount: number;
  skippedCount: number;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  at: number;
};

/**
 * The record that makes adoption idempotent.
 *
 * `adoptedKeys` rather than a single "already ran" flag, and written after every adopted item
 * rather than once at the end. A run interrupted part-way — a refused write, a closed tab — then
 * resumes where it stopped instead of adopting everything a second time, which is the failure a
 * flag written last would turn into duplicates.
 */
export type LegacyAdoptionRecord = {
  payloadVersion: typeof LEGACY_ADOPTION_PAYLOAD_VERSION;
  /** The project legacy work has been adopted into, or null before the first adoption. */
  projectId: string | null;
  /** Keys of legacy items already adopted. See `legacyItemKey`. */
  adoptedKeys: string[];
  notice: LegacyAdoptionNotice | null;
};

/** Identity and time, supplied rather than generated, so tests can pin a run. */
export type LegacyAdoptionOptions = {
  /**
   * One timestamp for the whole run, so a batch of adopted artifacts is coherent rather than
   * spread over however many milliseconds the loop took.
   */
  now?: number;
  /** The name of the project adoption creates. Defaults to {@link ADOPTION_PROJECT_NAME}. */
  projectName?: string;
};
