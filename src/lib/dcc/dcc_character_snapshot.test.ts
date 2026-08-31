import { describe, expect, it } from 'vitest';

import {
  dccCharacterFromSnapshot,
  isUnknownDccLuckyRollName,
  isUnknownDccOccupationName,
  toDccCharacterSnapshot,
} from './dcc_character_snapshot.js';
import { rollDccCharacter } from './dcc_character_roll.js';
import type { DCCCharacter } from './dcc_types.js';

/**
 * A generated character of a given shape, found by sweeping seeds.
 *
 * Sweeping rather than hand-building, because the point of a round-trip test is that a character the
 * generator actually produces survives, and a hand-built one only proves the fields the test author
 * remembered to set.
 */
function rollMatching(
  predicate: (character: DCCCharacter) => boolean,
  config: Parameters<typeof rollDccCharacter>[1] = {},
): DCCCharacter {
  for (let seed = 0; seed < 300; seed += 1) {
    const { character } = rollDccCharacter(`roundtrip-${seed}`, config);
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in the sweep produced a character of that shape');
}

const character = rollMatching(() => true);

describe('the DCC character snapshot', () => {
  /** Requirement 7.2: lossless for everything the sheet shows. */
  it('round-trips a generated character', () => {
    const restored = dccCharacterFromSnapshot(toDccCharacterSnapshot(character));

    // Compared whole, with the two handlers set aside — they are functions, and functions are the
    // one thing a snapshot is allowed to lose.
    expect({ ...restored, occupation: null, luckyRoll: null }).toEqual({
      ...character,
      occupation: null,
      luckyRoll: null,
    });
  });

  it('keeps every derived number rather than recomputing it', () => {
    const restored = dccCharacterFromSnapshot(toDccCharacterSnapshot(character));

    expect(restored.fortitudeSave).toBe(character.fortitudeSave);
    expect(restored.reflexSave).toBe(character.reflexSave);
    expect(restored.willpowerSave).toBe(character.willpowerSave);
    expect(restored.attackModifier).toBe(character.attackModifier);
    expect(restored.armorClass).toBe(character.armorClass);
    expect(restored.spellsKnown).toBe(character.spellsKnown);
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toDccCharacterSnapshot(character))).not.toThrow();
  });

  /**
   * The reason the row travels whole rather than as a name. `randomLuckyRoll` overwrites the drawn
   * row's modifier with the character's own luck modifier, so rebuilding from the table would give
   * every saved character a lucky sign reading `+0`.
   */
  it('keeps the lucky sign’s per-character modifier', () => {
    const lucky = rollMatching((rolled) => rolled.luck.modifier !== 0);
    const restored = dccCharacterFromSnapshot(toDccCharacterSnapshot(lucky));

    expect(restored.luckyRoll.modifier).toBe(lucky.luckyRoll.modifier);
    expect(restored.luckyRoll.modifier).toBe(lucky.luck.modifier);
  });

  /**
   * The other reason. The human farmer's own handler rewrites `occupation.name` to the crop it
   * rolled, so a `potato farmer` matches no row in any table — and resolving by name alone would
   * lose the pitchfork and the hen the table gave them.
   */
  it('keeps an occupation whose own handler renamed it, trained weapon and all', () => {
    const farmer = rollMatching((rolled) => rolled.occupation.name.endsWith(' farmer'), {
      allowedOccupations: ['human'],
    });
    const restored = dccCharacterFromSnapshot(toDccCharacterSnapshot(farmer));

    expect(isUnknownDccOccupationName(farmer.occupation.name)).toBe(true);
    expect(restored.occupation.name).toBe(farmer.occupation.name);
    expect(restored.occupation.trainedWeapon).toEqual(farmer.occupation.trainedWeapon);
    expect(restored.occupation.tradeGoods).toEqual(farmer.occupation.tradeGoods);
  });

  it('puts a handler back on a row the tables still have', () => {
    const known = rollMatching((rolled) => !isUnknownDccOccupationName(rolled.occupation.name));
    const restored = dccCharacterFromSnapshot(toDccCharacterSnapshot(known));

    expect(typeof restored.occupation.apply).toBe('function');
    expect(typeof restored.luckyRoll.apply).toBe('function');
  });

  /**
   * Requirement 3.3: a name this build no longer has is not a corrupt record. The handler comes back
   * inert rather than missing, so nothing that reads a saved character has to check for it.
   */
  it('gives an unknown occupation an inert handler rather than throwing', () => {
    const snapshot = toDccCharacterSnapshot(character);
    const restored = dccCharacterFromSnapshot({
      ...snapshot,
      occupation: { ...snapshot.occupation, name: 'lamplighter-royal' },
      luckyRoll: { ...snapshot.luckyRoll, name: 'Struck by a passing comet' },
    });

    expect(isUnknownDccOccupationName('lamplighter-royal')).toBe(true);
    expect(isUnknownDccLuckyRollName('Struck by a passing comet')).toBe(true);
    // `apply` is a domain method on the row, not `Function.prototype.apply`.
    // eslint-disable-next-line prefer-spread
    expect(restored.occupation.apply(restored, undefined as never)).toBe(restored);
    expect(restored.luckyRoll.apply(restored)).toBe(restored);
  });

  it('reports a name the tables do have as known', () => {
    expect(isUnknownDccLuckyRollName(character.luckyRoll.name)).toBe(false);
  });
});
