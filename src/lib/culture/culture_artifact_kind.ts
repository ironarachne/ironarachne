import book from '$lib/assets/icons/set3/book.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { CultureSnapshot } from './culture_snapshot';
import type { Culture } from './culture_types';

/** Stable artifact kind id. A culture is system-neutral: one kind covers every use of it. */
export const CULTURE_ARTIFACT_KIND = 'culture' as const;

/**
 * Version 1, still, after `religion` grew the ability to be null.
 *
 * A version marks the shape a payload was *written* at, and it advances when something already
 * stored would otherwise be misread. Nothing is: every culture written before composition existed
 * carries an embedded religion, which is as valid now as it was then. Bumping would have put
 * "these contents were brought forward from an older version" on every culture in every project
 * to describe a change that did not touch them, and a migration notice nobody needs is how a
 * migration notice stops being read.
 */
export const CULTURE_PAYLOAD_VERSION = 1 as const;

const CULTURE_STRING_FIELDS = ['name', 'greeting', 'eatingTrait', 'designTrait', 'musicStyle'];

const ORGANIZATION_STRING_FIELDS = [
  'powerConcentration',
  'socialMobility',
  'dominantProfession',
  'description',
];

const NAME_GENERATOR_SLOTS = ['culture', 'country', 'family', 'female', 'male', 'town'];

/**
 * A stored generator is either a bare pattern list or a `PatternSet` carrying combinations.
 * Both spellings are current — `patternSourceFromNameGenerator` picks between them by whether
 * the generator has combinations — so neither is a migration.
 */
function isPatternSource(value: unknown): boolean {
  if (isStringArray(value)) {
    return true;
  }
  const record = asRecord(value);
  return record !== null && isStringArray(record.patterns);
}

function validateStoredNameGenerators(value: unknown): PayloadResult<unknown> {
  const generators = asRecord(value);
  if (generators === null) {
    return rejectedPayload('invalid-payload', 'culture nameGenerators is not an object');
  }
  if (typeof generators.name !== 'string') {
    return rejectedPayload('invalid-payload', 'culture nameGenerators.name is not a string');
  }
  const missing = NAME_GENERATOR_SLOTS.filter((slot) => !isPatternSource(generators[slot]));
  if (missing.length > 0) {
    return rejectedPayload(
      'invalid-payload',
      `culture nameGenerators has no usable patterns for ${missing.join(', ')}`,
    );
  }
  return acceptedPayload(generators);
}

function validateCulturalOrganization(value: unknown): PayloadResult<unknown> {
  const organization = asRecord(value);
  if (organization === null) {
    return rejectedPayload('invalid-payload', 'culture organization is not an object');
  }
  if (!hasStringFields(organization, ORGANIZATION_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `culture organization needs string ${ORGANIZATION_STRING_FIELDS.join(', ')}`,
    );
  }
  return acceptedPayload(organization);
}

/**
 * The culture's own religion, which is either there or deliberately absent.
 *
 * `null` is a statement, not a gap: it says a referenced religion artifact supplies this culture's
 * faith, and the reference on the artifact says which. Rejecting it would make a composed culture
 * unreadable by the very build that wrote it.
 *
 * A religion that *is* embedded is checked for a name and nothing more — a culture's religion is
 * generated content whose full shape belongs to `$lib/religion`, and restating it here would be a
 * second copy of those types that goes stale the first time one of them changes.
 */
function validateCultureReligion(value: unknown): PayloadResult<unknown> {
  if (value === null) {
    return acceptedPayload(value);
  }
  const religion = asRecord(value);
  if (religion === null || typeof religion.name !== 'string') {
    return rejectedPayload(
      'invalid-payload',
      'culture religion is neither null nor an object with a name',
    );
  }
  return acceptedPayload(religion);
}

/**
 * Checks what `cultureFromSnapshot` depends on: the fields it copies straight through, and
 * enough of `nameGenerators` to rebuild the six generators from.
 */
export function validateCultureSnapshot(payload: unknown): PayloadResult<CultureSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'culture payload is not an object');
  }
  if (!hasStringFields(record, CULTURE_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `culture payload needs string ${CULTURE_STRING_FIELDS.join(', ')}`,
    );
  }
  if (!isStringArray(record.taboos)) {
    return rejectedPayload('invalid-payload', 'culture taboos is not an array of strings');
  }

  const organization = validateCulturalOrganization(record.organization);
  if (!organization.ok) {
    return organization;
  }
  const religion = validateCultureReligion(record.religion);
  if (!religion.ok) {
    return religion;
  }
  const generators = validateStoredNameGenerators(record.nameGenerators);
  if (!generators.ok) {
    return generators;
  }

  return acceptedPayload(record as unknown as CultureSnapshot);
}

/**
 * Cultures have only ever been stored at version 1, so there is nothing older to bring forward
 * and this rejects rather than pretending. It is here because the contract requires it, and it
 * is where the step goes the day the shape changes — the alternative is a kind that looks
 * complete right up until it silently drops someone's work.
 */
export function migrateCultureSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<CultureSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `culture has no migration from payload version ${from}; version ${CULTURE_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * A culture as an artifact. The snapshot keeps the culture whole and stores its name generators
 * as patterns; the RNG on the way back rebuilds those generators, and generates nothing — the
 * payload is the truth, per docs/workshop.md.
 */
export const cultureArtifactKind = defineArtifactKind<Culture, CultureSnapshot>({
  kind: CULTURE_ARTIFACT_KIND,
  displayName: 'Culture',
  icon: book,
  payloadVersion: CULTURE_PAYLOAD_VERSION,
  // Deferred like every kind's codec, and for the same reason the heraldry one is: this side
  // reaches `$lib/names` and the made-up-names generators, which nothing that merely lists or
  // validates a culture has any use for.
  loadCodec: async () => {
    const { cultureFromSnapshot, toCultureSnapshot } = await import('./culture_snapshot.js');
    return { toSnapshot: toCultureSnapshot, fromSnapshot: cultureFromSnapshot };
  },
  nameOf: (snapshot) => snapshot.name,
  validate: validateCultureSnapshot,
  migrate: migrateCultureSnapshot,
});
