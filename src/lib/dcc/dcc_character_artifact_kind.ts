import scythe from '$lib/assets/icons/set3/scythe.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import { DCC_CHARACTER_RULESET_REF, type DccCharacterSnapshot } from './dcc_character_snapshot';
import type { DCCCharacter } from './dcc_types';

/**
 * Stable artifact kind id.
 *
 * Concept first, system as the qualifier, so every character kind sorts together in a vault
 * listing. A DCC zero-level character is a set of numbers that mean something only under that
 * ruleset — a lucky sign modifier and a Mighty Deed die are not portable — so it is
 * system-qualified per decision 4 of docs/workshop.md, alongside `character.adnd-2e`.
 *
 * **One artifact is one character.** A funnel is a way of rolling, not a thing in the world: the
 * four peasants who walk into the dungeon are four characters, three of them about to die, and the
 * survivor is a character a player keeps for a year. A payload holding all four would make that
 * survivor unopenable on their own, un-renamable, and impossible to reference from anything else,
 * and requirement 3.5 — name on save, rename after — is unanswerable for a bundle. See decision 1
 * of docs/readiness-characters.md; it is what makes #14 small.
 */
export const DCC_CHARACTER_ARTIFACT_KIND = 'character.dcc' as const;

/** Version 2 pins the ruleset identity without claiming unaudited source provenance. */
export const DCC_CHARACTER_PAYLOAD_VERSION = 2 as const;

function hasDccRulesetRef(value: unknown): boolean {
  const ref = asRecord(value);
  return (
    ref !== null &&
    ref.id === DCC_CHARACTER_RULESET_REF.id &&
    ref.release === DCC_CHARACTER_RULESET_REF.release
  );
}

const CHARACTER_STRING_FIELDS = ['firstName', 'lastName', 'gender', 'alignment'];

/**
 * The numbers a character sheet cannot be read without.
 *
 * Not every number on the character. The derived block runs to a dozen more — the spell levels, the
 * attack modifier, the speed — and a validator listing all of them would be a second copy of
 * `DCCCharacter` living in a module that does not own it, and the copy is the half that goes stale.
 * What a validator owes is what reading depends on: the level that says this is a zero-level
 * character, and the two numbers every DCC sheet is read from the top of.
 */
const CHARACTER_NUMBER_FIELDS = ['level', 'hp', 'armorClass'];

const ATTRIBUTES = [
  'strength',
  'agility',
  'stamina',
  'personality',
  'intelligence',
  'luck',
] as const;

function hasNumberFields(record: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => Number.isFinite(record[key]));
}

/**
 * The six attributes, each a value and the modifier derived from it.
 *
 * Both numbers are checked because both are stored and both are shown. The modifier is derivable
 * from the value, which is exactly why it must be validated rather than recomputed: a judge who has
 * adjusted one has made a decision, and a reader that quietly recalculated it would overrule them.
 */
function validateAttributes(record: Record<string, unknown>): PayloadResult<unknown> {
  for (const name of ATTRIBUTES) {
    const attribute = asRecord(record[name]);
    if (attribute === null || !hasNumberFields(attribute, ['value', 'modifier'])) {
      return rejectedPayload(
        'invalid-payload',
        `DCC character ${name} is not an attribute with a numeric value and modifier`,
      );
    }
  }
  return acceptedPayload(record);
}

/**
 * The occupation, as the row the character drew.
 *
 * Checked for a name and nothing more. Whether this build still has an occupation of that name is
 * not a question about the payload's validity — a table that was renamed is not a corrupt record,
 * and the human farmer's own `apply` handler rewrites its name to the crop it rolled, so a great
 * many perfectly good characters carry a name no table ever had.
 */
function validateStoredOccupation(value: unknown): PayloadResult<unknown> {
  const occupation = asRecord(value);
  if (occupation === null || typeof occupation.name !== 'string') {
    return rejectedPayload('invalid-payload', 'DCC character occupation has no name');
  }
  return acceptedPayload(occupation);
}

/** The lucky sign, which the sheet prints as a name, a description, and the character's modifier. */
function validateStoredLuckyRoll(value: unknown): PayloadResult<unknown> {
  const luckyRoll = asRecord(value);
  if (
    luckyRoll === null ||
    !hasStringFields(luckyRoll, ['name', 'description']) ||
    !Number.isFinite(luckyRoll.modifier)
  ) {
    return rejectedPayload(
      'invalid-payload',
      'DCC character luckyRoll is not a named sign with a description and a modifier',
    );
  }
  return acceptedPayload(luckyRoll);
}

function isNamedObjectArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      const record = asRecord(entry);
      return record !== null && typeof record.name === 'string';
    })
  );
}

function validateNamedList(value: unknown, field: string): PayloadResult<unknown> {
  if (value === undefined || isNamedObjectArray(value)) {
    return acceptedPayload(value);
  }
  return rejectedPayload(
    'invalid-payload',
    `DCC character ${field} is not a list of named entries`,
  );
}

/** Coins by denomination. Absent is accepted; present, every entry has to be a number. */
function validateCurrency(value: unknown): PayloadResult<unknown> {
  if (value === undefined) {
    return acceptedPayload(value);
  }
  const currency = asRecord(value);
  if (currency === null || !Object.values(currency).every((amount) => Number.isFinite(amount))) {
    return rejectedPayload('invalid-payload', 'DCC character currency is not amounts by coin');
  }
  return acceptedPayload(currency);
}

function validateStringListField(value: unknown, field: string): PayloadResult<unknown> {
  if (value === undefined || isStringArray(value)) {
    return acceptedPayload(value);
  }
  return rejectedPayload('invalid-payload', `DCC character ${field} is not an array of strings`);
}

/** Checks what `dccCharacterFromSnapshot` depends on, and what a sheet is printed from. */
export function validateDccCharacterSnapshot(
  payload: unknown,
): PayloadResult<DccCharacterSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'DCC character payload is not an object');
  }
  if (!hasStringFields(record, CHARACTER_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `DCC character payload needs string ${CHARACTER_STRING_FIELDS.join(', ')}`,
    );
  }
  if (!hasNumberFields(record, CHARACTER_NUMBER_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `DCC character payload needs numeric ${CHARACTER_NUMBER_FIELDS.join(', ')}`,
    );
  }
  if (!hasDccRulesetRef(record.ruleset)) {
    return rejectedPayload('invalid-payload', 'DCC character has no supported ruleset ref');
  }

  const checks: PayloadResult<unknown>[] = [
    validateAttributes(record),
    validateStoredOccupation(record.occupation),
    validateStoredLuckyRoll(record.luckyRoll),
    validateNamedList(record.equipment, 'equipment'),
    validateNamedList(record.weapons, 'weapons'),
    validateCurrency(record.currency),
    validateStringListField(record.specialRules, 'specialRules'),
    validateStringListField(record.languages, 'languages'),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<DccCharacterSnapshot>;
  }

  return acceptedPayload(record as unknown as DccCharacterSnapshot);
}

/** Adds only the pinned system identity; every existing system-owned field remains untouched. */
export function migrateDccCharacterSnapshot(
  payload: unknown,
  from: number,
): PayloadResult<DccCharacterSnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `DCC character has no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  return record === null
    ? rejectedPayload('invalid-payload', 'DCC character payload is not an object')
    : validateDccCharacterSnapshot({ ...record, ruleset: DCC_CHARACTER_RULESET_REF });
}

/** What to call a character that was saved unnamed: their occupation, which they always have. */
function dccCharacterName(snapshot: DccCharacterSnapshot): string {
  const given = `${snapshot.firstName} ${snapshot.lastName}`.trim();
  if (given !== '') {
    return given;
  }
  const occupation = snapshot.occupation.name.trim();
  return occupation === '' ? 'DCC Character' : occupation;
}

/**
 * A DCC zero-level character as an artifact.
 *
 * The codec is cheap on both sides — the character is nearly all plain data, and the two rule
 * objects resolve against tables already in this library — so unlike settlement or heraldry there
 * is no expensive half to keep out of the chunk that merely lists a project. It is still loaded on
 * demand, because the contract is the same for every kind and a codec that happens to be cheap
 * today is not a reason to wire it differently from its neighbours.
 */
export const dccCharacterArtifactKind = defineArtifactKind<DCCCharacter, DccCharacterSnapshot>({
  kind: DCC_CHARACTER_ARTIFACT_KIND,
  displayName: 'DCC Character',
  icon: scythe,
  payloadVersion: DCC_CHARACTER_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { dccCharacterFromSnapshotWithRng, toDccCharacterSnapshot } =
      await import('./dcc_character_snapshot.js');
    return {
      toSnapshot: toDccCharacterSnapshot,
      fromSnapshot: dccCharacterFromSnapshotWithRng,
    };
  },
  nameOf: dccCharacterName,
  validate: validateDccCharacterSnapshot,
  migrate: migrateDccCharacterSnapshot,
});
