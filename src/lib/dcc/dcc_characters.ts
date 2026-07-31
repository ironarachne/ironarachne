import {
  dccOccupationToNameSetHint,
  generateDccCharacterNames,
  peopleNameGeneratorsFromNameSet,
} from '$lib/characters/character_name_generation';
import { getFantasyNameGeneratorSet, type NameGeneratorSet } from '$lib/names';
import { RNG } from '@ironarachne/rng';
import * as MUN from '@ironarachne/made-up-names';
import * as Dice from '$lib/dice';
import type {
  DCCCharacter,
  DCCCharacterGeneratorConfig,
  DCCItem,
  DCCLuckyRoll,
  DCCOccupation,
} from './dcc_types';
import * as DwarfOccupations from './dwarf_occupations';
import * as ElfOccupations from './elf_occupations';
import * as HalflingOccupations from './halfling_occupations';
import * as HumanOccupations from './human_occupations';
import * as Languages from './languages';
import * as LuckyRolls from './lucky_rolls';

export function getDefaultDCCCharacterGeneratorConfig(seed: string): DCCCharacterGeneratorConfig {
  const rng = new RNG(seed);
  const familyPatterns = MUN.getCultureNamePatternSet('fantasy').family;
  const femalePatterns = MUN.getCultureNamePatternSet('fantasy').female;
  const malePatterns = MUN.getCultureNamePatternSet('fantasy').male;
  const nameGeneratorFamily = MUN.getNameGeneratorForPatternSet('family', familyPatterns, rng);
  const nameGeneratorFemale = MUN.getNameGeneratorForPatternSet('female', femalePatterns, rng);
  const nameGeneratorMale = MUN.getNameGeneratorForPatternSet('male', malePatterns, rng);
  const allowedOccupations = ['dwarf', 'elf', 'halfling', 'human'];

  return {
    nameGeneratorMale: nameGeneratorMale,
    nameGeneratorFemale: nameGeneratorFemale,
    nameGeneratorFamily: nameGeneratorFamily,
    allowedOccupations: allowedOccupations,
  };
}

