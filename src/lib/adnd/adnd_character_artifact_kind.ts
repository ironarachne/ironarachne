import helmet from '$lib/assets/icons/set2/helmet-2.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type ADNDCharacter from './adndcharacter.js';
import { ADND_CHARACTER_RULESET_REF, type AdndCharacterSnapshot } from './adnd_character_snapshot';

/**
 * Stable artifact kind id.
 *
 * Concept first, system as the qualifier, matching what `artifact_kind_types.ts` documents
 * alongside `character.swn` — which is what makes every character kind sort together in a vault
 * listing. An AD&D 2E character is a set of numbers that mean something only under that ruleset,
 * so it is system-qualified per decision 4 of docs/workshop.md.
 *
 * **One kind for two tools.** The generator at `/fantasy/adnd/character` and the builder at
 * `/fantasy/adnd/character/build` make the same thing, and two kinds for one shape would split a
 * user's characters across two vault entries, each openable by only one of the tools that made
 * them.
 */
export const ADND_CHARACTER_ARTIFACT_KIND = 'character.adnd-2e' as const;

/** Version 2 pins the ruleset identity without claiming unaudited source provenance. */
export const ADND_CHARACTER_PAYLOAD_VERSION = 2 as const;

function hasAdndRulesetRef(value: unknown): boolean {
  const ref = asRecord(value);
  return (
    ref !== null &&
    ref.id === ADND_CHARACTER_RULESET_REF.id &&
    ref.release === ADND_CHARACTER_RULESET_REF.release
  );
}

const CHARACTER_STRING_FIELDS = [
  'firstName',
  'lastName',
  'raceName',
  'className',
  'alignment',
  'subraceName',
];

/**
 * The numbers a character cannot be read without.
 *
 * Not every number on the character — the derived block runs to about forty, and a validator that
 * listed all of them would be a second copy of the type living somewhere that does not own it,
 * and the copy is the half that goes stale. What a validator owes is what reading depends on:
 * the six attributes a sheet prints, and the handful of combat numbers everything else is shown
 * beside. A payload missing a rarely-read derived field is a payload from a build that spelled it
 * differently, and it reads fine.
 */
const CHARACTER_NUMBER_FIELDS = [
  'level',
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
  'hp',
  'ac',
  'thaco',
  'currency',
];

function hasNumberFields(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => Number.isFinite(record[key]));
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
  if (!isNamedObjectArray(value)) {
    return rejectedPayload(
      'invalid-payload',
      `AD&D character ${field} is not a list of named entries`,
    );
  }
  return acceptedPayload(value);
}

/**
 * Thief skills, when the class has them.
 *
 * Absent and empty are both ordinary: eighteen of the twenty classes have none, so a validator
 * that demanded the field would reject every fighter ever rolled. Present, each row has to carry
 * the two numbers apart — the rule-derived `value` and the discretionary `points` — because that
 * separation is the entire reason the field exists rather than the prose it replaced.
 */
function validateThiefSkills(value: unknown): PayloadResult<unknown> {
  if (value === undefined) {
    return acceptedPayload(value);
  }
  if (
    !Array.isArray(value) ||
    !value.every((entry) => {
      const row = asRecord(entry);
      return (
        row !== null &&
        typeof row.name === 'string' &&
        Number.isFinite(row.value) &&
        Number.isFinite(row.points)
      );
    })
  ) {
    return rejectedPayload(
      'invalid-payload',
      'AD&D character thiefSkills is not a list of rows with a name, a value, and points',
    );
  }
  return acceptedPayload(value);
}

/** A kit is optional twice over: absent, explicitly null, or a named set of features. */
function validateKit(value: unknown): PayloadResult<unknown> {
  if (value === undefined || value === null) {
    return acceptedPayload(value);
  }
  const kit = asRecord(value);
  if (kit === null || typeof kit.name !== 'string' || !isStringArray(kit.features)) {
    return rejectedPayload(
      'invalid-payload',
      'AD&D character kit is not null and not a named list of features',
    );
  }
  return acceptedPayload(value);
}

