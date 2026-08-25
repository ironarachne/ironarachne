import type { Culture } from '$lib/culture';
import { getFantasyNameGeneratorSet, type NameGeneratorSet } from '$lib/names';
import type { NameGenerator } from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';
import type { CharacterGenerationConfig } from './character_types';

/**
 * Where a character's names come from.
 *
 * `saved_culture` and `referenced_culture` both name from a culture and are not the same thing.
 * The first is the legacy affordance: a dropdown of every culture the browser can find, whose
 * names are copied out and whose origin is not recorded anywhere. The second is composition
 * proper — the culture is chosen through the artifact picker, the link is stored on the artifact
 * by id (requirement 5.2), and the culture's own pattern set goes into provenance so a re-roll
 * stays faithful without reaching back into the store.
 *
 * Both exist because the second is being adopted one character tool at a time. A tool that has
 * not been converted still offers the first, and nothing about it changed.
 */
export type CharacterNameSource =
  | { kind: 'default' }
  | { kind: 'preset'; setName: string }
  | { kind: 'saved_culture'; culture: Culture }
  | { kind: 'referenced_culture'; culture: Culture };

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
  if (source.kind === 'saved_culture' || source.kind === 'referenced_culture') {
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
    resolvedGender === 'male' ? generators.male.generate(1)[0] : generators.female.generate(1)[0];
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

export function restoreLockedCharacterName<
  T extends { firstName: string; lastName: string; name?: string },
>(target: T, lockedFirstName: string, lockedLastName: string): T {
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

/**
 * The source a naming control's fields describe.
 *
 * `referencedCulture` is the culture the artifact picker loaded, when the tool offers one. It is
 * handed in already rebuilt rather than looked up by name, because a referenced culture is
 * identified by artifact id and two projects may hold cultures called the same thing.
 *
 * A kind of `referenced_culture` with nothing loaded falls through to `default`, which is the
 * ordinary state while the picker is still reading from the store: a tool that named from a
 * culture it does not have yet would be naming from nothing and calling it a culture.
 */
export function buildCharacterNameSource(
  kind: 'default' | 'preset' | 'saved_culture' | 'referenced_culture',
  presetSetName: string,
  savedCultureName: string,
  savedCultures: Culture[],
  referencedCulture?: Culture,
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
  if (kind === 'referenced_culture' && referencedCulture !== undefined) {
    return { kind: 'referenced_culture', culture: referencedCulture };
  }
  return { kind: 'default' };
}

/**
 * The name-generator set a source draws on, for provenance. Empty when there is nothing stable to
 * record — a preset records its own name, a culture records the set its generators carry.
 */
export function nameGeneratorSetForSource(source: CharacterNameSource): string {
  if (source.kind === 'preset') {
    return source.setName;
  }
  if (source.kind === 'saved_culture' || source.kind === 'referenced_culture') {
    return source.culture.nameGenerators.name;
  }
  return '';
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
