import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateCulture, getDefaultCultureGenerationConfig } from '$lib/culture';
import { getFantasyNameGeneratorSet } from '$lib/names';
import {
  applyNameGeneratorsToCharacterGenerationConfig,
  buildCharacterNameSource,
  dccOccupationToNameSetHint,
  fantasyHintToNameSetName,
  generateCharacterName,
  isCustomCharacterNameSource,
  peopleNameGeneratorsFromNameSet,
  resolveCharacterNameGeneratorSet,
  resolveNamingGender,
  restoreLockedCharacterName,
} from './character_name_generation';
import { getDefaultCharacterGenerationConfig } from './character_generation';

describe('character_name_generation', () => {
  it('maps fantasy hints to supported name sets', () => {
    expect(fantasyHintToNameSetName('High Elf')).toBe('elf');
    expect(fantasyHintToNameSetName('Mountain Dwarf')).toBe('dwarf');
    expect(fantasyHintToNameSetName('unknown creature')).toBe('human');
  });

  it('maps DCC occupations to name set hints', () => {
    expect(dccOccupationToNameSetHint('Elven artisan')).toBe('elf');
    expect(dccOccupationToNameSetHint('Dwarven apothecary')).toBe('dwarf');
    expect(dccOccupationToNameSetHint('Halfling chicken butcher')).toBe('halfling');
    expect(dccOccupationToNameSetHint('Human merchant')).toBe('human');
  });

  it('resolves naming gender from character gender when random', () => {
    const rng = new RNG('gender-seed');
    expect(resolveNamingGender(rng, 'random', 'female')).toBe('female');
    expect(resolveNamingGender(rng, 'male', 'female')).toBe('male');
  });

  it('generates first and last names from a name set', () => {
    const rng = new RNG('name-seed');
    const nameSet = getFantasyNameGeneratorSet('human', rng);
    const generated = generateCharacterName(rng, peopleNameGeneratorsFromNameSet(nameSet), 'male');
    expect(generated.firstName.length).toBeGreaterThan(0);
    expect(generated.lastName.length).toBeGreaterThan(0);
  });

  it('resolves default, preset, and saved culture name sets', () => {
    const rng = new RNG('resolve-seed');
    const defaultSet = resolveCharacterNameGeneratorSet(rng, { kind: 'default' }, 'elf');
    expect(defaultSet.name).toBe('elf');

    const presetSet = resolveCharacterNameGeneratorSet(
      rng,
      { kind: 'preset', setName: 'dwarf' },
      'human',
    );
    expect(presetSet.name).toBe('dwarf');

    const cultureRng = new RNG('culture-seed');
    const cultureConfig = getDefaultCultureGenerationConfig();
    cultureConfig.nameGenerators = getFantasyNameGeneratorSet('halfling', cultureRng);
    const culture = generateCulture('culture-seed', cultureConfig);
    const cultureSet = resolveCharacterNameGeneratorSet(
      rng,
      { kind: 'saved_culture', culture },
      'human',
    );
    expect(cultureSet.name).toBe('halfling');
  });

  it('builds character name sources from UI selections', () => {
    const cultureRng = new RNG('culture-ui-seed');
    const cultureConfig = getDefaultCultureGenerationConfig();
    cultureConfig.nameGenerators = getFantasyNameGeneratorSet('orc', cultureRng);
    const culture = generateCulture('culture-ui-seed', cultureConfig);

    expect(buildCharacterNameSource('default', 'elf', culture.name, [culture])).toEqual({
      kind: 'default',
    });
    expect(buildCharacterNameSource('preset', 'elf', culture.name, [culture])).toEqual({
      kind: 'preset',
      setName: 'elf',
    });
    expect(buildCharacterNameSource('saved_culture', 'elf', culture.name, [culture])).toEqual({
      kind: 'saved_culture',
      culture,
    });
    expect(isCustomCharacterNameSource({ kind: 'default' })).toBe(false);
    expect(isCustomCharacterNameSource({ kind: 'preset', setName: 'elf' })).toBe(true);
  });

  it('applies name generators to character generation config', () => {
    const rng = new RNG('config-seed');
    const config = getDefaultCharacterGenerationConfig('config-seed');
    const nameSet = getFantasyNameGeneratorSet('gnome', rng);
    applyNameGeneratorsToCharacterGenerationConfig(config, nameSet);
    expect(config.maleFirstNameGenerator).toBe(nameSet.male);
    expect(config.femaleFirstNameGenerator).toBe(nameSet.female);
    expect(config.familyNameGenerator).toBe(nameSet.family);
  });

  it('restores locked names on a character object', () => {
    const character = {
      firstName: 'Generated',
      lastName: 'Name',
      name: 'Generated Name',
    };
    restoreLockedCharacterName(character, 'Locked', 'Person');
    expect(character).toEqual({
      firstName: 'Locked',
      lastName: 'Person',
      name: 'Locked Person',
    });
  });
});
