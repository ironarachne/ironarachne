import type { CharacterGenerationConfig, Character } from './character_types';
import * as AgeCategories from "$lib/age/age_categories";
import * as Words from "@ironarachne/words";
import * as Measurements from "$lib/measurements";
import * as RNG from "@ironarachne/rng";
import * as SizeMatrix from "$lib/size/size_matrix";
import * as Genders from "$lib/gender/genders";

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

	const gender = config.allowedGenderNames ? Genders.getGenderFromSet(rng.item(config.allowedGenderNames), config.species.genders) : rng.item(config.species.genders);

	const firstName = gender.name === "male" ? config.maleFirstNameGenerator.generate(1)[0] : config.femaleFirstNameGenerator.generate(1)[0];
	const lastName = config.familyNameGenerator.generate(1)[0];

	const ageCategory = config.allowedAgeCategoryNames ? AgeCategories.getCategoryFromName(rng.item(config.allowedAgeCategoryNames), config.species.ageCategories) : rng.item(config.species.ageCategories);

	const sizeGeneratorConfig = SizeMatrix.getSizeConfig(
	    gender.name,
	    ageCategory.name,
	    config.species.sizeGeneratorConfigMatrix,
	  );
  	const height = rng.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  	const weight = rng.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);

  	// personality traits
  	// physical traits
  	// combat profile

  	// return character
}
