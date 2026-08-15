import type { RouteId } from '$app/types';
import type { ArtifactKind, QuarantineReason } from '$lib/artifact_kinds';
import type { TaggedItem } from '$lib/tags';
import type { VaultFailureReason } from '$lib/vault_db';

/**
 * How an artifact was first made: which tool, from which seed, with which settings.
 *
 * Optional on the artifact and staying that way. Artifacts adopted from the legacy per-generator
 * saves (#34) have no honest seed, and an invented one would be a lie that a re-roll button acts
 * on. Provenance is a record of origin, never a load path — see
 * {@link Artifact.payload}.
 */
export type ArtifactProvenance = {
  /** A tool catalog path, the one edge from the store to the tool registry. */
  toolPath: RouteId;
  seed: string;
  /** Generator settings as the tool understood them. `{}` when the tool has none. */
  config: Record<string, unknown>;
};

/**
 * A link from one artifact to another, within the same project.
 *
 * `role` is required, per decision 1 in docs/workshop.md: a region references its capital and its
 * member settlements and both are `kind: settlement`, so target kind alone cannot say which is
 * which. A defaulted empty role rebuilds the untyped bag the field exists to prevent, and it is
 * what lets a dangling reference read as "capital: missing" rather than "a settlement is missing".
 *
 * The field is carried and queried here; populating it, the picker that fills it in, and the
 * delete prompt that reads it are #37.
 */
export type ArtifactReference = {
  targetId: string;
  targetKind: ArtifactKind;
  /** A plain string owned by the referring kind, e.g. `capital`, `religion`. */
  role: string;
};

/**
 * An artifact without its payload — everything a listing, a picker, or a backlink query needs.
 *
 * This is a storage boundary as much as a type. A summary is one record in the `artifacts` store
 * and its payload is one record in `artifact_payloads`, so listing a project reads a few kilobytes
 * rather than every region map in it. See the README for why the store is keyed that way.
 */
export interface ArtifactSummary extends TaggedItem {
  /** Stable identity. Referenced by other artifacts; never reused, including after a delete. */
  id: string;
  /**
   * The owning project. Authoritative: the `by_projectId` index is derived from this field, and an
   * index entry that contradicts it is a bug in the store rather than a second opinion.
   */
  projectId: string;
  /** Registry key, owned by `$lib/artifact_kinds`. Determines the payload shape. */
  kind: ArtifactKind;
  /** User-facing and user-editable. Not required to be unique. */
  name: string;
  /** Ids of other artifacts in this project. Empty until #37 populates it. */
  references: ArtifactReference[];
  /** Absent rather than empty when the artifact's origin is not known. */
  provenance?: ArtifactProvenance;
  /**
   * The kind's snapshot version the stored payload was written at.
   *
   * On the summary rather than beside the payload because the two are written in one transaction
   * and so cannot disagree — which is what the database bought that `localStorage` could not. It
   * being here is what lets a listing say an artifact needs migrating without reading a payload.
   */
  payloadVersion: number;
  /**
   * The stored payload's size in bytes, recorded at write time — the one moment it is free.
   *
   * Summing it over a project's summaries is how usage is attributed per project. It is an
   * approximation of what the browser actually holds, and is not reconciled against
   * `navigator.storage.estimate()`; the two disagreeing is expected.
   */
  byteSize: number;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  createdAt: number;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  updatedAt: number;
}

/**
 * A summary and the content it describes.
 *
 * **The payload is the truth.** It is what the user has, not a seed to be re-rolled: the moment
 * they rename a deity or rewrite a settlement's trade blurb, the seed in `provenance` no longer
 * reproduces it. Re-rolling is a destructive action a user asks for, and there is deliberately no
 * code path in this library that regenerates a payload from provenance.
 *
 * `payload` is `unknown` because the store does not know payload shapes — that is the point of it
 * being generic. It is narrowed by `kind` through the kind registry, which is also what stamps
 * {@link ArtifactSummary.payloadVersion}.
 */
export interface Artifact extends ArtifactSummary {
  /** A snapshot, as the kind's `validate` accepted it. Never a live value carrying functions. */
  payload: unknown;
}

/** What a caller supplies to create an artifact. */
export type ArtifactDraft = {
  projectId: string;
  kind: ArtifactKind;
  /** A snapshot at the kind's current `payloadVersion`. Validated before anything is stored. */
  payload: unknown;
  /** Defaults to the kind's `nameOf` for this payload. */
  name?: string;
  tags?: string[];
  references?: ArtifactReference[];
  provenance?: ArtifactProvenance;
};

/**
 * The metadata a caller may change on an existing artifact. Omitting a field leaves it alone,
 * which is what separates "no change" from "cleared" — an empty string or an empty array clears.
 *
 * The payload is not here: it goes through `updateArtifactPayload`, which validates it against the
 * kind. Provenance is not here either — it records how the artifact was first made, and editing it
 * would make it fiction.
 */
export type ArtifactChanges = {
  name?: string;
  tags?: string[];
  references?: ArtifactReference[];
};

/**
 * Identity and time, supplied rather than generated. Tests pin them; import (#35) recreates an
 * artifact under the id and timestamps its file carries rather than minting new ones.
 */
export type ArtifactMutationOptions = {
  id?: string;
  now?: number;
  /** Only meaningful on create, where it separates "first made" from "written to this vault". */
  createdAt?: number;
};

/**
 * Why an artifact operation did not do what was asked: the payload was not something this build
 * understands, or the database refused.
 *
 * One union rather than two results because a caller has one thing to do with either — tell the
 * user and keep their work on screen. What separates them is the message.
 */
export type ArtifactFailureReason = QuarantineReason | VaultFailureReason;

/**
 * What every write here returns.
 *
 * **Never `void`**, per docs/workshop.md ("Storage limits"): the caller is handed a result it has
 * to look at, because an API that returns nothing makes silent loss the default. A `PayloadResult`
 * rejection from the kind registry is one of these already, which is what lets validation and
 * storage failures come back through one channel.
 */
export type ArtifactWriteResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: ArtifactFailureReason; message: string };

/**
 * The result of reading an artifact back.
 *
 * A rejection still carries the summary, because a payload this build cannot read — or could not
 * reach — is an artifact the user must still be able to see, name, and export. Dropping it from
 * the listing would be the silent loss that a local-only application has no server to recover
 * from.
 */
export type ArtifactReadResult =
  | {
      ok: true;
      artifact: Artifact;
      /**
       * True when the stored payload was older than the kind's current version and was migrated
       * on the way out. The migration is not written back; see the README.
       */
      migrated: boolean;
    }
  | { ok: false; summary: ArtifactSummary; reason: ArtifactFailureReason; message: string };

/**
 * What a delete removed, and what pointed at it.
 *
 * `referrers` is the seam for #37: the store reports what would be broken and deletes anyway,
 * because the policy — prompt with the referrer list, allow the delete, tolerate the dangling
 * references and surface them as visibly broken — belongs in the UI that can ask. Refusing the
 * delete here would be the "never delete anything" behaviour docs/workshop.md rules out.
 */
export type ArtifactDeletion = {
  deleted: boolean;
  id: string;
  /** Artifacts whose references named this one, as they were immediately before the delete. */
  referrers: ArtifactSummary[];
};
