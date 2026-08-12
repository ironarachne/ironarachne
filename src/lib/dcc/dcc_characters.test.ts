import { expect, describe, it } from 'vitest';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { stripFunctionValuesDeep } from '$lib/persistent_save/strip_function_values_deep';
import { RNG } from '@ironarachne/rng';
import {
  generateRandomDCCCharacter,
  getAttributeModifier,
  getDefaultDCCCharacterGeneratorConfig,
  getMaxSpellLevel,
  getSpellsKnown,
} from './dcc_characters';
import * as DwarfOccupations from './dwarf_occupations';
import * as ElfOccupations from './elf_occupations';
import * as HalflingOccupations from './halfling_occupations';
import * as HumanOccupations from './human_occupations';
import * as LuckyRolls from './lucky_rolls';

function generate(seed: string, allowedOccupations?: string[]) {
  const config = getDefaultDCCCharacterGeneratorConfig(seed);
  if (allowedOccupations) {
    config.allowedOccupations = allowedOccupations;
  }
  return generateRandomDCCCharacter(seed, config);
}

const ATTRIBUTES = [
  'strength',
  'agility',
  'stamina',
  'personality',
  'intelligence',
  'luck',
] as const;

describe('getAttributeModifier', () => {
  it('gives a zero modifier for an average score', () => {
    expect(getAttributeModifier(10)).toBe(0);
    expect(getAttributeModifier(11)).toBe(0);
  });

  it('gives negative modifiers below average', () => {
    expect(getAttributeModifier(3)).toBe(-4);
    expect(getAttributeModifier(6)).toBe(-2);
    expect(getAttributeModifier(8)).toBe(-1);
    expect(getAttributeModifier(9)).toBe(-1);
  });

  it('gives positive modifiers above average', () => {
    expect(getAttributeModifier(12)).toBe(1);
    expect(getAttributeModifier(14)).toBe(2);
    expect(getAttributeModifier(16)).toBe(3);
    expect(getAttributeModifier(18)).toBe(4);
  });

  it('never decreases as the score rises', () => {
    for (let score = 3; score < 18; score++) {
      expect(getAttributeModifier(score + 1)).toBeGreaterThanOrEqual(getAttributeModifier(score));
    }
  });

  it('spans -4 to +4 across the 3d6 range, as the core rules have it', () => {
    expect(getAttributeModifier(3)).toBe(-4);
    expect(getAttributeModifier(18)).toBe(4);
  });
});

describe('getSpellsKnown', () => {
  it('never decreases as intelligence rises', () => {
    for (let score = 0; score < 18; score++) {
      expect(getSpellsKnown(score + 1), `${score} to ${score + 1}`).toBeGreaterThanOrEqual(
        getSpellsKnown(score),
      );
    }
  });

  it('bottoms out at -9 for the scores that cannot cast at all', () => {
    expect(getSpellsKnown(0)).toBe(-9);
    expect(getSpellsKnown(3)).toBe(-9);
  });

  it('improves through the middle of the range', () => {
    expect(getSpellsKnown(4)).toBe(-2);
    expect(getSpellsKnown(6)).toBe(-1);
    expect(getSpellsKnown(10)).toBe(0);
    expect(getSpellsKnown(14)).toBe(1);
    expect(getSpellsKnown(17)).toBe(2);
  });

  it('pins the whole table, entry by entry', () => {
    // Spelled out because a single missing comma once shifted every entry from 6 upwards,
    // and a table that is merely monotonic would not have caught the ones that still rose.
    const expected = [-9, -9, -9, -9, -2, -2, -1, -1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2];

    expect(expected.map((_, score) => getSpellsKnown(score))).toEqual(expected);
  });

  it('covers the whole 3d6 range without falling through to the cap', () => {
    expect(getSpellsKnown(18)).toBe(2);
  });

  it('caps at 2 above the table', () => {
    expect(getSpellsKnown(19)).toBe(2);
    expect(getSpellsKnown(100)).toBe(2);
  });

  it('returns -9 for a negative score', () => {
    expect(getSpellsKnown(-1)).toBe(-9);
  });
});

describe('getMaxSpellLevel', () => {
  it('never decreases as the score rises', () => {
    for (let score = 0; score < 18; score++) {
      expect(getMaxSpellLevel(score + 1), `${score} to ${score + 1}`).toBeGreaterThanOrEqual(
        getMaxSpellLevel(score),
      );
    }
  });

  it('starts at zero and reaches five', () => {
    expect(getMaxSpellLevel(0)).toBe(0);
    expect(getMaxSpellLevel(18)).toBe(5);
  });

  it('caps at 5 above the table', () => {
    expect(getMaxSpellLevel(19)).toBe(5);
  });

  it('returns 0 for a negative score', () => {
    expect(getMaxSpellLevel(-1)).toBe(0);
  });
});

