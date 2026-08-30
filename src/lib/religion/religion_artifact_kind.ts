import amulet from '$lib/assets/icons/set2/necklece.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { ReligionSnapshot, RestoredReligion } from './religion_snapshot';

/** Stable artifact kind id. A religion is system-neutral: one kind covers every use of it. */
export const RELIGION_ARTIFACT_KIND = 'religion' as const;

/** Version 1. The snapshot shape has not changed since religions became savable. */
export const RELIGION_PAYLOAD_VERSION = 1 as const;

const OPTION_STRING_FIELDS = ['polytheisticStanding', 'spiritCosmologyDepth'];

function validateReligionOptions(value: unknown): PayloadResult<unknown> {
  const options = asRecord(value);
  if (options === null) {
    return rejectedPayload('invalid-payload', 'religion generatorOptions is not an object');
  }
  if (typeof options.lockSeed !== 'boolean' || typeof options.useSavedCulture !== 'boolean') {
    return rejectedPayload(
      'invalid-payload',
      'religion generatorOptions needs boolean lockSeed and useSavedCulture',
    );
  }
  if (!isStringArray(options.selectedCategories) || !isStringArray(options.selectedSpecies)) {
    return rejectedPayload(
      'invalid-payload',
      'religion generatorOptions needs selectedCategories and selectedSpecies string arrays',
    );
  }
  if (!hasStringFields(options, OPTION_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `religion generatorOptions needs string ${OPTION_STRING_FIELDS.join(', ')}`,
    );
  }
  if (options.savedCultureName !== undefined && typeof options.savedCultureName !== 'string') {
    return rejectedPayload(
      'invalid-payload',
      'religion generatorOptions.savedCultureName is not a string',
    );
  }
  return acceptedPayload(options);
}

/**
 * Checks the envelope and the options, and asks of the religion itself only that it be an object
 * with a name. The religion is generated content whose shape is `$lib/religion`'s to describe;
 * a structural schema for it here would be a second copy of those types, and the copy is what
 * would go stale.
 */
export function validateReligionSnapshot(payload: unknown): PayloadResult<ReligionSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'religion payload is not an object');
  }
  if (!hasStringFields(record, ['name', 'seed'])) {
    return rejectedPayload('invalid-payload', 'religion payload needs string name and seed');
  }
  const religion = asRecord(record.religion);
  if (religion === null || typeof religion.name !== 'string') {
    return rejectedPayload(
      'invalid-payload',
      'religion payload has no religion object with a name',
    );
  }
  const options = validateReligionOptions(record.generatorOptions);
  if (!options.ok) {
    return options;
  }
  return acceptedPayload(record as unknown as ReligionSnapshot);
}

/**
 * Religions have only ever been stored at version 1, so there is nothing older to bring forward
 * and this rejects rather than pretending. The contract requires the step to exist; this is
 * where it goes the day the shape changes.
 */
export function migrateReligionSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<ReligionSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `religion has no migration from payload version ${from}; version ${RELIGION_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * A religion as an artifact. The live value is the restored form the generator page works with —
 * the religion plus the seed and options that produced it — so a saved religion can be picked
 * back up and rolled on from where it was left.
 */
export const religionArtifactKind = defineArtifactKind<RestoredReligion, ReligionSnapshot>({
  kind: RELIGION_ARTIFACT_KIND,
  displayName: 'Religion',
  icon: amulet,
  payloadVersion: RELIGION_PAYLOAD_VERSION,
  // Deferred like every kind's codec. A religion is the cheap case — the module it loads is
  // small — but a contract that some kinds follow and others do not is not a contract, and a
  // uniform one means a caller never has to know which kind it is holding.
  loadCodec: async () => {
    const { religionFromSnapshot, toReligionSnapshot } = await import('./religion_snapshot.js');
    return {
      toSnapshot: (value: RestoredReligion) =>
        toReligionSnapshot(value.religion, value.seed, value.generatorOptions),
      // A religion snapshot is already plain data; there is nothing to rebuild, so nothing rolls.
      fromSnapshot: (snapshot: ReligionSnapshot) => religionFromSnapshot(snapshot),
    };
  },
  nameOf: (snapshot) => snapshot.name,
  validate: validateReligionSnapshot,
  migrate: migrateReligionSnapshot,
});
