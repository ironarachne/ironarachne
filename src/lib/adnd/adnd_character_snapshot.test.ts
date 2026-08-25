import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  adndCharacterFromSnapshot,
  isUnknownAdndRuleName,
  toAdndCharacterSnapshot,
  unknownAdndClass,
  unknownAdndRace,
} from './adnd_character_snapshot.js';
import { generateCharacter } from './adndcharactergenerator.js';
import { getDefaultConfig } from './adndcharactergeneratorconfig.js';
import type ADNDCharacter from './adndcharacter.js';
import { createAdndCharacter } from './adndcharacter.js';
import human from './races/human.js';
import thief from './classes/thief.js';

/**
 * A generated character of a given shape, found by sweeping seeds.
 *
 * Sweeping rather than hand-building, because the point of a round-trip test is that a character
 * the generator actually produces survives, and a hand-built one only proves the fields the test
 * author remembered to set.
 */
function generateMatching(
  predicate: (character: ADNDCharacter) => boolean,
  options: { proficiencies?: boolean; kits?: boolean } = {},
): ADNDCharacter {
  for (let seed = 0; seed < 400; seed += 1) {
    const config = getDefaultConfig(new RNG(`roundtrip-${seed}`));
    config.includeProficiencies = options.proficiencies ?? false;
    config.includeKits = options.kits ?? false;
    let character: ADNDCharacter;
    try {
      character = generateCharacter(config);
    } catch {
      // Some seeds roll attributes that qualify for no class at all. That is a separate defect,
      // tracked against the roll path; it is not this test's subject.
      continue;
    }
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in range produced a character matching the predicate');
}

function expectRoundTrip(character: ADNDCharacter): void {
  const restored = adndCharacterFromSnapshot(toAdndCharacterSnapshot(character));

  // Compared whole rather than field by field: the character has about sixty fields, and a test
  // that listed the ones it cared about would pass while silently dropping the rest.
  expect(restored).toEqual(character);
}

describe('AD&D character snapshot round trip', () => {
  it('preserves a plain generated character', () => {
    expectRoundTrip(generateMatching(() => true));
  });

  it('preserves proficiencies and a kit', () => {
    const character = generateMatching(
      (c) => c.weaponProficiencyGroups.length > 0 && c.kit !== null,
      { proficiencies: true, kits: true },
    );

    expectRoundTrip(character);
  });

  it('preserves a caster with spells', () => {
    expectRoundTrip(generateMatching((c) => c.spells.length > 0));
  });

  it('preserves a rogue with an allocation, points and base kept apart', () => {
    const character = generateMatching((c) => c.thiefSkills.length > 0);

    expectRoundTrip(character);

    const restored = adndCharacterFromSnapshot(toAdndCharacterSnapshot(character));
    const dealt = restored.thiefSkills.reduce((sum, row) => sum + row.points, 0);
    expect(dealt).toBe(character.class.name === 'bard' ? 20 : 60);
  });

  it('preserves equipment down to the values on each item', () => {
    const character = generateMatching((c) => c.weapons.length > 0 && c.armor.length > 0);
    const restored = adndCharacterFromSnapshot(toAdndCharacterSnapshot(character));

    expect(restored.weapons).toEqual(character.weapons);
    expect(restored.armor).toEqual(character.armor);
  });

  it('keeps a hand-edited derived number rather than recomputing it', () => {
    // Requirement 4.2: the payload is authoritative. A DM who sets THAC0 by hand has made a
    // decision, and reading the character back must not quietly overrule it from the tables.
    const character = generateMatching(() => true);
    character.thaco = 3;
    character.hp = 99;
    character.poisonSavingThrow = 2;

    const restored = adndCharacterFromSnapshot(toAdndCharacterSnapshot(character));

    expect(restored.thaco).toBe(3);
    expect(restored.hp).toBe(99);
    expect(restored.poisonSavingThrow).toBe(2);
  });

  it('stores the race and class as names, not as objects carrying functions', () => {
    const snapshot = toAdndCharacterSnapshot(generateMatching(() => true));

    expect(typeof snapshot.raceName).toBe('string');
    expect(typeof snapshot.className).toBe('string');
    expect(snapshot).not.toHaveProperty('race');
    expect(snapshot).not.toHaveProperty('class');
    // The whole reason the two are converted: `structuredClone` is what IndexedDB stores with,
    // and it refuses a function outright.
    expect(() => structuredClone(snapshot)).not.toThrow();
  });
});

describe('unknown races and classes', () => {
  it('falls back to a placeholder carrying the stored name', () => {
    const character = createAdndCharacter();
    character.race = human;
    character.class = thief;
    const snapshot = toAdndCharacterSnapshot(character);
    snapshot.raceName = 'gnoll';
    snapshot.className = 'bladesinger';

    const restored = adndCharacterFromSnapshot(snapshot);

    // The character survives the lookup missing, which is the point: nothing brings back a table
    // that was removed, so quarantining would retire the character permanently.
    expect(restored.race.name).toBe('gnoll');
    expect(restored.class.name).toBe('bladesinger');
  });

  it('keeps every number the payload carried when the lookup misses', () => {
    const character = createAdndCharacter();
    character.race = human;
    character.class = thief;
    character.hp = 7;
    character.thaco = 20;
    const snapshot = toAdndCharacterSnapshot(character);
    snapshot.className = 'bladesinger';

    const restored = adndCharacterFromSnapshot(snapshot);

    expect(restored.hp).toBe(7);
    expect(restored.thaco).toBe(20);
  });

  it('makes a placeholder inert, so nothing derives from a rule it does not know', () => {
    const character = createAdndCharacter();
    character.strength = 12;

    expect(unknownAdndRace('gnoll').apply(character, new RNG('x'))).toEqual(character);
    expect(unknownAdndClass('bladesinger').apply(character, new RNG('x'))).toEqual(character);
    expect(unknownAdndClass('bladesinger').hasSpells).toBe(false);
  });

  it('reports whether a name is one this build has', () => {
    expect(isUnknownAdndRuleName('race', 'human')).toBe(false);
    expect(isUnknownAdndRuleName('race', 'gnoll')).toBe(true);
    expect(isUnknownAdndRuleName('class', 'thief')).toBe(false);
    expect(isUnknownAdndRuleName('class', 'bladesinger')).toBe(true);
  });
});
