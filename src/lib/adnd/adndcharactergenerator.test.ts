import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { createAdndCharacter, type default as ADNDCharacter } from './adndcharacter.js';
import { generateCharacter } from './adndcharactergenerator.js';
import {
  applyAdndAbilityDerivedFields,
  applyAdndPriestFundsCapIfNeeded,
  applyAdndSavingThrows,
  finalizeAdndCharacterDerivedStats,
  getAdndLevel1HpBounds,
  getPossibleArmor,
  getPossibleWeapons,
  recalculateAdndArmorClass,
  rollAdndLevel1Hp,
  rollAdndStartingCopper,
} from './adndcharactergenerator.js';
import { getDefaultConfig } from './adndcharactergeneratorconfig.js';
import cleric from './classes/cleric.js';
import fighter from './classes/fighter.js';
import mage from './classes/mage.js';
import thief from './classes/thief.js';
import dwarf from './races/dwarf.js';
import human from './races/human.js';
import * as Equipment from './equipment.js';

function baseCharacter(): ADNDCharacter {
  const c = createAdndCharacter();
  c.race = human;
  c.class = fighter;
  c.strength = 12;
  c.exceptionalStrength = -1;
  c.dexterity = 12;
  c.constitution = 12;
  c.intelligence = 12;
  c.wisdom = 12;
  c.charisma = 12;
  c.currency = 10_000;
  return c;
}

describe('generateCharacter', () => {
  it('generates a complete level-1 character from a seeded config', () => {
    const rng = new RNG('adnd-gen-full-character');
    const character = generateCharacter(getDefaultConfig(rng));

    expect(character.race).toBeDefined();
    expect(character.class).toBeDefined();
    expect(character.hp).toBeGreaterThanOrEqual(1);
    expect(character.alignment).toBeTruthy();
    expect(character.currency).toBeGreaterThanOrEqual(0);
    expect(character.poisonSavingThrow).toBeGreaterThan(0);
    expect(character.weightAllowance).toBeGreaterThan(0);
  });
});

describe('applyAdndAbilityDerivedFields', () => {
  it('fills warrior exceptional-strength derived stats', () => {
    const c = baseCharacter();
    c.strength = 18;
    c.exceptionalStrength = 100;

    applyAdndAbilityDerivedFields(c);

    expect(c.bendBarsLiftGates).toBe(40);
    expect(c.damageAdjustment).toBe('+6');
    expect(c.weightAllowance).toBe(335);
    expect(c.warriorHitPointAdjustment).toBe(c.hitPointAdjustment);
  });

  it('fills high wisdom and intelligence priest/mage fields', () => {
    const c = baseCharacter();
    c.class = cleric;
    c.wisdom = 25;
    c.intelligence = 25;

    applyAdndAbilityDerivedFields(c);

    expect(c.bonusSpells.length).toBeGreaterThan(0);
    expect(c.spellImmunity).toContain('mass charm');
    expect(c.spellLevel).toBe(9);
    expect(c.chanceOfSpellFailure).toBe(0);
  });

  it('maps exceptional strength 18/91+ to high open-door values', () => {
    const c = baseCharacter();
    c.strength = 18;
    c.exceptionalStrength = 91;

    applyAdndAbilityDerivedFields(c);

    expect(c.damageAdjustment).toBe('+5');
    expect(c.openDoors).toBe('15 (3)');
  });

  it('maps constitution 24 to fast regeneration', () => {
    const c = baseCharacter();
    c.constitution = 24;

    applyAdndAbilityDerivedFields(c);

    expect(c.regeneration).toBe('1/2 turns');
    expect(c.resurrectionSurvival).toBe(100);
  });

  it('fills low ability score table entries', () => {
    const c = baseCharacter();
    c.strength = 3;
    c.dexterity = 3;
    c.constitution = 3;
    c.intelligence = 3;
    c.wisdom = 3;
    c.charisma = 3;

    applyAdndAbilityDerivedFields(c);

    expect(c.bendBarsLiftGates).toBe(0);
    expect(c.damageAdjustment).toBe('-1');
    expect(c.reactionAdjustment).toBe(-3);
    expect(c.regeneration).toBe('nil');
    expect(c.spellLevel).toBe(-1);
  });
});

describe('applyAdndSavingThrows', () => {
  it('applies dwarf constitution bonuses to relevant saves', () => {
    const c = baseCharacter();
    c.race = dwarf;
    c.class = fighter;
    c.constitution = 18;

    applyAdndAbilityDerivedFields(c);
    applyAdndSavingThrows(c);

    expect(c.poisonSavingThrow).toBe(14 + 5);
    expect(c.rodSavingThrow).toBe(16 + 5);
    expect(c.spellSavingThrow).toBe(17 + 5);
  });

  it('uses wizard base saving throws without racial bonuses for humans', () => {
    const c = baseCharacter();
    c.class = mage;

    applyAdndAbilityDerivedFields(c);
    applyAdndSavingThrows(c);

    expect(c.poisonSavingThrow).toBe(14);
    expect(c.rodSavingThrow).toBe(11);
    expect(c.spellSavingThrow).toBe(12);
  });
});

describe('finalizeAdndCharacterDerivedStats', () => {
  it('returns the same character with derived fields populated', () => {
    const c = baseCharacter();
    const out = finalizeAdndCharacterDerivedStats(c);

    expect(out).toBe(c);
    expect(c.thaco).toBe(20);
    expect(c.breathSavingThrow).toBeGreaterThan(0);
  });
});

