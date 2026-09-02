// A pill. `potion-*.svg` is left for #68, which is the tool that actually makes potions.
import pill from '$lib/assets/icons/set2/pill.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type Drug from './drug.js';
import type { DrugSnapshot } from './drug_snapshot.js';

/**
 * Stable artifact kind id. Unqualified: a drug is neither a game system's nor a setting's, per the
 * kind table in docs/tool-readiness.md.
 *
 * Its own kind rather than a share of `item`, which decision 1 of docs/readiness-objects.md gives
 * to the equipment and weapon generators. The test that decision sets is whether two tools produce
 * the same payload shape; a drug and a sword do not — a drug has no material, no rarity, no weight
 * and no combat profile, and an `Item` has no method of ingestion.
 */
export const DRUG_ARTIFACT_KIND = 'drug' as const;

/** Version 1. The first shape a drug has been stored in. */
export const DRUG_PAYLOAD_VERSION = 1 as const;

/** Every field of a stored drug. All eleven are strings; none of them is optional. */
const DRUG_FIELDS = [
  'name',
  'description',
  'drugTypeName',
  'method',
  'effectTypeName',
  'effectDescription',
  'strength',
  'color',
  'duration',
  'sideEffect',
  'commonality',
] as const;

/**
 * Checks that all eleven fields are strings.
 *
 * Every one may be *empty*, and that is deliberate: a user who has cleared the side effects of a
 * drug has made an editing decision, and a payload that failed its own validator would be a broken
 * artifact rather than an edited one — 3.3 asks for a well-defined empty result, not a refusal.
 * What is checked is that each field is present and is a string, because the presentation joins
 * them and `undefined` would print as the word.
 */
export function validateDrugSnapshot(payload: unknown): PayloadResult<DrugSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'drug payload is not an object');
  }

  const missing = DRUG_FIELDS.find((field) => typeof record[field] !== 'string');
  if (missing !== undefined) {
    return rejectedPayload('invalid-payload', `drug payload has no usable ${missing}`);
  }

  return acceptedPayload(record as unknown as DrugSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migrateDrugSnapshot(_payload: unknown, from: number): PayloadResult<DrugSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Drugs have no migration from payload version ${from}; version ${DRUG_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a saved drug: its street name, or the kind when the name has been emptied. */
function drugName(snapshot: DrugSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Drug' : name;
}

/**
 * A drug as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading a drug reaches only this library's two tables. Keeping the shape uniform is worth more
 * than saving one indirection, because the day this payload grows a part that *is* heavy, the seam
 * is already where it needs to be.
 */
export const drugArtifactKind = defineArtifactKind<Drug, DrugSnapshot>({
  kind: DRUG_ARTIFACT_KIND,
  displayName: 'Drug',
  icon: pill,
  payloadVersion: DRUG_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toDrugSnapshot, drugFromSnapshotWithRng } = await import('./drug_snapshot.js');
    return {
      toSnapshot: toDrugSnapshot,
      fromSnapshot: drugFromSnapshotWithRng,
    };
  },
  nameOf: drugName,
  validate: validateDrugSnapshot,
  migrate: migrateDrugSnapshot,
});
