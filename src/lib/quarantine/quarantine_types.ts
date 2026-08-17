import type { QuarantineReason } from '$lib/artifact_kinds';

/**
 * Something this build could not interpret, kept whole.
 *
 * Invariant 2 in docs/workshop.md: nothing is dropped silently. The two tempting alternatives are
 * both wrong — dropping it destroys work, and rejecting a two-hundred-artifact backup because one
 * record is unrecognised makes the backup useless over a single bad row.
 *
 * `raw` is the record exactly as it arrived and is the only field that matters for recovery;
 * everything above it is lifted out so the record can be listed, named on screen, and filed. Those
 * fields are empty strings when the record was too damaged to carry them, and keeping the `kind`
 * string is **not** the same as trusting it: without it, a later build that adds the missing kind
 * cannot find the records that have been waiting for it, which is the entire promise being made.
 */
export type QuarantinedArtifact = {
  /** The artifact's own id as the file gave it, or empty when it had none. */
  id: string;
  projectId: string;
  kind: string;
  name: string;
  raw: unknown;
  reason: QuarantineReason;
  message: string;
};

/**
 * A quarantined record as the `quarantine` store holds it.
 *
 * The store key is `recordId`, minted here rather than taken from the record. A record damaged
 * enough to have lost its id has nothing to be filed under, and two of those would overwrite each
 * other — which would be this library losing the work it exists to keep.
 */
export type QuarantineRecord = QuarantinedArtifact & {
  recordId: string;
  /** Epoch milliseconds, per decision 2 in docs/workshop.md. */
  quarantinedAt: number;
};
