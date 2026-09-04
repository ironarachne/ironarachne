/**
 * Writing a creature for storage, and the shape it is stored in.
 *
 * `StoredCreature` is the character treatment applied one type up the hierarchy, which is what
 * docs/tool-readiness.md's stored vocabulary declares: a `Creature` embeds a whole `Species` exactly
 * as a `Character` does, and a species is a set of generator tables — age categories, a size
 * matrix, trait configs, abilities — none of it about this animal, and every number it produced is
 * already in the payload. So the species travels as its name and is rebuilt on read
 * (`creature_rehydrate.ts`), with an unknown name becoming an inert placeholder rather than a
 * refusal.
 *
 * Declared here, in the library that owns the concept, because two payloads compose it — the
 * encounter (#54) and the dungeon (#59) — and one shape beats two with the same name drifting
 * apart. This module holds the writing half and the validator only; reading reaches the species
 * tables and lives in its own file so that listing or validating a payload never loads them.
 */

import {
  acceptedPayload,
  asRecord,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
import { validateMechanicsSet, withLegacyActorMechanics, type MechanicsSet } from '$lib/rulesets';

import type { Creature } from './creature_types.js';

/** A creature with its species written as a name. */
export type StoredCreature = Omit<Creature, 'species' | 'mechanics'> & {
  speciesName: string;
  mechanics: MechanicsSet;
};

/**
 * A creature with its species written as a name.
 *
 * No strip here, for the reason `toStoredCharacter` gives none: this is the conversion a larger
 * payload composes, and the payload runs the net over the whole tree once.
 */
export function toStoredCreature(creature: Creature): StoredCreature {
  const { species, ...rest } = creature;
  return withLegacyActorMechanics(
    { ...rest, speciesName: species.name },
    'generated',
  ) as StoredCreature;
}

const CREATURE_STRING_FIELDS = ['id', 'name', 'description', 'shortDescription', 'speciesName'];
const CREATURE_NUMBER_FIELDS = ['age', 'height', 'weight', 'length'];

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

function isNamedRecord(value: unknown): boolean {
  const record = asRecord(value);
  return record !== null && typeof record.name === 'string';
}

/**
 * Checks what `creatureFromStored` depends on: the fields it copies straight through, and the name
 * it resolves the species from.
 *
 * `speciesName` is checked as a string and nothing more, deliberately, for the reason the character
 * validator gives: whether this build still has that species is not a question about the payload's
 * validity, and answering it here would quarantine a creature over a lookup nothing brings back.
 */
export function validateStoredCreature(payload: unknown): PayloadResult<StoredCreature> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'creature is not an object');
  }
  if (!hasStringFields(record, CREATURE_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `creature needs string ${CREATURE_STRING_FIELDS.join(', ')}`,
    );
  }
  if (!hasNumberFields(record, CREATURE_NUMBER_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `creature needs numeric ${CREATURE_NUMBER_FIELDS.join(', ')}`,
    );
  }
  for (const field of ['tags', 'behaviors', 'creatureTypes']) {
    if (!isStringArray(record[field])) {
      return rejectedPayload('invalid-payload', `creature ${field} is not an array of strings`);
    }
  }
  for (const field of ['gender', 'ageCategory']) {
    if (!isNamedRecord(record[field])) {
      return rejectedPayload('invalid-payload', `creature ${field} is not an object with a name`);
    }
  }
  for (const field of ['physicalTraits', 'abilities', 'carried']) {
    if (!isNamedObjectArray(record[field])) {
      return rejectedPayload('invalid-payload', `creature ${field} is not a list of named entries`);
    }
  }
  const mechanics = validateMechanicsSet(record.mechanics, 'actor');
  if (!mechanics.ok) {
    return rejectedPayload(
      'invalid-payload',
      `creature has invalid mechanics: ${mechanics.message}`,
    );
  }

  return acceptedPayload({ ...record, mechanics: mechanics.value } as unknown as StoredCreature);
}
