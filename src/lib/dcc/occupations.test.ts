import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as DwarfOccupations from './dwarf_occupations';
import * as ElfOccupations from './elf_occupations';
import * as HalflingOccupations from './halfling_occupations';
import * as HumanOccupations from './human_occupations';
import type { DCCCharacter, DCCOccupation } from './dcc_types';

const OCCUPATION_TABLES = [
  ['dwarf', DwarfOccupations.all, 'dwarven', 'Dwarf', 20],
  ['elf', ElfOccupations.all, 'elven', 'Elf', 30],
  ['halfling', HalflingOccupations.all, 'halfling', 'Halfling', 20],
] as const;

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
    numberOfLanguages: 0,
    ...overrides,
  };
}

const ALL_TABLES: [string, () => DCCOccupation[]][] = [
  ['dwarf', DwarfOccupations.all],
  ['elf', ElfOccupations.all],
  ['halfling', HalflingOccupations.all],
  ['human', HumanOccupations.all],
];

describe.each(ALL_TABLES)('%s occupations', (_name, all) => {
  it('returns a non-empty table', () => {
    expect(all().length).toBeGreaterThan(0);
  });

  it('names every occupation uniquely', () => {
    const names = all().map((occupation) => occupation.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every occupation a name, a positive commonality and an apply handler', () => {
    for (const occupation of all()) {
      expect(occupation.name).toBeTruthy();
      expect(occupation.commonality).toBeGreaterThan(0);
      expect(typeof occupation.apply).toBe('function');
    }
  });

  it('gives every trained weapon a full stat line', () => {
    for (const occupation of all()) {
      if (occupation.trainedWeapon === null) {
        continue;
      }

      expect(occupation.trainedWeapon.name, occupation.name).toBeTruthy();
      expect(occupation.trainedWeapon.classification, occupation.name).toBeTruthy();
      expect(occupation.trainedWeapon.damage, occupation.name).toMatch(/\d+d\d+/);
      expect(occupation.trainedWeapon.range, occupation.name).toBeTruthy();
    }
  });

  it('gives every trade good a name', () => {
    for (const occupation of all()) {
      if (occupation.tradeGoods !== null) {
        expect(occupation.tradeGoods.name, occupation.name).toBeTruthy();
      }
    }
  });

  it('returns a fresh table each call, since apply mutates what it is given', () => {
    const first = all();
    const originalName = first[0].name;
    first[0].name = 'mutated';

    expect(all()[0].name).toBe(originalName);
  });

  it('applies every occupation without throwing, returning the character', () => {
    for (const occupation of all()) {
      const character = baseCharacter();
      const result = occupation.apply(character, new RNG(`apply-${occupation.name}`));

      expect(result, occupation.name).toBe(character);
    }
  });

  it('never leaves an undefined entry in what apply pushes', () => {
    for (const occupation of all()) {
      const character = occupation.apply(baseCharacter(), new RNG('clean'));

      expect(character.specialRules, occupation.name).not.toContain(undefined);
      expect(character.languages, occupation.name).not.toContain(undefined);
    }
  });

  it('keeps speed positive after apply', () => {
    for (const occupation of all()) {
      const character = occupation.apply(baseCharacter(), new RNG('speed'));

      expect(character.speed, occupation.name).toBeGreaterThan(0);
    }
  });
});

describe.each(OCCUPATION_TABLES)(
  '%s occupations, which are demihuman',
  (_name, all, namePrefix, language, speed) => {
    it('prefixes every occupation name so the generator can tell the race', () => {
      for (const occupation of all()) {
        expect(occupation.name.toLowerCase()).toContain(namePrefix);
      }
    });

    it('teaches every character its racial language', () => {
      for (const occupation of all()) {
        const character = occupation.apply(baseCharacter(), new RNG('language'));

        expect(character.languages, occupation.name).toContain(language);
      }
    });

    it('sets the racial speed', () => {
      for (const occupation of all()) {
        const character = occupation.apply(baseCharacter(), new RNG('speed'));

        expect(character.speed, occupation.name).toBe(speed);
      }
    });

    it('grants a racial special rule', () => {
      for (const occupation of all()) {
        const character = occupation.apply(baseCharacter(), new RNG('rules'));

        expect(character.specialRules.length, occupation.name).toBeGreaterThan(0);
      }
    });
  },
);

describe('human occupations', () => {
  it('never prefixes a name with a demihuman race', () => {
    for (const occupation of HumanOccupations.all()) {
      const name = occupation.name.toLowerCase();

      expect(name, occupation.name).not.toContain('dwarven');
      expect(name, occupation.name).not.toContain('elven');
      expect(name, occupation.name).not.toContain('halfling');
    }
  });

  it('leaves speed at the human default', () => {
    for (const occupation of HumanOccupations.all()) {
      const character = occupation.apply(baseCharacter(), new RNG('speed'));

      expect(character.speed, occupation.name).toBe(30);
    }
  });

  it('is the largest table, as the core rules have it', () => {
    const humanCount = HumanOccupations.all().length;

    for (const [, all] of OCCUPATION_TABLES) {
      expect(humanCount).toBeGreaterThan(all().length);
    }
  });
});

describe('the occupation tables together', () => {
  it('name every occupation uniquely across all four tables', () => {
    const names = ALL_TABLES.flatMap(([, all]) => all().map((occupation) => occupation.name));

    expect(new Set(names).size).toBe(names.length);
  });

  it('are deterministic, returning equal tables on repeated calls', () => {
    for (const [, all] of ALL_TABLES) {
      expect(all().map((occupation) => occupation.name)).toEqual(
        all().map((occupation) => occupation.name),
      );
    }
  });
});
