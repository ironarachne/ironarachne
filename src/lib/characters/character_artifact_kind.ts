import human from '$lib/assets/icons/set3/human.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { CharacterSnapshot } from './character_snapshot';
import type { Character } from './character_types';

/**
 * Stable artifact kind id — unqualified, and deliberately so.
 *
 * A character from this generator is a *person*: a name, a species, an occupation, a build and some
 * traits. It is not a set of numbers that mean something only under one ruleset, which is the test
 * decision 4 of docs/workshop.md sets for whether a kind is system-qualified. So the qualifier would
 * be a lie about what the payload is.
 *
 * It leaves `character.adnd-2e` — registered — and `character.dcc`, `character.swn` and
 * `character.uncharted-worlds` — not yet — free, and sorts with them in a vault listing: concept
 * first, system as the qualifier, with the unqualified one as the generic.
 *
 * A character saved from `/character` and one saved from `/fantasy/adnd/character` are different
 * kinds on purpose. They are not the same payload, and one editor cannot open both.
 */
export const CHARACTER_ARTIFACT_KIND = 'character' as const;

/** Version 1. The first shape a fantasy character has been stored in. */
export const CHARACTER_PAYLOAD_VERSION = 1 as const;

const CHARACTER_STRING_FIELDS = [
  'id',
  'name',
  'firstName',
  'lastName',
  'description',
  'shortDescription',
  'speciesName',
];

const CHARACTER_NUMBER_FIELDS = ['age', 'height', 'weight', 'length'];

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
  if (value === undefined || isNamedObjectArray(value)) {
    return acceptedPayload(value);
  }
  return rejectedPayload('invalid-payload', `character ${field} is not a list of named entries`);
}

function validateNamedRecord(value: unknown, field: string): PayloadResult<unknown> {
  const record = asRecord(value);
  if (record === null || typeof record.name !== 'string') {
    return rejectedPayload('invalid-payload', `character ${field} is not an object with a name`);
  }
  return acceptedPayload(record);
}

/**
 * The archetype, when there is one.
 *
 * Absent is ordinary rather than a fault: infants and children never get one, and neither does an
 * adult whose filtered archetype list came back empty. Present, it is checked for a name and its
 * tags — a name because that is what the sheet prints and what the equipment tables are rebuilt
 * from, and tags because a character's own tag list was extended from them.
 */
function validateStoredArchetype(value: unknown): PayloadResult<unknown> {
  if (value === undefined) {
    return acceptedPayload(value);
  }
  const archetype = asRecord(value);
  if (archetype === null || typeof archetype.name !== 'string') {
    return rejectedPayload('invalid-payload', 'character archetype is not an object with a name');
  }
  if (!isStringArray(archetype.tags)) {
    return rejectedPayload(
      'invalid-payload',
      'character archetype tags is not an array of strings',
    );
  }
  return acceptedPayload(archetype);
}

/**
 * A coat of arms is optional twice over: absent for a character with none, `null` for one whose
 * arms are a referenced artifact, and stored parts for one carrying its own.
 *
 * `null` has to be accepted rather than rejected, and that is not leniency: it is the value a
 * composed character is *written* with, so a validator that turned it away would make a character
 * unreadable by the very build that saved it. The reference beside the payload says which arms.
 */
function validateStoredHeraldry(value: unknown): PayloadResult<unknown> {
  if (value === undefined || value === null) {
    return acceptedPayload(value);
  }
  const arms = asRecord(value);
  if (arms === null || typeof arms.blazon !== 'string') {
    return rejectedPayload('invalid-payload', 'character heraldry has no blazon');
  }
  const device = asRecord(arms.device);
  if (
    device === null ||
    typeof device.fieldName !== 'string' ||
    !Array.isArray(device.chargeGroups)
  ) {
    return rejectedPayload(
      'invalid-payload',
      'character heraldry device is not a named field with charge groups',
    );
  }
  return acceptedPayload(arms);
}

/**
 * Titles, when the character holds any.
 *
 * Only the two forms of the title itself are checked. A title carries eight more fields, and a
 * validator that listed all of them would be a second copy of `Title` living in a module that does
 * not own it — and the copy is the half that goes stale. What reading depends on is having
 * something to print.
 */
