import { expect, describe, it } from 'vitest';
import { all } from './lucky_rolls';
import type { DCCCharacter, DCCLuckyRoll } from './dcc_types';

function baseCharacter(overrides: Partial<DCCCharacter> = {}): DCCCharacter {
  return {
    firstName: 'Test',
    lastName: 'Subject',
    age: 18,
    gender: 'female',
    level: 0,
    xp: 0,
    hp: 4,
    speed: 30,
    alignment: 'Neutrality',
    occupation: {
      name: '',
      trainedWeapon: null,
      tradeGoods: null,
      commonality: 0,
      apply: (character) => character,
    },
    strength: { value: 10, modifier: 0 },
    agility: { value: 10, modifier: 0 },
    stamina: { value: 10, modifier: 0 },
    personality: { value: 10, modifier: 0 },
    intelligence: { value: 10, modifier: 0 },
    luck: { value: 10, modifier: 0 },
    fortitudeSave: 0,
    reflexSave: 0,
    willpowerSave: 0,
    baseSave: 0,
    luckyRoll: { name: '', description: '', modifier: 0, apply: (character) => character },
    spellsKnown: 0,
    wizardMaxSpellLevel: 0,
    clericMaxSpellLevel: 0,
    attackModifier: 0,
    specialRules: [],
    armorClass: 10,
    currency: { cp: 0, sp: 0, gp: 0, ep: 0, pp: 0 },
    equipment: [],
    weapons: [],
    languages: ['Common'],
    numberOfLanguages: 3,
    ...overrides,
  };
}

/** `apply` reads `this.modifier`, so it must be called as a method of its own roll. */
function applyWithModifier(roll: DCCLuckyRoll, modifier: number, character: DCCCharacter) {
  roll.modifier = modifier;
  return roll.apply(character);
}

const rolls = all();
const realRolls = rolls.slice(1);

/**
 * "Harsh winter" is the one roll that records no special rule — it adjusts `attackModifier`
 * directly and says nothing. Every other roll writes a rule, so the shared cases below cover
 * the other 29 and "Harsh winter" is checked on its own further down.
 */
const RULE_LESS_ROLL = 'Harsh winter';
const ruleWritingRolls = realRolls
  .filter((roll) => roll.name !== RULE_LESS_ROLL)
  .map((roll) => [roll.name, roll] as const);

