import shield from '$lib/assets/icons/set2/shild.svg?raw';
import type { RNG } from '@ironarachne/rng';

import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  isStringArrayArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import {
  normalizeHeraldryGeneratorOptions,
  toHeraldrySnapshot,
  type HeraldryGeneratorOptionsSnapshot,
  type HeraldrySnapshot,
  type RestoredHeraldry,
} from './heraldry_snapshot.js';

/** Stable artifact kind id. A coat of arms is system-neutral, so there is one kind for all uses. */
export const HERALDRY_ARTIFACT_KIND = 'heraldry' as const;

/**
 * Version 2, and the first kind to need a migration at all.
 *
 * Version 1 is what is sitting in `generator.heraldry` in browsers today: its
 * `generatorOptions` predate field divisions and variation slots, so `fieldDivisionOption`,
 * `variationSlotOptions`, and `variationTinctureOptions` are simply absent. The three are
 * optional in the type because those old records exist —
 * `normalizeHeraldryGeneratorOptions` was added to cope with them at read time — and what
 * makes a payload version 2 is that all three are present.
 */
export const HERALDRY_PAYLOAD_VERSION = 2 as const;

const OPTION_STRING_FIELDS = [
  'heraldryTag',
  'chargeTinctureName',
  'numberOfChargesOption',
  'chargePosition',
];

function validateHeraldryOptions(value: unknown): PayloadResult<HeraldryGeneratorOptionsSnapshot> {
  const options = asRecord(value);
  if (options === null) {
    return rejectedPayload('invalid-payload', 'heraldry generatorOptions is not an object');
  }
  if (!hasStringFields(options, OPTION_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `heraldry generatorOptions needs string ${OPTION_STRING_FIELDS.join(', ')}`,
    );
  }
  if (typeof options.lockSeed !== 'boolean') {
    return rejectedPayload(
      'invalid-payload',
      'heraldry generatorOptions.lockSeed is not a boolean',
    );
  }
  if (typeof options.fieldDivisionOption !== 'string') {
    return rejectedPayload(
      'invalid-payload',
      'heraldry generatorOptions.fieldDivisionOption is missing; this is a version 1 payload',
    );
  }
  if (!isStringArray(options.variationSlotOptions)) {
    return rejectedPayload(
      'invalid-payload',
      'heraldry generatorOptions.variationSlotOptions is not an array of strings',
    );
  }
  if (!isStringArrayArray(options.variationTinctureOptions)) {
    return rejectedPayload(
      'invalid-payload',
      'heraldry generatorOptions.variationTinctureOptions is not an array of string arrays',
    );
  }
  return acceptedPayload(options as unknown as HeraldryGeneratorOptionsSnapshot);
}

function isStoredVariation(value: unknown): boolean {
  const variation = asRecord(value);
  return (
    variation !== null &&
    typeof variation.variationName === 'string' &&
    isStringArray(variation.tinctureNames)
  );
}

function isStoredChargeGroup(value: unknown): boolean {
  const group = asRecord(value);
  return (
    group !== null &&
    hasStringFields(group, ['chargeName', 'chargeTinctureName', 'arrangementName']) &&
    Number.isFinite(group.numberOfCharges)
  );
}

function validateStoredDevice(value: unknown): PayloadResult<unknown> {
  const device = asRecord(value);
  if (device === null) {
    return rejectedPayload('invalid-payload', 'heraldry device is not an object');
  }
  if (typeof device.fieldName !== 'string') {
    return rejectedPayload('invalid-payload', 'heraldry device.fieldName is not a string');
  }
  if (!Array.isArray(device.variations) || !device.variations.every(isStoredVariation)) {
    return rejectedPayload(
      'invalid-payload',
      'heraldry device.variations is not an array of stored variations',
    );
  }
  if (!Array.isArray(device.chargeGroups) || !device.chargeGroups.every(isStoredChargeGroup)) {
    return rejectedPayload(
      'invalid-payload',
      'heraldry device.chargeGroups is not an array of stored charge groups',
    );
  }
  return acceptedPayload(device);
}

/**
 * Checks the shape of a stored device, not whether the names in it still exist.
 *
 * Resolving them is what the codec does, and it is the half that costs 18 MB of charge art; a
 * validator that loaded it would put the entire glyph library behind reading a project's
 * contents. So a charge this build has dropped since the artifact was saved surfaces when
 * something opens it, and the caller quarantines it there — one artifact, not the project.
 */
export function validateHeraldrySnapshot(payload: unknown): PayloadResult<HeraldrySnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'heraldry payload is not an object');
  }
  if (!hasStringFields(record, ['name', 'seed', 'blazon'])) {
    return rejectedPayload('invalid-payload', 'heraldry payload needs string name, seed, blazon');
  }

  const options = validateHeraldryOptions(record.generatorOptions);
  if (!options.ok) {
    return options;
  }
  const device = validateStoredDevice(record.device);
  if (!device.ok) {
    return device;
  }

  return acceptedPayload(record as unknown as HeraldrySnapshot);
}

/**
 * Version 1 to version 2: fill in the three generator options that did not exist when the record
 * was written. `normalizeHeraldryGeneratorOptions` owns the defaults, so a default only ever
 * changes in one place. Everything else about the shape was already what it is now, which is why
 * the rest of the check is the current validator.
 */
export function migrateHeraldrySnapshot(
  payload: unknown,
  from: number,
): PayloadResult<HeraldrySnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `heraldry has no migration from payload version ${from}`,
    );
  }
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'heraldry payload is not an object');
  }
  const options = asRecord(record.generatorOptions);
  if (options === null) {
    return rejectedPayload('invalid-payload', 'heraldry generatorOptions is not an object');
  }
  return validateHeraldrySnapshot({
    ...record,
    generatorOptions: normalizeHeraldryGeneratorOptions(
      options as unknown as HeraldryGeneratorOptionsSnapshot,
    ),
  });
}

/**
 * Heraldry as an artifact. The live value is the restored form the generator page works with —
 * arms, seed, and the options that produced them — rather than the arms alone, because the
 * options are what let a user pick a saved coat of arms back up and keep rolling from it.
 */
export const heraldryArtifactKind = defineArtifactKind<RestoredHeraldry, HeraldrySnapshot>({
  kind: HERALDRY_ARTIFACT_KIND,
  displayName: 'Coat of Arms',
  icon: shield,
  payloadVersion: HERALDRY_PAYLOAD_VERSION,
  // The import is written out rather than computed so the bundler can split it, and it is split
  // because `heraldry_rehydrate` reaches the charge art. Writing a snapshot does not, but both
  // directions travel together: a codec you can only half load is not a codec.
  loadCodec: async () => {
    const { heraldryFromSnapshot } = await import('./heraldry_rehydrate.js');
    return {
      toSnapshot: (value: RestoredHeraldry) =>
        toHeraldrySnapshot(
          value.arms,
          value.seed,
          normalizeHeraldryGeneratorOptions(value.generatorOptions),
        ),
      // Nothing here is random: a snapshot names every field, variation, charge, and tincture,
      // and rebuilding it is lookups.
      fromSnapshot: (snapshot: HeraldrySnapshot, _rng: RNG) => heraldryFromSnapshot(snapshot),
    };
  },
  nameOf: (snapshot) => (snapshot.name.trim() === '' ? snapshot.blazon : snapshot.name),
  validate: validateHeraldrySnapshot,
  migrate: migrateHeraldrySnapshot,
});
