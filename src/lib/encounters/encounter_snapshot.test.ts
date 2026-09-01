import { describe, expect, it } from 'vitest';

import { encounterFromSnapshot } from './encounter_rehydrate.js';
import { rollEncounter } from './encounter_roll.js';
import { isEncounterCharacter, toEncounterSnapshot } from './encounter_snapshot.js';

/** A band of people and a band of beasts, so both halves of the vocabulary are exercised. */
const people = rollEncounter('snapshot-people', { templateName: 'group of bandits' });
const beasts = rollEncounter('snapshot-beasts', { templateName: 'pack of wandering monsters' });

describe('the encounter snapshot', () => {
  /** Requirement 7.2: lossless for everything the page shows. */
  it('round-trips an encounter of characters', () => {
    expect(encounterFromSnapshot(toEncounterSnapshot(people))).toEqual(people);
  });

  it('round-trips an encounter of creatures', () => {
    expect(encounterFromSnapshot(toEncounterSnapshot(beasts))).toEqual(beasts);
  });

  it('round-trips an encounter with no groups, which is an ordinary state', () => {
    const empty = { name: 'nothing', description: '', difficulty: 0, groups: [] };

    expect(encounterFromSnapshot(toEncounterSnapshot(empty))).toEqual(empty);
  });

  it('says which vocabulary type each mob is', () => {
    expect(toEncounterSnapshot(people).groups[0].mobs.every((m) => m.mobKind === 'character')).toBe(
      true,
    );
    expect(toEncounterSnapshot(beasts).groups[0].mobs.every((m) => m.mobKind === 'creature')).toBe(
      true,
    );
  });

  it('stores a species as its name and not its tables', () => {
    const mob = toEncounterSnapshot(people).groups[0].mobs[0];

    expect(typeof mob.speciesName).toBe('string');
    expect('species' in mob).toBe(false);
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toEncounterSnapshot(people))).not.toThrow();
    expect(() => structuredClone(toEncounterSnapshot(beasts))).not.toThrow();
  });

  it('keeps a name a user has changed rather than recomputing it', () => {
    const edited = toEncounterSnapshot(people);
    edited.groups[0].mobs[0].name = 'Old Tam';

    expect(encounterFromSnapshot(edited).groups[0].mobs[0].name).toBe('Old Tam');
  });

  it('does not hand out the lists it was given', () => {
    const snapshot = toEncounterSnapshot(people);
    snapshot.groups[0].tags.push('edited');
    snapshot.groups.pop();

    expect(people.groups[0].tags).not.toContain('edited');
    expect(people.groups.length).toBe(snapshot.groups.length + 1);
  });
});

describe('isEncounterCharacter', () => {
  it('tells a character from a creature by the one field only a character has', () => {
    expect(isEncounterCharacter(people.groups[0].mobs[0])).toBe(true);
    expect(isEncounterCharacter(beasts.groups[0].mobs[0])).toBe(false);
  });
});