export function generateRandomDCCCharacter(
  seed: string,
  config: DCCCharacterGeneratorConfig,
  customNameGeneratorSet?: NameGeneratorSet,
): DCCCharacter {
  const rng = new RNG(seed);

  let character: DCCCharacter = {
    firstName: '',
    lastName: '',
    age: 0,
    gender: '',
    level: 0,
    xp: 0,
    hp: 0,
    speed: 30,
    alignment: '',
    occupation: {
      name: '',
      trainedWeapon: null,
      tradeGoods: null,
      commonality: 0,
      apply: (c, _rng) => c,
    },
    strength: { value: 0, modifier: 0 },
    agility: { value: 0, modifier: 0 },
    stamina: { value: 0, modifier: 0 },
    personality: { value: 0, modifier: 0 },
    intelligence: { value: 0, modifier: 0 },
    luck: { value: 0, modifier: 0 },
    fortitudeSave: 0,
    reflexSave: 0,
    willpowerSave: 0,
    baseSave: 0,
    luckyRoll: { name: '', description: '', modifier: 0, apply: (c) => c },
    spellsKnown: 0,
    wizardMaxSpellLevel: 0,
    clericMaxSpellLevel: 0,
    attackModifier: 0,
    specialRules: [],
    armorClass: 10,
    currency: { cp: 0, sp: 0, gp: 0, ep: 0, pp: 0 },
    equipment: [],
    weapons: [],
    languages: [],
    numberOfLanguages: 0,
  };

  character.strength = { value: Dice.roll('3d6', rng), modifier: 0 };
  character.strength.modifier = getAttributeModifier(character.strength.value);
  character.agility = { value: Dice.roll('3d6', rng), modifier: 0 };
  character.agility.modifier = getAttributeModifier(character.agility.value);
  character.stamina = { value: Dice.roll('3d6', rng), modifier: 0 };
  character.stamina.modifier = getAttributeModifier(character.stamina.value);
  character.personality = { value: Dice.roll('3d6', rng), modifier: 0 };
  character.personality.modifier = getAttributeModifier(character.personality.value);
  character.intelligence = { value: Dice.roll('3d6', rng), modifier: 0 };
  character.intelligence.modifier = getAttributeModifier(character.intelligence.value);
  character.luck = { value: Dice.roll('3d6', rng), modifier: 0 };
  character.luck.modifier = getAttributeModifier(character.luck.value);

  character.numberOfLanguages =
    character.intelligence.modifier > 0 ? character.intelligence.modifier : 0;

  character.luckyRoll = randomLuckyRoll(character.luck.modifier, rng);

  character.hp = Dice.roll('1d4', rng) + character.stamina.modifier;
  if (character.hp < 1) {
    character.hp = 1;
  }

  character.spellsKnown = getSpellsKnown(character.intelligence.value);
  character.wizardMaxSpellLevel = getMaxSpellLevel(character.intelligence.value);
  character.clericMaxSpellLevel = getMaxSpellLevel(character.personality.value);

  character.baseSave = 0;
  character.fortitudeSave = character.baseSave + character.stamina.modifier;
  character.willpowerSave = character.baseSave + character.personality.modifier;
  character.reflexSave = character.baseSave + character.agility.modifier;

  character.gender = rng.item(['male', 'female']);
  character.lastName = config.nameGeneratorFamily.generate(1)[0];
  character.firstName = config.nameGeneratorFemale.generate(1)[0];
  if (character.gender === 'male') {
    character.firstName = config.nameGeneratorMale.generate(1)[0];
  }
  character.age = rng.int(16, 22);
  character.xp = 0;
  character.level = 0;
  character.alignment = rng.item(['Law', 'Chaos', 'Neutrality']);

  character.occupation = randomOccupation(config.allowedOccupations, rng);
  if (character.occupation.trainedWeapon) {
    character.equipment.push(character.occupation.trainedWeapon);
    character.weapons.push(character.occupation.trainedWeapon);
  }
  if (character.occupation.tradeGoods) {
    character.equipment.push(character.occupation.tradeGoods);
  }

  const randomEquipment = rng.item(getEquipmentOptions());
  character.equipment.push(randomEquipment);
  character.currency.cp = Dice.roll('5d12', rng);

  character.languages.push('Common');

  // `apply` is a domain method on DCCOccupation, not Function.prototype.apply.
  // eslint-disable-next-line prefer-spread
  character = character.occupation.apply(character, rng);
  character = character.luckyRoll.apply(character);

  applyDefaultOrCustomDccCharacterNames(character, rng, config, customNameGeneratorSet);

  character.languages = getLanguages(character, rng);

  return character;
}

function applyDefaultOrCustomDccCharacterNames(
  character: DCCCharacter,
  rng: RNG,
  config: DCCCharacterGeneratorConfig,
  customNameGeneratorSet?: NameGeneratorSet,
): void {
  if (customNameGeneratorSet) {
    generateDccCharacterNames(
      character,
      peopleNameGeneratorsFromNameSet(customNameGeneratorSet),
      rng,
    );
    return;
  }

  const hint = dccOccupationToNameSetHint(character.occupation.name);
  if (hint === 'human') {
    generateDccCharacterNames(
      character,
      {
        male: config.nameGeneratorMale,
        female: config.nameGeneratorFemale,
        family: config.nameGeneratorFamily,
      },
      rng,
    );
    return;
  }

  const nameSet = getFantasyNameGeneratorSet(hint, rng);
  generateDccCharacterNames(character, peopleNameGeneratorsFromNameSet(nameSet), rng);
}

export function getAttributeModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}

