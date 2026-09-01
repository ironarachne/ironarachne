import { describe, expect, it } from 'vitest';

import type { UWCharacter } from './character.js';
import { rollUwCharacter } from './uw_character_roll.js';
import {
  isUnknownUwCareerName,
  isUnknownUwOriginName,
  isUnknownUwSkillName,
  toUwCharacterSnapshot,
  uwCharacterFromSnapshot,
} from './uw_character_snapshot.js';

/**
 * A generated character of a given shape, found by sweeping seeds.
 *
 * Sweeping rather than hand-building, because the point of a round-trip test is that a character the
 * generator actually produces survives, and a hand-built one only proves the fields the test author
 * remembered to set.
 */
function rollMatching(predicate: (character: UWCharacter) => boolean): UWCharacter {
  for (let seed = 0; seed < 300; seed += 1) {
    const { character } = rollUwCharacter(`roundtrip-${seed}`);
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in the sweep produced a character of that shape');
}

const character = rollMatching(() => true);

describe('the Uncharted Worlds character snapshot', () => {
  /**
   * Requirement 7.2, in the form this codec can actually claim: everything the character decided
   * survives, and the rulebook's prose comes back from the tables rather than from the payload.
   */
  it('round-trips a generated character', () => {
    const restored = uwCharacterFromSnapshot(toUwCharacterSnapshot(character));

    expect(restored.firstName).toBe(character.firstName);
    expect(restored.lastName).toBe(character.lastName);
    expect(restored.descriptors).toBe(character.descriptors);
    expect(restored.advancement).toBe(character.advancement);
    expect(restored.stats).toEqual(character.stats);
    expect(restored.assets).toEqual(character.assets);
    expect(restored.careers.map((career) => career.name)).toEqual(
      character.careers.map((career) => career.name),
    );
    expect(restored.origin.name).toBe(character.origin.name);
    expect(restored.workspace).toEqual(character.workspace);
    expect(restored.skills).toEqual(character.skills);
  });

  /** The snapshot is the fixed point: writing what was read back changes nothing. */
  it('is stable across a second trip through the codec', () => {
    const snapshot = toUwCharacterSnapshot(character);

    expect(toUwCharacterSnapshot(uwCharacterFromSnapshot(snapshot))).toEqual(snapshot);
  });

  /** Decision 3: the prose is the library's, and it is not in the payload at all. */
  it('stores a skill by name and derives what it does', () => {
    const snapshot = toUwCharacterSnapshot(character);

    expect(snapshot.skills.every((skill) => Object.keys(skill).length === 1)).toBe(true);
    expect(JSON.stringify(snapshot)).not.toContain(character.skills[0].description);
    expect(uwCharacterFromSnapshot(snapshot).skills[0].description).toBe(
      character.skills[0].description,
    );
  });

  it('stores the careers, the origin and the workspace by name too', () => {
    const snapshot = toUwCharacterSnapshot(character);

    expect(snapshot.careers.every((career) => Object.keys(career).length === 1)).toBe(true);
    expect(Object.keys(snapshot.origin)).toEqual(['name']);
    expect(Object.keys(snapshot.workspace)).toEqual(['name']);
    // And they come back whole, because the tables are still here.
    const restored = uwCharacterFromSnapshot(snapshot);
    expect(restored.careers[0].skills.length).toBeGreaterThan(0);
    expect(restored.origin.skills.length).toBeGreaterThan(0);
    expect(restored.workspace.description).not.toBe('');
  });

  it('keeps the assets in full, because they are not table rows', () => {
    const snapshot = toUwCharacterSnapshot(character);

    expect(snapshot.assets).toEqual(character.assets);
    // Attire, the class 0 asset every character starts with, carries no upgrades — so the check is
    // that upgrades survive at all, not that the first asset has any.
    expect(snapshot.assets.some((asset) => asset.upgrades.length > 0)).toBe(true);
  });

  /**
   * A row this build has dropped rebuilds as a placeholder wearing the stored name. The character
   * is still readable, which is the whole point of not quarantining them.
   */
  it('rebuilds a placeholder for a row this build no longer has', () => {
    const snapshot = toUwCharacterSnapshot(character);
    const restored = uwCharacterFromSnapshot({
      ...snapshot,
      careers: [{ name: 'Chronomancer' }],
      origin: { name: 'Somewhere Else' },
      workspace: { name: 'A Shed' },
      skills: [{ name: 'Whistling' }],
    });

    expect(restored.careers[0].name).toBe('Chronomancer');
    expect(restored.careers[0].skills).toEqual([]);
    expect(restored.origin.name).toBe('Somewhere Else');
    expect(restored.workspace.description).toBe('');
    expect(restored.skills[0]).toEqual({ name: 'Whistling', description: '' });
  });

  it('says which names this build no longer has', () => {
    expect(isUnknownUwCareerName(character.careers[0].name)).toBe(false);
    expect(isUnknownUwCareerName('Chronomancer')).toBe(true);
    expect(isUnknownUwOriginName(character.origin.name)).toBe(false);
    expect(isUnknownUwOriginName('Somewhere Else')).toBe(true);
    expect(isUnknownUwSkillName(character.skills[0].name)).toBe(false);
    expect(isUnknownUwSkillName('Whistling')).toBe(true);
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toUwCharacterSnapshot(character))).not.toThrow();
  });

  it('does not hand out the character it was given', () => {
    const snapshot = toUwCharacterSnapshot(character);
    snapshot.stats.physique = 99;
    snapshot.assets[0].name = 'Something else entirely';

    expect(character.stats.physique).not.toBe(99);
    expect(character.assets[0].name).not.toBe('Something else entirely');
  });

  /** A user's edit is authoritative: nothing on the read path recomputes it. */
  it('does not correct a stat a user has changed', () => {
    const edited = toUwCharacterSnapshot(character);
    edited.stats.mettle = 7;

    expect(uwCharacterFromSnapshot(edited).stats.mettle).toBe(7);
  });
});
