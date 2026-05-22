import type { Culture } from '$lib/culture';
import { getFantasyNameGeneratorSet, type NameGeneratorSet } from '$lib/names';
import type { NameGenerator } from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';
import type { CharacterGenerationConfig } from './character_types';

export type CharacterNameSource =
  | { kind: 'default' }
  | { kind: 'preset'; setName: string }
  | { kind: 'saved_culture'; culture: Culture };

export type NamingGender = 'male' | 'female' | 'random';

export type GeneratedCharacterName = {
  firstName: string;
  lastName: string;
};

export type PeopleNameGenerators = {
  male: NameGenerator;
  female: NameGenerator;
  family: NameGenerator;
};

export function isCustomCharacterNameSource(source: CharacterNameSource): boolean {
  return source.kind !== 'default';
}

export function fantasyHintToNameSetName(hint: string): string {
  const normalized = hint.toLowerCase();
  if (normalized.includes('elf')) return 'elf';
  if (normalized.includes('dwarf')) return 'dwarf';
  if (normalized.includes('gnome')) return 'gnome';
  if (normalized.includes('halfling')) return 'halfling';
  if (normalized.includes('human')) return 'human';
  if (normalized.includes('orc')) return 'orc';
  if (normalized.includes('goblin')) return 'goblin';
  if (normalized.includes('tiefling')) return 'tiefling';
  return 'human';
}

export function dccOccupationToNameSetHint(occupationName: string): string {
  const normalized = occupationName.toLowerCase();
  if (normalized.includes('elven')) return 'elf';
  if (normalized.includes('dwarven')) return 'dwarf';
  if (normalized.includes('halfling')) return 'halfling';
  return 'human';
}

export function resolveNamingGender(
  rng: RNG,
  gender: NamingGender,
  characterGender?: string,
): 'male' | 'female' {
  if (gender !== 'random') {
    return gender;
  }
  if (characterGender === 'male' || characterGender === 'female') {
    return characterGender;
  }
  return rng.item(['male', 'female']);
}

export function peopleNameGeneratorsFromNameSet(nameSet: NameGeneratorSet): PeopleNameGenerators {
  return {
    male: nameSet.male,
    female: nameSet.female,
    family: nameSet.family,
  };
}

export function resolveCharacterNameGeneratorSet(
  rng: RNG,
  source: CharacterNameSource,
  defaultHint = 'human',
): NameGeneratorSet {
  if (source.kind === 'preset') {
    return getFantasyNameGeneratorSet(source.setName, rng);
  }
  if (source.kind === 'saved_culture') {
    return source.culture.nameGenerators;
  }
  return getFantasyNameGeneratorSet(fantasyHintToNameSetName(defaultHint), rng);
}

export function generateCharacterName(
  rng: RNG,
  generators: PeopleNameGenerators,
  gender: NamingGender,
  characterGender?: string,
): GeneratedCharacterName {
  const resolvedGender = resolveNamingGender(rng, gender, characterGender);
  const firstName =
    resolvedGender === 'male'
      ? generators.male.generate(1)[0]
      : generators.female.generate(1)[0];
  const lastName = generators.family.generate(1)[0];
  return { firstName, lastName };
}

export function applyNameGeneratorsToCharacterGenerationConfig(
  config: CharacterGenerationConfig,
  nameSet: NameGeneratorSet,
): void {
  config.maleFirstNameGenerator = nameSet.male;
  config.femaleFirstNameGenerator = nameSet.female;
  config.familyNameGenerator = nameSet.family;
}

export function applyGeneratedCharacterName(
  target: { firstName: string; lastName: string; name?: string },
  generated: GeneratedCharacterName,
): void {
  target.firstName = generated.firstName;
  target.lastName = generated.lastName;
  if ('name' in target) {
    target.name = `${generated.firstName} ${generated.lastName}`.trim();
  }
}

export function restoreLockedCharacterName<T extends { firstName: string; lastName: string; name?: string }>(
  target: T,
  lockedFirstName: string,
  lockedLastName: string,
): T {
  applyGeneratedCharacterName(target, {
    firstName: lockedFirstName,
    lastName: lockedLastName,
  });
  return target;
}

export function generateDccCharacterNames(
  character: { firstName: string; lastName: string; gender: string },
  generators: PeopleNameGenerators,
  rng: RNG,
  gender: NamingGender = 'random',
): GeneratedCharacterName {
  const generated = generateCharacterName(rng, generators, gender, character.gender);
  character.firstName = generated.firstName;
  character.lastName = generated.lastName;
  return generated;
}

export function buildCharacterNameSource(
  kind: 'default' | 'preset' | 'saved_culture',
  presetSetName: string,
  savedCultureName: string,
  savedCultures: Culture[],
): CharacterNameSource {
  if (kind === 'preset') {
    return { kind: 'preset', setName: presetSetName };
  }
  if (kind === 'saved_culture') {
    const culture = savedCultures.find((entry) => entry.name === savedCultureName);
    if (culture) {
      return { kind: 'saved_culture', culture };
    }
  }
  return { kind: 'default' };
}

export function formatCharacterDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function rollCharacterNameForSource(
  nameRng: RNG,
  source: CharacterNameSource,
  defaultHint: string,
  gender: NamingGender,
  characterGender?: string,
): GeneratedCharacterName {
  const nameSet = resolveCharacterNameGeneratorSet(nameRng, source, defaultHint);
  return generateCharacterName(
    nameRng,
    peopleNameGeneratorsFromNameSet(nameSet),
    gender,
    characterGender,
  );
}
