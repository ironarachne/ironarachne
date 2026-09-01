import { describe, expect, it } from 'vitest';

import type { SWNCharacter } from './character.js';
import { rollSwnCharacter } from './swn_character_roll.js';
import {
  swnCharacterFromSnapshot,
  toSwnCharacterSnapshot,
  type SwnCharacterSnapshot,
} from './swn_character_snapshot.js';

/**
 * A generated character of a given shape, found by sweeping seeds.
 *
 * Sweeping rather than hand-building, because the point of a round-trip test is that a character the
 * generator actually produces survives, and a hand-built one only proves the fields the test author
 * remembered to set.
 */
function rollMatching(predicate: (character: SWNCharacter) => boolean): SWNCharacter {
  for (let seed = 0; seed < 300; seed += 1) {
    const { character } = rollSwnCharacter(`roundtrip-${seed}`);
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in the sweep produced a character of that shape');
}

const character = rollMatching(() => true);

describe('the SWN character snapshot', () => {
  /** Requirement 7.2: lossless for everything the sheet shows. */
  it('round-trips a generated character', () => {
    expect(swnCharacterFromSnapshot(toSwnCharacterSnapshot(character))).toEqual(character);
  });

  it('keeps every derived number rather than recomputing it', () => {
    const restored = swnCharacterFromSnapshot(toSwnCharacterSnapshot(character));

    expect(restored.hitPoints).toBe(character.hitPoints);
    expect(restored.armorClassEquipped).toBe(character.armorClassEquipped);
    expect(restored.armorClassUnequipped).toBe(character.armorClassUnequipped);
    expect(restored.meleeAttackBonus).toBe(character.meleeAttackBonus);
    expect(restored.rangedAttackBonus).toBe(character.rangedAttackBonus);
    expect(restored.savingThrowEvasion).toBe(character.savingThrowEvasion);
    expect(restored.savingThrowMental).toBe(character.savingThrowMental);
    expect(restored.savingThrowPhysical).toBe(character.savingThrowPhysical);
    expect(restored.effort).toBe(character.effort);
  });

  /**
   * A referee's edit survives the round trip untouched, which is the claim 4.2 actually makes: a
   * save nobody could have rolled comes back exactly as it was left.
   */
  it('does not correct a number a user has changed', () => {
    const edited = { ...toSwnCharacterSnapshot(character), savingThrowPhysical: 3 };

    expect(swnCharacterFromSnapshot(edited).savingThrowPhysical).toBe(3);
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toSwnCharacterSnapshot(character))).not.toThrow();
  });

  it('does not hand out the character it was given', () => {
    const snapshot = toSwnCharacterSnapshot(character);
    snapshot.credits = 9_999;

    expect(character.credits).not.toBe(9_999);
  });

  /** A psychic character's picks are stored, because the prose in `abilities` is not a decision. */
  it('keeps the psychic picks a character was rolled with', () => {
    const psychic = rollMatching((rolled) => rolled.psychicPicks.length > 0);
    const restored = swnCharacterFromSnapshot(toSwnCharacterSnapshot(psychic));

    expect(restored.psychicPicks).toEqual(psychic.psychicPicks);
    for (const pick of restored.psychicPicks) {
      expect(pick.disciplineName).not.toBe('');
    }
  });

  /** A payload written before the field existed reads as a character with no recorded picks. */
  it('reads a payload with no picks at all', () => {
    const { psychicPicks: _dropped, ...older } = toSwnCharacterSnapshot(character);

    expect(swnCharacterFromSnapshot(older as SwnCharacterSnapshot).psychicPicks).toEqual([]);
  });
});