function getLanguages(character: DCCCharacter, rng: RNG): string[] {
  const languages = character.languages;
  let possibleLanguages = Languages.getHuman();

  if (character.occupation.name.includes('dwarven')) {
    possibleLanguages = Languages.getDwarf();
    possibleLanguages.push({ name: character.alignment, commonality: 20 });
  } else if (character.occupation.name.includes('elven')) {
    possibleLanguages = Languages.getElf();
    possibleLanguages.push({ name: character.alignment, commonality: 20 });
  } else if (character.occupation.name.includes('halfling')) {
    possibleLanguages = Languages.getHalfling();
    possibleLanguages.push({ name: character.alignment, commonality: 25 });
  } else {
    possibleLanguages.push({ name: character.alignment, commonality: 20 });
  }

  // Filter out languages already known
  possibleLanguages = possibleLanguages.filter((l) => !languages.includes(l.name));

  for (let i = 0; i < character.numberOfLanguages; i++) {
    if (possibleLanguages.length === 0) break;

    const language = rng.weighted(
      possibleLanguages.map((l) => {
        return { commonality: l.commonality, value: l };
      }),
    );

    if (!languages.includes(language.name)) {
      languages.push(language.name);
      // Remove selected language from possible list to avoid duplicates
      possibleLanguages = possibleLanguages.filter((l) => l.name !== language.name);
    } else {
      // Should not happen due to filter above, but just in case
      i--;
    }
  }

  return languages;
}

export function getMaxSpellLevel(score: number): number {
  const values = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5];
  if (score >= values.length) return 5;
  if (score < 0) return 0;
  return values[score];
}

export function getSpellsKnown(intScore: number): number {
  const known = [-9, -9, -9, -9, -2, -2, -1, -1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2];
  if (intScore >= known.length) return 2;
  if (intScore < 0) return -9;
  return known[intScore];
}

function getEquipmentOptions(): DCCItem[] {
  return [
    { name: 'backpack', value: 1 },
    { name: 'candle', value: 1 },
    { name: "chain, 10'", value: 1 },
    { name: 'chalk, 1 piece', value: 1 },
    { name: 'chest, empty', value: 1 },
    { name: 'crowbar', value: 1 },
    { name: 'flask, empty', value: 1 },
    { name: 'flint and steel', value: 1 },
    { name: 'grappling hook', value: 1 },
    { name: 'hammer, small', value: 1 },
    { name: 'holy symbol', value: 1 },
    { name: 'holy water, 1 vial', value: 1 },
    { name: 'iron spike', value: 1 },
    { name: 'lantern', value: 1 },
    { name: 'mirror, hand-sized', value: 1 },
    { name: 'oil, 1 flask', value: 1 },
    { name: 'pole, 10-foot', value: 1 },
    { name: 'rations, 1 day', value: 1 },
    { name: "rope, 50'", value: 1 },
    { name: 'sack, large', value: 1 },
    { name: 'sack, small', value: 1 },
    { name: "thieves' tools", value: 1 },
    { name: 'torch', value: 1 },
    { name: 'waterskin', value: 1 },
  ];
}

function randomLuckyRoll(modifier: number, rng: RNG): DCCLuckyRoll {
  const rolls = LuckyRolls.all();
  // rolls[0] is empty placeholder, so we roll 1d30 to get index 1-30
  const rollIndex = Dice.roll('1d30', rng);
  const roll = rolls[rollIndex];
  roll.modifier = modifier;

  return roll;
}

function randomOccupation(allowedOccupations: string[], rng: RNG): DCCOccupation {
  let occupations: DCCOccupation[] = [];

  if (allowedOccupations.includes('dwarf')) {
    occupations = occupations.concat(DwarfOccupations.all());
  }

  if (allowedOccupations.includes('elf')) {
    occupations = occupations.concat(ElfOccupations.all());
  }

  if (allowedOccupations.includes('halfling')) {
    occupations = occupations.concat(HalflingOccupations.all());
  }

  if (allowedOccupations.includes('human')) {
    occupations = occupations.concat(HumanOccupations.all());
  }

  const occupation = rng.weighted(
    occupations.map((o) => {
      return { commonality: o.commonality, value: o };
    }),
  );

  return occupation;
}
