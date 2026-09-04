/**
 * Writing an AD&D 2E character snapshot, and reading one back.
 *
 * Unlike a settlement, a character is almost entirely plain data already: numbers, strings, string
 * arrays, and arrays of spells, weapons, armor, and thief skill rows, none of which carry a
 * function. Exactly two fields are not storable, and they are the two that are not the user's —
 * `race` and `class`, each of which carries an `apply`.
 *
 * So the conversion is narrow: those two travel as names, and everything else travels as it is.
 * A blanket `stripFunctionValuesDeep` would have been the lazy alternative and it is the wrong
 * one, because it leaves `race` and `class` as objects with a hole where their behaviour was —
 * shaped like a race, unusable as one. Requirement 3.2 in docs/workshop.md asks for stripped **or
 * reconstructed explicitly**, and this is the second.
 *
 * **Every derived number stays in the payload.** THAC0, the five saving throws, the spell tables,
 * weight allowance — all of it, even though all of it could be recomputed from race, class, and
 * six attributes. That is requirement 4.2 for this kind: a DM who sets a character's THAC0 by
 * hand has made a decision no recomputation may overrule, and a character saved under one edition
 * of the class tables must still be that character after the tables change. Recomputation exists,
 * but as an explicit command in the builder rather than as something reading a payload does.
 */

import type { RNG } from '@ironarachne/rng';
import type { RulesetRef } from '$lib/rulesets';

import type ADNDCharacter from './adndcharacter.js';
import { createAdndCharacter } from './adndcharacter.js';
import type ADNDClass from './adndclass.js';
import type ADNDRace from './adndrace.js';
import * as classes from './classes/classes.js';
import * as races from './races/races.js';

/**
 * A character as it is stored: everything `ADNDCharacter` holds, with its race and class written
 * as the names they are looked up by.
 */
/** Stable identity for the pre-audit tables; it asserts no source or licence provenance. */
export const ADND_CHARACTER_RULESET_REF = {
  id: 'adnd-2e',
  release: 'legacy',
} as const satisfies RulesetRef;

export type AdndCharacterSnapshot = Omit<ADNDCharacter, 'race' | 'class'> & {
  ruleset: RulesetRef;
  raceName: string;
  className: string;
};

/**
 * `subraceName` needs no conversion and so is not listed above — it is already a string on the
 * character, which is the whole point of #99's fix. It travels through `Omit`'s remainder like
 * every other plain field.
 */

/**
 * A race this build does not have, carrying nothing but the name it was stored under.
 *
 * The point of it is that it is inert. Every number a character needs is already in the payload,
 * so a placeholder never has to produce one; what it has to do is let the sheet print
 * `a level 1 elf bladesinger` and the PDF render, rather than losing the character to a lookup
 * that missed. `apply` is the identity function because applying a race this build cannot
 * describe would invent a character nobody rolled.
 *
 * The eligibility fields are deliberately permissive rather than zeroed: a placeholder that
 * claimed a minimum strength of zero would still be answering questions about rules it does not
 * know. Nothing may derive from one — see `adnd_character_build.ts` — and the builder offers a
 * real class instead.
 */
export function unknownAdndRace(name: string): ADNDRace {
  return {
    name,
    adjective: name,
    apply: (character: ADNDCharacter) => character,
    minStrength: -1,
    maxStrength: -1,
    minDexterity: -1,
    maxDexterity: -1,
    minConstitution: -1,
    maxConstitution: -1,
    minIntelligence: -1,
    maxIntelligence: -1,
    minWisdom: -1,
    maxWisdom: -1,
    minCharisma: -1,
    maxCharisma: -1,
    baseHeightMale: 0,
    baseHeightFemale: 0,
    baseWeightMale: 0,
    baseWeightFemale: 0,
    heightModifier: '0',
    weightModifier: '0',
    baseAge: 0,
    baseMovement: 0,
    ageModifier: '0',
    availableInitialLanguages: [],
    allowedClasses: [],
    subraces: [],
  };
}

/** A class this build does not have. Inert for the reasons {@link unknownAdndRace} is. */
export function unknownAdndClass(name: string): ADNDClass {
  return {
    name,
    group: '',
    hitDice: '1d1',
    minStrength: -1,
    minDexterity: -1,
    minConstitution: -1,
    minIntelligence: -1,
    minWisdom: -1,
    minCharisma: -1,
    abilities: [],
    primeRequisites: [],
    allowedAlignments: [],
    hasSpells: false,
    allowedSpellTypes: [],
    spellList: [],
    allowedWeapons: [],
    allowedArmor: [],
    initialWP: 0,
    initialNWP: 0,
    wpPenalty: 0,
    apply: (character: ADNDCharacter) => character,
  };
}

/** Whether a race or class came back as a placeholder rather than a table this build has. */
export function isUnknownAdndRuleName(kind: 'race' | 'class', name: string): boolean {
  const known =
    kind === 'race'
      ? races.getAll().some((race) => race.name === name)
      : classes.getAll().some((cls) => cls.name === name);
  return !known;
}

export function toAdndCharacterSnapshot(character: ADNDCharacter): AdndCharacterSnapshot {
  const { race, class: characterClass, ...rest } = character;
  return {
    ...rest,
    ruleset: ADND_CHARACTER_RULESET_REF,
    raceName: race?.name ?? '',
    className: characterClass?.name ?? '',
  };
}

/**
 * A stored character back into the live one the library works with.
 *
 * The RNG the codec contract hands every `fromSnapshot` is unused here, and that is the correct
 * amount of use for it. It exists for kinds that rebuild name generators and the like; a
 * character is finished when it is stored, and drawing anything from a seed on the way back would
 * be regenerating over the user's edits — the one thing requirement 4.2 forbids.
 */
export function adndCharacterFromSnapshot(snapshot: AdndCharacterSnapshot): ADNDCharacter {
  const { ruleset: _ruleset, raceName, className, ...rest } = snapshot;
  const race = races.getAll().find((entry) => entry.name === raceName);
  const characterClass = classes.getAll().find((entry) => entry.name === className);
  const resolvedRace = race ?? unknownAdndRace(raceName);

  return {
    ...createAdndCharacter(),
    ...rest,
    race: resolvedRace,
    // A variety this build no longer has is dropped rather than quarantined, consistently with
    // the race and class lookups above: a subrace that was removed is not a corrupt record, and
    // every number it contributed is already in the payload.
    subraceName: resolvedRace.subraces.some((subrace) => subrace.name === rest.subraceName)
      ? rest.subraceName
      : '',
    class: characterClass ?? unknownAdndClass(className),
  };
}

/** The codec's reading half, with the signature the registry hands it. */
export function adndCharacterFromSnapshotWithRng(
  snapshot: AdndCharacterSnapshot,
  _rng: RNG,
): ADNDCharacter {
  return adndCharacterFromSnapshot(snapshot);
}