describe('getPossibleArmor', () => {
  it('filters by class allowance and remaining funds', () => {
    const c = baseCharacter();
    c.class = fighter;
    c.currency = 25_000;
    const armor = [
      {
        name: 'banded mail',
        ac: 4,
        weight: 35,
        cost: 200 * 100,
      },
      {
        name: 'plate mail',
        ac: 3,
        weight: 45,
        cost: 600 * 100,
      },
    ];

    expect(getPossibleArmor(c, armor).map((a) => a.name)).toEqual(['banded mail']);
  });
});

describe('getPossibleWeapons', () => {
  it('includes bludgeoning weapons for priests and respects cost', () => {
    const c = baseCharacter();
    c.class = cleric;
    c.currency = 50;
    const weapons = [
      {
        name: 'club',
        cost: 1,
        weight: 3,
        size: 'medium',
        damageType: 'bludgeoning',
        speedFactor: 2,
        damageSM: '1d6',
        damageL: '1d3',
        category: 'club',
        usesAmmo: false,
      },
      {
        name: 'long sword',
        cost: 15 * 100,
        weight: 4,
        size: 'medium',
        damageType: 'slashing',
        speedFactor: 5,
        damageSM: '1d8',
        damageL: '1d12',
        category: 'sword',
        usesAmmo: false,
      },
    ];

    expect(getPossibleWeapons(c, weapons).map((w) => w.name)).toEqual(['club']);
  });

  it('allows any weapon for fighters with enough currency', () => {
    const c = baseCharacter();
    c.class = fighter;
    c.currency = 10_000;
    const weapons = Equipment.getWeapons();

    expect(getPossibleWeapons(c, weapons).length).toBeGreaterThan(0);
  });
});

describe('getAdndLevel1HpBounds', () => {
  it('uses warrior constitution adjustment in the upper bound', () => {
    const c = baseCharacter();
    c.class = fighter;
    c.constitution = 18;

    expect(getAdndLevel1HpBounds(c)).toEqual({ min: 1, max: 14 });
  });
});

describe('rollAdndStartingCopper', () => {
  it('matches rogue fund dice range', () => {
    const rng = new RNG('rogue-funds');
    const cp = rollAdndStartingCopper(thief, rng);
    expect(cp).toBeGreaterThanOrEqual(2 * 10 * 100);
    expect(cp).toBeLessThanOrEqual(12 * 10 * 100);
  });
});

describe('rollAdndLevel1Hp', () => {
  it('never returns less than 1', () => {
    const c = baseCharacter();
    c.class = mage;
    c.constitution = 3;
    const rng = new RNG('hp-floor');

    expect(rollAdndLevel1Hp(c, rng)).toBeGreaterThanOrEqual(1);
  });
});

describe('applyAdndPriestFundsCapIfNeeded', () => {
  it('caps priest funds above 300 cp', () => {
    const c = baseCharacter();
    c.class = cleric;
    c.currency = 5000;
    const rng = new RNG('priest-cap');

    applyAdndPriestFundsCapIfNeeded(c, rng);

    expect(c.currency).toBeGreaterThanOrEqual(100);
    expect(c.currency).toBeLessThanOrEqual(300);
  });

  it('leaves non-priest funds unchanged', () => {
    const c = baseCharacter();
    c.class = fighter;
    c.currency = 5000;
    const rng = new RNG('priest-cap-fighter');

    applyAdndPriestFundsCapIfNeeded(c, rng);

    expect(c.currency).toBe(5000);
  });
});

describe('recalculateAdndArmorClass', () => {
  it('starts at 10 and adds equipped armor values', () => {
    const c = baseCharacter();
    c.armor = [
      {
        name: 'leather',
        ac: 2,
        weight: 15,
        cost: 5 * 100,
      },
      {
        name: 'shield',
        ac: 1,
        weight: 5,
        cost: 10 * 100,
      },
    ];

    recalculateAdndArmorClass(c);

    expect(c.ac).toBe(13);
  });
});

describe('the shared weapon table', () => {
  /**
   * `getWeapons` hands out a shared constant rather than rebuilding the table per call, so a
   * character that kept a reference into it would let any later edit to its equipment write back
   * into the table for every other character. The generator copies the weapon it picks.
   */
  it('hands out the one shared table rather than rebuilding it', () => {
    expect(Equipment.getWeapons()).toBe(Equipment.getWeapons());
  });

  it('is not corrupted by generating many characters', () => {
    const before = Equipment.getWeapons().map((weapon) => `${weapon.name}|${weapon.cost}`);

    for (let index = 0; index < 40; index++) {
      const config = getDefaultConfig(new RNG(`weapon-table-${index}`));
      generateCharacter(config);
    }

    expect(Equipment.getWeapons().map((weapon) => `${weapon.name}|${weapon.cost}`)).toEqual(before);
  });

  it('gives each character its own weapon objects, not the shared rows', () => {
    const sharedRows = new Set<unknown>(Equipment.getWeapons());

    for (let index = 0; index < 40; index++) {
      const config = getDefaultConfig(new RNG(`weapon-own-${index}`));
      for (const weapon of generateCharacter(config).weapons) {
        expect(sharedRows.has(weapon)).toBe(false);
      }
    }
  });
});