function validateStringListField(value: unknown, field: string): PayloadResult<unknown> {
  if (value === undefined || isStringArray(value)) {
    return acceptedPayload(value);
  }
  return rejectedPayload('invalid-payload', `AD&D character ${field} is not an array of strings`);
}

/**
 * Checks what reading an AD&D character depends on.
 *
 * `raceName` and `className` are checked as strings and nothing more, deliberately. Whether this
 * build still has that race or class is not a question about the payload's validity — a class
 * that was removed is not a corrupt record — and answering it here would quarantine a character
 * over a lookup that nothing brings back. `adnd_character_snapshot.ts` resolves them and falls
 * back to an inert placeholder, which keeps the character readable and printable.
 */
export function validateAdndCharacterSnapshot(
  payload: unknown,
): PayloadResult<AdndCharacterSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'AD&D character payload is not an object');
  }
  if (!hasStringFields(record, CHARACTER_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `AD&D character payload needs string ${CHARACTER_STRING_FIELDS.join(', ')}`,
    );
  }
  if (!hasNumberFields(record, CHARACTER_NUMBER_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `AD&D character payload needs numeric ${CHARACTER_NUMBER_FIELDS.join(', ')}`,
    );
  }
  if (!hasAdndRulesetRef(record.ruleset)) {
    return rejectedPayload('invalid-payload', 'AD&D character has no supported ruleset ref');
  }

  const checks: PayloadResult<unknown>[] = [
    validateNamedList(record.spells, 'spells'),
    validateNamedList(record.weapons, 'weapons'),
    validateNamedList(record.armor, 'armor'),
    validateStringListField(record.abilities, 'abilities'),
    validateStringListField(record.weaponProficiencyGroups, 'weaponProficiencyGroups'),
    validateStringListField(record.nonweaponProficiencies, 'nonweaponProficiencies'),
    validateThiefSkills(record.thiefSkills),
    validateKit(record.kit),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<AdndCharacterSnapshot>;
  }

  return acceptedPayload(record as unknown as AdndCharacterSnapshot);
}

/** Adds only the pinned system identity; every existing system-owned field remains untouched. */
export function migrateAdndCharacterSnapshot(
  payload: unknown,
  from: number,
): PayloadResult<AdndCharacterSnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `AD&D character has no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  return record === null
    ? rejectedPayload('invalid-payload', 'AD&D character payload is not an object')
    : validateAdndCharacterSnapshot({ ...record, ruleset: ADND_CHARACTER_RULESET_REF });
}

/** What to call a character that was never named: its race and class, which it always has. */
function adndCharacterName(snapshot: AdndCharacterSnapshot): string {
  const given = `${snapshot.firstName} ${snapshot.lastName}`.trim();
  if (given !== '') {
    return given;
  }
  const race =
    snapshot.subraceName === ''
      ? snapshot.raceName
      : `${snapshot.subraceName} ${snapshot.raceName}`;
  const described = `${race} ${snapshot.className}`.trim();
  return described === '' ? 'AD&D 2E Character' : described;
}

/**
 * An AD&D 2E character as an artifact.
 *
 * The codec is unusually cheap on both sides — a character is nearly all plain data, and the two
 * fields that are not resolve against tables already in this library — so unlike settlement or
 * heraldry there is no expensive half to keep out of the chunk that merely lists a project. It is
 * still loaded on demand, because the contract is the same for every kind and a codec that
 * happened to be cheap today is not a reason to wire it differently from its neighbours.
 */
export const adndCharacterArtifactKind = defineArtifactKind<ADNDCharacter, AdndCharacterSnapshot>({
  kind: ADND_CHARACTER_ARTIFACT_KIND,
  displayName: 'AD&D 2E Character',
  icon: helmet,
  payloadVersion: ADND_CHARACTER_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { adndCharacterFromSnapshotWithRng, toAdndCharacterSnapshot } =
      await import('./adnd_character_snapshot.js');
    return {
      toSnapshot: toAdndCharacterSnapshot,
      fromSnapshot: adndCharacterFromSnapshotWithRng,
    };
  },
  nameOf: adndCharacterName,
  validate: validateAdndCharacterSnapshot,
  migrate: migrateAdndCharacterSnapshot,
});