describe('all', () => {
  it('returns 31 entries, so a 1d30 roll indexes the table directly', () => {
    expect(rolls).toHaveLength(31);
  });

  it('reserves index 0 as an empty placeholder that 1d30 never selects', () => {
    expect(rolls[0].name).toBe('');
    expect(rolls[0].description).toBe('');
  });

  it('gives every real roll a name and a description', () => {
    for (const roll of realRolls) {
      expect(roll.name).toBeTruthy();
      expect(roll.description).toBeTruthy();
    }
  });

  it('names every real roll uniquely', () => {
    const names = realRolls.map((roll) => roll.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('starts every roll at a zero modifier, for the generator to overwrite', () => {
    for (const roll of all()) {
      expect(roll.modifier, roll.name).toBe(0);
    }
  });

  it('returns a fresh table each call, since the generator assigns a modifier onto it', () => {
    const first = all();
    first[1].modifier = 99;

    expect(all()[1].modifier).toBe(0);
  });
});

describe('the placeholder at index 0', () => {
  it('returns the character untouched', () => {
    const character = baseCharacter();

    expect(rolls[0].apply(character)).toBe(character);
    expect(character.specialRules).toEqual([]);
  });
});

describe.each(ruleWritingRolls)('%s', (_name, roll) => {
  it('returns the same character it was given', () => {
    const character = baseCharacter();

    expect(applyWithModifier(roll, 1, character)).toBe(character);
  });

  it('records exactly one special rule, opening with its description', () => {
    const character = applyWithModifier(roll, 1, baseCharacter());

    expect(character.specialRules).toHaveLength(1);
    expect(character.specialRules[0].startsWith(`${roll.description}: `)).toBe(true);
  });

  // The sign is checked on the part after the description, because several descriptions
  // contain a "+" of their own — "Speed (each +1/-1 = +5'/-5' speed)", for one.
  it('writes a positive modifier with a plus sign', () => {
    const character = applyWithModifier(roll, 2, baseCharacter());

    expect(character.specialRules[0]).toContain(`${roll.description}: +2`);
  });

  it('writes a zero modifier with a plus sign', () => {
    const character = applyWithModifier(roll, 0, baseCharacter());

    expect(character.specialRules[0]).toContain(`${roll.description}: +0`);
  });

  it('writes a negative modifier without a plus sign', () => {
    const character = applyWithModifier(roll, -2, baseCharacter());

    expect(character.specialRules[0]).toContain(`${roll.description}: -2`);
  });

  it('never leaves an undefined fragment in the rule', () => {
    const character = applyWithModifier(roll, -1, baseCharacter());

    expect(character.specialRules[0]).not.toContain('undefined');
  });
});

describe(RULE_LESS_ROLL, () => {
  const harshWinter = () => {
    const roll = all().find((candidate) => candidate.name === RULE_LESS_ROLL);
    if (!roll) {
      throw new Error(`no lucky roll named ${RULE_LESS_ROLL}`);
    }
    return roll;
  };

  it('returns the same character it was given', () => {
    const character = baseCharacter();

    expect(applyWithModifier(harshWinter(), 1, character)).toBe(character);
  });

  it('shifts the attack modifier by its own modifier', () => {
    expect(applyWithModifier(harshWinter(), 3, baseCharacter()).attackModifier).toBe(3);
    expect(applyWithModifier(harshWinter(), -2, baseCharacter()).attackModifier).toBe(-2);
  });

  // Unlike all 29 others, this one records nothing, so the adjustment is invisible on the
  // sheet. Captured here as current behaviour rather than asserted as correct.
  it('records no special rule, alone among the rolls', () => {
    expect(applyWithModifier(harshWinter(), 3, baseCharacter()).specialRules).toEqual([]);
  });
});

describe('rolls that change a characters numbers', () => {
  function rollNamed(name: string): DCCLuckyRoll {
    const roll = all().find((candidate) => candidate.name === name);
    if (!roll) {
      throw new Error(`no lucky roll named ${name}`);
    }
    return roll;
  }

  it('Lucky sign shifts every saving throw', () => {
    const character = applyWithModifier(rollNamed('Lucky sign'), 2, baseCharacter());

    expect(character.baseSave).toBe(2);
    expect(character.fortitudeSave).toBe(2);
    expect(character.reflexSave).toBe(2);
    expect(character.willpowerSave).toBe(2);
  });

  it('Bountiful harvest shifts hit points', () => {
    expect(applyWithModifier(rollNamed('Bountiful harvest'), 2, baseCharacter()).hp).toBe(6);
  });

  it('Wild child shifts speed by five feet per point', () => {
    expect(applyWithModifier(rollNamed('Wild child'), 2, baseCharacter()).speed).toBe(40);
    expect(applyWithModifier(rollNamed('Wild child'), -1, baseCharacter()).speed).toBe(25);
  });

  it('Birdsong shifts the number of languages, never below zero', () => {
    expect(applyWithModifier(rollNamed('Birdsong'), 2, baseCharacter()).numberOfLanguages).toBe(5);
    expect(applyWithModifier(rollNamed('Birdsong'), -9, baseCharacter()).numberOfLanguages).toBe(0);
  });

  it('marks the rolls it has already applied as taken into account', () => {
    for (const name of ['Lucky sign', 'Bountiful harvest', 'Wild child', 'Birdsong']) {
      const character = applyWithModifier(rollNamed(name), 1, baseCharacter());

      expect(character.specialRules[0], name).toContain('(taken into account)');
    }
  });

  it('leaves the numbers alone for rolls that only record a rule', () => {
    const character = applyWithModifier(rollNamed('The bull'), 3, baseCharacter());

    expect(character.attackModifier).toBe(0);
    expect(character.hp).toBe(4);
    expect(character.speed).toBe(30);
    expect(character.baseSave).toBe(0);
  });
});