function validateTitles(value: unknown): PayloadResult<unknown> {
  if (value === undefined) {
    return acceptedPayload(value);
  }
  if (
    !Array.isArray(value) ||
    !value.every((entry) => {
      const title = asRecord(entry);
      return title !== null && hasStringFields(title, ['maleTitle', 'femaleTitle']);
    })
  ) {
    return rejectedPayload(
      'invalid-payload',
      'character titles is not a list of titles with a male and female form',
    );
  }
  return acceptedPayload(value);
}

/**
 * Checks what `characterFromSnapshot` depends on: the fields it copies straight through, and the
 * names it resolves species, archetype, and arms from.
 *
 * `speciesName` is checked as a string and nothing more, deliberately. Whether this build still has
 * that species is not a question about the payload's validity — a species that was removed is not a
 * corrupt record — and answering it here would quarantine a character over a lookup that nothing
 * brings back. `character_rehydrate.ts` resolves it and falls back to an inert placeholder, which
 * keeps the character readable and printable.
 */
export function validateCharacterSnapshot(payload: unknown): PayloadResult<CharacterSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'character payload is not an object');
  }
  if (!hasStringFields(record, CHARACTER_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `character payload needs string ${CHARACTER_STRING_FIELDS.join(', ')}`,
    );
  }
  if (!hasNumberFields(record, CHARACTER_NUMBER_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `character payload needs numeric ${CHARACTER_NUMBER_FIELDS.join(', ')}`,
    );
  }
  if (!isStringArray(record.personalityTraits)) {
    return rejectedPayload(
      'invalid-payload',
      'character personalityTraits is not an array of strings',
    );
  }
  if (!isStringArray(record.tags)) {
    return rejectedPayload('invalid-payload', 'character tags is not an array of strings');
  }

  const checks: PayloadResult<unknown>[] = [
    validateNamedRecord(record.gender, 'gender'),
    validateNamedRecord(record.ageCategory, 'ageCategory'),
    validateNamedList(record.physicalTraits, 'physicalTraits'),
    validateNamedList(record.abilities, 'abilities'),
    validateNamedList(record.carried, 'carried'),
    validateStoredArchetype(record.archetype),
    validateStoredHeraldry(record.heraldry),
    validateTitles(record.titles),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<CharacterSnapshot>;
  }

  return acceptedPayload(record as unknown as CharacterSnapshot);
}

/**
 * Characters have only ever been stored at version 1, so there is nothing older to bring forward
 * and this rejects rather than pretending. It is here because the contract requires it, and it is
 * where the step goes the day the shape changes — a kind without one looks complete right up until
 * it silently drops someone's work, and local-only means there is no server-side migration to fall
 * back on.
 */
export function migrateCharacterSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<CharacterSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `character has no migration from payload version ${from}; version ${CHARACTER_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a character that was saved without a name: what they are, which they always have. */
function characterName(snapshot: CharacterSnapshot): string {
  const given = snapshot.name.trim();
  if (given !== '') {
    return given;
  }
  const described = `${snapshot.speciesName} ${snapshot.archetype?.name ?? ''}`.trim();
  return described === '' ? 'Character' : described;
}

/**
 * A fantasy character as an artifact.
 *
 * The live value is the `Character` the library works with, and the snapshot is that character with
 * its species, archetype, and arms written as names — see `character_snapshot.ts`. The codec's two
 * halves come from two modules because reading is much the more expensive one: it reaches the
 * archetype tables, the species list, and the 18 MB charge library, none of which validating or
 * listing a character touches.
 */
export const characterArtifactKind = defineArtifactKind<Character, CharacterSnapshot>({
  kind: CHARACTER_ARTIFACT_KIND,
  displayName: 'Character',
  icon: human,
  payloadVersion: CHARACTER_PAYLOAD_VERSION,
  loadCodec: async () => {
    const [{ toCharacterSnapshot }, { characterFromSnapshot }] = await Promise.all([
      import('./character_snapshot.js'),
      import('./character_rehydrate.js'),
    ]);
    return {
      // The referenced-arms flag is the generator's to set: it knows whether the arms on screen
      // came from a picker. Everything reaching the codec generically — export, a project copy —
      // has a snapshot already and passes through the payload's own `heraldry`.
      toSnapshot: (character: Character) => toCharacterSnapshot(character),
      // The RNG the contract hands every codec. A character rebuilds from names alone, so there is
      // nothing here for it to do.
      fromSnapshot: (snapshot: CharacterSnapshot) => characterFromSnapshot(snapshot),
    };
  },
  nameOf: characterName,
  validate: validateCharacterSnapshot,
  migrate: migrateCharacterSnapshot,
});
