import type { CharacterGenerationConfig, Character, Title } from './character_types';
import * as AgeCategories from '$lib/age/age_categories';
import * as Words from '@ironarachne/words';
import * as Measurements from '$lib/measurements';
import * as RNG from '@ironarachne/rng';
import * as SizeMatrix from '$lib/size/size_matrix';
import * as Genders from '$lib/gender/genders';
import * as PersonalityTraits from '$lib/characters/personality_traits';
import { randomTraits } from '$lib/species/common';
import { getDefaultCombatActions, getDefaultCombatProfile } from '$lib/combat_system';
import type PhysicalTrait from '$lib/physical_traits/physical_trait';
import { getAllFantasyArchetypes, type Archetype } from '$lib/archetypes';
import human from '$lib/species_sentients/human';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generateHeraldry } from '$lib/heraldry/generator';
import { getDefaultHeraldryGeneratorConfig } from '$lib/heraldry';
import { getStandardNobleTitles } from './titles';
import { applyTagFilter } from '$lib/tags';

export function describe(character: Character, rng: RNG.RNG): string {
  let description = '';

  const sbj = character.gender.pronouns.subjective;
  const ucSbj = Words.capitalize(sbj);
  const genderNoun = character.ageCategory.noun;

  const height = `${character.height} cm (${Measurements.inchesToFeetExpression(
    Measurements.cmToInches(character.height),
  )})`;
  const weight = `${character.weight} kg (${Math.round(Measurements.kgToPounds(character.weight))} lb.)`;
  const spPhrase = `${character.species.adjective} ${genderNoun}`;
  const traits = Words.arrayToPhrase(describeTraits(character));

  description = rng.item([
    `${character.firstName} ${character.lastName} is a ${height} tall ${spPhrase}. ${ucSbj} is ${character.age} years old. ${character.firstName} has ${traits}. `,
    `${character.firstName} is ${Words.article(
      spPhrase,
    )} ${spPhrase} of ${character.age} years. ${ucSbj} is ${height} tall and weighs ${weight}. ${ucSbj} has ${traits}. `,
  ]);

  description += `${describePersonality(character)}.`;

  return description;
}

export function describePersonality(character: Character): string {
  const description = `${Words.capitalize(character.gender.pronouns.subjective)} is ${Words.arrayToPhrase(character.personalityTraits)}`;

  return description;
}

export function describeTraits(character: Character): string[] {
  const traits = [];

  for (let i = 0; i < character.physicalTraits.length; i++) {
    traits.push(character.physicalTraits[i].description);
  }

  return traits;
}

export function generate(seed: string, config: CharacterGenerationConfig): Character {
  const rng = new RNG.RNG(seed);

  const gender = config.allowedGenderNames
    ? Genders.getGenderFromSet(rng.item(config.allowedGenderNames), config.species.genders)
    : rng.item(config.species.genders);

  const firstName =
    gender.name === 'male'
      ? config.maleFirstNameGenerator.generate(1)[0]
      : config.femaleFirstNameGenerator.generate(1)[0];
  const lastName = config.familyNameGenerator.generate(1)[0];

  const ageCategory = config.allowedAgeCategoryNames
    ? AgeCategories.getCategoryFromName(
        rng.item(config.allowedAgeCategoryNames),
        config.species.ageCategories,
      )
    : rng.item(config.species.ageCategories);

  const sizeGeneratorConfig = SizeMatrix.getSizeConfig(
    gender.name,
    ageCategory.name,
    config.species.sizeGeneratorConfigMatrix,
  );
  const height = rng.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  const weight = rng.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
  const length = rng.int(sizeGeneratorConfig.minLength, sizeGeneratorConfig.maxLength);

  let personalityTraits: string[] = [];
  if (ageCategory.name !== 'infant') {
    personalityTraits = PersonalityTraits.getRandomPersonalityTraits(
      seed + '-personality',
      rng.int(1, 3),
    ).map((trait) => trait.adjective);
  }

  let physicalTraits: PhysicalTrait[] = [];
  if (config.physicalTraitOverrides && config.physicalTraitOverrides.length > 0) {
    physicalTraits = config.physicalTraitOverrides;
  } else {
    physicalTraits = randomTraits(seed + '-physical', config.species);
  }

  const combatProfile = getDefaultCombatProfile();
  const combatActions = getDefaultCombatActions();

  const tags: string[] = [];

  const behaviors = ['cautious', 'lethargic', 'resting', 'sleeping', 'watching'];

  if (ageCategory.name === 'child' || ageCategory.name === 'infant') {
    behaviors.push('playing');
  }

  if (ageCategory.name === 'adult') {
    behaviors.push('working');
  }

  tags.push(...config.species.tags);
  tags.push(ageCategory.name);

  const currentBehavior = rng.item(behaviors);
  let archetype: undefined | Archetype;

  if (
    ageCategory.name !== 'infant' &&
    ageCategory.name !== 'child' &&
    config.archetypeOptions &&
    config.archetypeOptions.length > 0
  ) {
    // adults can have an archetype
    const tagFilter = {
      includeSomeTags: config.allowedArchetypeTags,
      excludeTags: config.disallowedArchetypeTags,
    };

    const filteredArchetypes = applyTagFilter(config.archetypeOptions, tagFilter);
    if (filteredArchetypes.length > 0) {
      archetype = rng.item(filteredArchetypes);
      tags.push(...archetype.tags);
    }
  }

  let heraldry = undefined;
  let titles: Title[] = [];
  if (archetype?.name === 'noble') {
    const heraldryConfig = getDefaultHeraldryGeneratorConfig();
    heraldryConfig.rng = rng;
    heraldry = generateHeraldry(heraldryConfig);

    const possibleTitles = getStandardNobleTitles();
    const title = rng.item(possibleTitles);
    title.landName = getFantasyNameGeneratorSet(
      config.species.name.toLowerCase() || 'human',
      rng,
    ).country.generate(1)[0];
    titles.push(title);
  }

  let shortDescription = currentBehavior;
  if (archetype) {
    shortDescription += ` ${config.species.adjective} ${archetype.name}`;
  } else {
    shortDescription += ` ${config.species.adjective} ${ageCategory.noun}`;
  }

  const character: Character = {
    id: rng.randomString(16),
    name: `${firstName} ${lastName}`,
    description: '',
    shortDescription,
    species: config.species,
    gender,
    ageCategory,
    age: rng.int(ageCategory.minAge, ageCategory.maxAge),
    height,
    weight,
    length,
    physicalTraits,
    personalityTraits,
    abilities: [...config.species.abilities],
    behaviors,
    creatureTypes: [...config.species.creatureTypes],
    carried: [],
    firstName,
    lastName,
    combatProfile,
    actions: combatActions,
    tags,
    archetype,
    heraldry,
    titles,
    relationships: [],
  };

  character.description = describe(character, rng);

  return character;
}

export function getDefaultCharacterGenerationConfig(seed: string): CharacterGenerationConfig {
  const defaultSpecies = human;
  const rng = new RNG.RNG(seed + '-names');
  const nameGenSet = getFantasyNameGeneratorSet('tiefling', rng);
  const archetypes = getAllFantasyArchetypes();

  return {
    archetypeOptions: archetypes,
    species: defaultSpecies,
    maleFirstNameGenerator: nameGenSet.male,
    femaleFirstNameGenerator: nameGenSet.female,
    familyNameGenerator: nameGenSet.family,
  };
}