describe('getDefaultDCCCharacterGeneratorConfig', () => {
  it('allows all four occupation tables', () => {
    expect(getDefaultDCCCharacterGeneratorConfig('seed').allowedOccupations).toEqual([
      'dwarf',
      'elf',
      'halfling',
      'human',
    ]);
  });

  it('supplies a male, female and family name generator', () => {
    const config = getDefaultDCCCharacterGeneratorConfig('seed');

    expect(config.nameGeneratorMale.generate(1)[0]).toBeTruthy();
    expect(config.nameGeneratorFemale.generate(1)[0]).toBeTruthy();
    expect(config.nameGeneratorFamily.generate(1)[0]).toBeTruthy();
  });

  it('is deterministic for a given seed', () => {
    expect(getDefaultDCCCharacterGeneratorConfig('same').nameGeneratorMale.generate(3)).toEqual(
      getDefaultDCCCharacterGeneratorConfig('same').nameGeneratorMale.generate(3),
    );
  });
});

describe('generateRandomDCCCharacter', () => {
  // A character carries `apply` closures on its occupation and lucky roll, and each call builds
  // fresh ones, so the comparison is on the data the closures leave behind.
  it('is deterministic for a given seed', () => {
    expect(stripFunctionValuesDeep(generate('zero-level'))).toEqual(
      stripFunctionValuesDeep(generate('zero-level')),
    );
  });

  it('produces different characters for different seeds', () => {
    const names = new Set(
      Array.from({ length: 10 }, (_, index) => {
        const character = generate(`vary-${index}`);
        return `${character.firstName} ${character.lastName} ${character.occupation.name}`;
      }),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('rolls every attribute inside the 3d6 range', () => {
    for (let index = 0; index < 20; index++) {
      const character = generate(`attributes-${index}`);

      for (const attribute of ATTRIBUTES) {
        expect(character[attribute].value, attribute).toBeGreaterThanOrEqual(3);
        expect(character[attribute].value, attribute).toBeLessThanOrEqual(18);
      }
    }
  });

  it('derives each attribute modifier from its own value', () => {
    for (let index = 0; index < 10; index++) {
      const character = generate(`modifiers-${index}`);

      for (const attribute of ATTRIBUTES) {
        expect(character[attribute].modifier, attribute).toBe(
          getAttributeModifier(character[attribute].value),
        );
      }
    }
  });

  it('starts every character at level zero with no experience', () => {
    const character = generate('fresh');

    expect(character.level).toBe(0);
    expect(character.xp).toBe(0);
  });

  it('never leaves a character on less than one hit point', () => {
    for (let index = 0; index < 40; index++) {
      expect(generate(`hp-${index}`).hp, `hp-${index}`).toBeGreaterThanOrEqual(1);
    }
  });

  it('gives every character a first and last name', () => {
    for (let index = 0; index < 10; index++) {
      const character = generate(`named-${index}`);

      expect(character.firstName).toBeTruthy();
      expect(character.lastName).toBeTruthy();
    }
  });

  it('gives every character a gender, an alignment and a starting age', () => {
    for (let index = 0; index < 10; index++) {
      const character = generate(`bio-${index}`);

      expect(['male', 'female']).toContain(character.gender);
      expect(['Law', 'Chaos', 'Neutrality']).toContain(character.alignment);
      expect(character.age).toBeGreaterThanOrEqual(16);
      expect(character.age).toBeLessThanOrEqual(22);
    }
  });

  /**
   * Four lucky rolls adjust saves: "Lucky sign" shifts all of them together via `baseSave`,
   * while "Struck by lightning", "Lived through famine" and "Resisted temptation" each move a
   * single one. Those are checked in the lucky roll suite; here the derivation is checked on
   * characters whose roll leaves saves alone.
   */
  it('derives each saving throw from its matching attribute modifier', () => {
    const saveAffecting = new Set([
      'Lucky sign',
      'Struck by lightning',
      'Lived through famine',
      'Resisted temptation',
    ]);
    let checked = 0;

    for (let index = 0; index < 40; index++) {
      const character = generate(`saves-${index}`);
      if (saveAffecting.has(character.luckyRoll.name)) {
        continue;
      }

      expect(character.baseSave).toBe(0);
      expect(character.fortitudeSave).toBe(character.stamina.modifier);
      expect(character.willpowerSave).toBe(character.personality.modifier);
      expect(character.reflexSave).toBe(character.agility.modifier);
      checked++;
    }

    expect(checked).toBeGreaterThan(0);
  });

  it('gives a lucky roll with the characters own luck modifier', () => {
    for (let index = 0; index < 10; index++) {
      const character = generate(`luck-${index}`);

      expect(character.luckyRoll.name).toBeTruthy();
      expect(character.luckyRoll.modifier).toBe(character.luck.modifier);
    }
  });

  it('never assigns the empty placeholder lucky roll', () => {
    for (let index = 0; index < 40; index++) {
      expect(generate(`placeholder-${index}`).luckyRoll.name).not.toBe('');
    }
  });

  it('gives every character starting copper', () => {
    for (let index = 0; index < 10; index++) {
      const character = generate(`money-${index}`);

      expect(character.currency.cp).toBeGreaterThanOrEqual(5);
      expect(character.currency.cp).toBeLessThanOrEqual(60);
    }
  });

  it('always knows Common', () => {
    for (let index = 0; index < 20; index++) {
      expect(generate(`common-${index}`).languages).toContain('Common');
    }
  });

  it('never lists a language twice', () => {
    for (let index = 0; index < 30; index++) {
      const languages = generate(`languages-${index}`).languages;

      expect(new Set(languages).size, `languages-${index}`).toBe(languages.length);
    }
  });

  it('gives a character with no bonus languages only its racial ones', () => {
    for (let index = 0; index < 30; index++) {
      const character = generate(`bonus-${index}`);

      if (
        character.numberOfLanguages === 0 &&
        !/dwarven|elven|halfling/.test(character.occupation.name)
      ) {
        expect(character.languages).toEqual(['Common']);
      }
    }
  });

  it('carries the occupation trained weapon as both equipment and a weapon', () => {
    for (let index = 0; index < 20; index++) {
      const character = generate(`weapon-${index}`);
      const trained = character.occupation.trainedWeapon;

      if (trained) {
        expect(character.weapons, character.occupation.name).toContain(trained);
        expect(character.equipment, character.occupation.name).toContain(trained);
      }
    }
  });

  it('carries the occupation trade goods as equipment', () => {
    for (let index = 0; index < 20; index++) {
      const character = generate(`goods-${index}`);
      const goods = character.occupation.tradeGoods;

      if (goods) {
        expect(character.equipment, character.occupation.name).toContain(goods);
      }
    }
  });

  it('always adds one random piece of equipment beyond the occupation kit', () => {
    for (let index = 0; index < 20; index++) {
      const character = generate(`kit-${index}`);
      const fromOccupation = [
        character.occupation.trainedWeapon,
        character.occupation.tradeGoods,
      ].filter(Boolean).length;

      expect(character.equipment.length).toBe(fromOccupation + 1);
    }
  });

  it('honours a config narrowed to a single occupation table', () => {
    const dwarfNames = new Set(DwarfOccupations.all().map((occupation) => occupation.name));

    for (let index = 0; index < 10; index++) {
      expect(dwarfNames).toContain(generate(`dwarf-${index}`, ['dwarf']).occupation.name);
    }
  });

  it('draws from every allowed table across enough seeds', () => {
    const tables = {
      dwarf: new Set(DwarfOccupations.all().map((occupation) => occupation.name)),
      elf: new Set(ElfOccupations.all().map((occupation) => occupation.name)),
      halfling: new Set(HalflingOccupations.all().map((occupation) => occupation.name)),
      human: new Set(HumanOccupations.all().map((occupation) => occupation.name)),
    };
    const seen = new Set<string>();

    for (let index = 0; index < 120; index++) {
      const name = generate(`table-${index}`).occupation.name;
      for (const [table, names] of Object.entries(tables)) {
        if (names.has(name)) {
          seen.add(table);
        }
      }
    }

    expect(seen.size).toBeGreaterThan(1);
  });

  it('gives dwarven characters the dwarf language and speed', () => {
    for (let index = 0; index < 10; index++) {
      const character = generate(`dwarven-${index}`, ['dwarf']);

      expect(character.languages).toContain('Dwarf');
      expect(character.speed).toBe(20);
    }
  });

  it('draws bonus languages from the racial table', () => {
    for (let index = 0; index < 20; index++) {
      const character = generate(`racial-${index}`, ['halfling']);

      expect(character.languages).toContain('Halfling');
    }
  });

  it('gives as many languages as the intelligence modifier allows, plus Common and racial ones', () => {
    for (let index = 0; index < 20; index++) {
      const character = generate(`count-${index}`, ['human']);

      expect(character.languages.length).toBeLessThanOrEqual(character.numberOfLanguages + 2);
    }
  });

  it('accepts a custom name generator set', () => {
    const seed = 'custom';
    const config = getDefaultDCCCharacterGeneratorConfig(seed);
    const nameSet = getFantasyNameGeneratorSet('dwarf', new RNG(seed));
    const character = generateRandomDCCCharacter(seed, config, nameSet);

    expect(character.firstName).toBeTruthy();
    expect(character.lastName).toBeTruthy();
  });

  it('names a character differently under a custom name set than under the default', () => {
    const seed = 'compare';
    const nameSet = getFantasyNameGeneratorSet('elf', new RNG(seed));
    const withCustom = generateRandomDCCCharacter(
      seed,
      getDefaultDCCCharacterGeneratorConfig(seed),
      nameSet,
    );
    const withDefault = generateRandomDCCCharacter(
      seed,
      getDefaultDCCCharacterGeneratorConfig(seed),
    );

    expect(withCustom.occupation.name).toBe(withDefault.occupation.name);
    expect(`${withCustom.firstName} ${withCustom.lastName}`).not.toBe(
      `${withDefault.firstName} ${withDefault.lastName}`,
    );
  });

  it('gives every character a starting armour class and speed', () => {
    for (let index = 0; index < 10; index++) {
      const character = generate(`defence-${index}`);

      expect(character.armorClass).toBeGreaterThan(0);
      expect(character.speed).toBeGreaterThan(0);
    }
  });

  it('sets spell levels from intelligence and personality', () => {
    for (let index = 0; index < 20; index++) {
      const character = generate(`spells-${index}`);

      expect(character.wizardMaxSpellLevel).toBeGreaterThanOrEqual(0);
      expect(character.wizardMaxSpellLevel).toBeLessThanOrEqual(5);
      expect(character.clericMaxSpellLevel).toBeGreaterThanOrEqual(0);
      expect(character.clericMaxSpellLevel).toBeLessThanOrEqual(5);
    }
  });

  it('never sets a negative number of bonus languages', () => {
    for (let index = 0; index < 30; index++) {
      expect(generate(`nonneg-${index}`).numberOfLanguages).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('the shared occupation and lucky sign tables', () => {
  function snapshotOccupations(): string[] {
    return [
      DwarfOccupations.all(),
      ElfOccupations.all(),
      HalflingOccupations.all(),
      HumanOccupations.all(),
    ].flatMap((rows) =>
      rows.map(
        (row) => `${row.name}|${row.trainedWeapon?.name ?? ''}|${row.tradeGoods?.name ?? ''}`,
      ),
    );
  }

  /**
   * The occupation and lucky sign tables are shared constants, and generation writes to both: the
   * human farmer's `apply` rewrites the occupation's own `name` with the crop it rolled, and every
   * character has its Luck modifier stamped onto its lucky sign. Both are copied at the point a row
   * is drawn, and this is the guard on that. Issue #20 shipped this same bug in Uncharted Worlds,
   * where it silently corrupted every character generated from roughly the fourth seed onward.
   */
  it('is not corrupted by generating many characters', () => {
    const occupationsBefore = snapshotOccupations();
    const luckBefore = LuckyRolls.all().map((roll) => `${roll.name}|${roll.modifier}`);

    for (let index = 0; index < 60; index++) {
      generate(`table-corruption-${index}`);
    }

    expect(snapshotOccupations()).toEqual(occupationsBefore);
    expect(LuckyRolls.all().map((roll) => `${roll.name}|${roll.modifier}`)).toEqual(luckBefore);
  });

  it('gives each character its own occupation rather than the shared row', () => {
    const sharedRows = new Set<unknown>(HumanOccupations.all());

    for (let index = 0; index < 40; index++) {
      expect(sharedRows.has(generate(`own-row-${index}`, ['human']).occupation)).toBe(false);
    }
  });

  it('gives each character its own lucky sign, so the modifier does not leak between them', () => {
    const sharedRolls = new Set<unknown>(LuckyRolls.all());

    for (let index = 0; index < 40; index++) {
      expect(sharedRolls.has(generate(`own-luck-${index}`).luckyRoll)).toBe(false);
    }
  });
});
