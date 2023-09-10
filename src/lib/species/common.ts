import * as AgeCategories from "$lib/age/age_categories.js";
import type AgeCategory from "$lib/age/age_category.js";
import type PhysicalTrait from "$lib/physical_traits/physical_trait.js";
import type PhysicalTraitGeneratorConfig from "$lib/physical_traits/physical_trait_generator_config.js";
import * as PhysicalTraits from "$lib/physical_traits/physical_traits.js";
import type { SizeMatrix } from "$lib/size/size_matrix.js";
import * as RND from "@ironarachne/rng";
import all from "./all.js";
import * as Skeleton from "./modifiers/skeleton.js";
import * as Vampire from "./modifiers/vampire.js";
import * as Zombie from "./modifiers/zombie.js";
import type Species from "./species.js";

export function breed(species1: Species, species2: Species): Species {
  if (!breedable(species1, species2)) {
    throw new Error(`Species ${species1.name} and ${species2.name} are not breedable.`);
  }

  let result: Species = species1;

  result.environments = getCommonEnvironments(species1, species2);
  result.physicalTraitGeneratorConfigs = mergeTraits(species1, species2);
  result.ageCategories = averageAgeCategories(species1, species2);
  result.tags = mergeTags(species1.tags, species2.tags);
  result.name = generateCompositeName(species1, species2);
  result.sizeGeneratorConfigMatrix = averageSizes(species1, species2);

  return result;
}

export function averageAgeCategories(species1: Species, species2: Species): AgeCategory[] {
  // Since there might be more age categories in one species than the other, we need to find the
  // species with the highest maximum age.
  let maxAge: number = Math.max(
    species1.ageCategories[species1.ageCategories.length - 1].maxAge,
    species2.ageCategories[species2.ageCategories.length - 1].maxAge,
  );
  let minAge: number = Math.min(
    species1.ageCategories[species1.ageCategories.length - 1].maxAge,
    species2.ageCategories[species2.ageCategories.length - 1].maxAge,
  );

  let maxSpecies: Species = species1.ageCategories[species1.ageCategories.length - 1].maxAge
      > species2.ageCategories[species2.ageCategories.length - 1].maxAge
    ? species1
    : species2;

  // Now average them
  let average: number = (maxAge + minAge) / 2;

  // Now get a ratio of the max age to the average age.
  let ratio: number = maxAge / average;

  // Now generate a new set of age categories based on maxSpecies's age categories, but modified by the ratio
  // of the max age to the min age.
  let result: AgeCategory[] = AgeCategories.getVariant(ratio, maxSpecies.ageCategories);

  return result;
}

export function averageSizes(species1: Species, species2: Species): SizeMatrix {
  let result: SizeMatrix = species1.sizeGeneratorConfigMatrix;

  for (let i = 0; i < species1.sizeGeneratorConfigMatrix.length; i++) {
    for (let j = 0; j < species1.sizeGeneratorConfigMatrix[i].entries.length; j++) {
      result[i].entries[j].sizeGeneratorConfig.minHeight =
        (species1.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.minHeight
          + species2.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.minHeight) / 2;
      result[i].entries[j].sizeGeneratorConfig.maxHeight =
        (species1.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.maxHeight
          + species2.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.maxHeight) / 2;
      result[i].entries[j].sizeGeneratorConfig.minWeight =
        (species1.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.minWeight
          + species2.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.minWeight) / 2;
      result[i].entries[j].sizeGeneratorConfig.maxWeight =
        (species1.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.maxWeight
          + species2.sizeGeneratorConfigMatrix[i].entries[j].sizeGeneratorConfig.maxWeight) / 2;
    }
  }

  return result;
}

export function breedable(species1: Species, species2: Species): boolean {
  if (species1.breedType == species2.breedType) {
    return true;
  }

  return false;
}

export function byAnyTag(tags: string[], options: Species[]): Species[] {
  let result = [];

  let unique = true;

  for (let i = 0; i < options.length; i++) {
    unique = true;
    for (let j = 0; j < tags.length; j++) {
      if (options[i].tags.includes(tags[j]) && unique) {
        result.push(options[i]);
        unique = false;
      }
    }
  }

  return result;
}

export function byCreatureType(creatureType: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].creatureTypes.includes(creatureType)) {
      result.push(options[i]);
    }
  }

  return result;
}

export function byEnvironment(environment: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].environments.includes(environment) || options[i].environments.length == 0) {
      result.push(options[i]);
    }
  }

  return result;
}

export function byName(name: string, options: Species[]): Species {
  for (let i = 0; i < options.length; i++) {
    if (options[i].name == name) {
      return options[i];
    }
  }

  throw new Error(`No species found with name ${name}.`);
}

export function byTag(tag: string, options: Species[]): Species[] {
  let result: Species[] = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }

  return result;
}

export function generateCompositeName(species1: Species, species2: Species): string {
  let firstName = species1.name > species2.name ? species1.name : species2.name;
  let lastName = species1.name > species2.name ? species2.name : species1.name;

  return `${firstName}-${lastName}`;
}

export function getCommonEnvironments(species1: Species, species2: Species): string[] {
  let result = [];

  for (let i = 0; i < species1.environments.length; i++) {
    if (species2.environments.includes(species1.environments[i])) {
      result.push(species1.environments[i]);
    }
  }

  return result;
}

export function getModifiedVariants(options: Species[]): Species[] {
  let result: Species[] = [];

  result = result.concat(getSkeletonVariants(options));
  result = result.concat(getVampireVariants(options));
  result = result.concat(getZombieVariants(options));

  return result;
}

export function getSkeletonVariants(options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    let skeleton = Skeleton.modify(options[i]);
    result.push(skeleton);
  }

  return result;
}

export function getVampireVariants(options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    let vampire = Vampire.modify(options[i]);
    result.push(vampire);
  }

  return result;
}

export function getZombieVariants(options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    let zombie = Zombie.modify(options[i]);
    result.push(zombie);
  }

  return result;
}

export function mergeTags(tags1: string[], tags2: string[]): string[] {
  let result: string[] = tags1;

  for (let i = 0; i < tags2.length; i++) {
    if (!result.includes(tags2[i])) {
      result.push(tags2[i]);
    }
  }

  return result;
}

export function mergeTraits(species1: Species, species2: Species): PhysicalTraitGeneratorConfig[] {
  let result: PhysicalTraitGeneratorConfig[] = species1.physicalTraitGeneratorConfigs;

  for (let i = 0; i < species2.physicalTraitGeneratorConfigs.length; i++) {
    let config = species2.physicalTraitGeneratorConfigs[i];

    let configNames: string[] = result.map((c) => c.name);

    for (let j = 0; j < result.length; j++) {
      if (result[j].name == config.name) {
        // if the config already exists, add any new options to it
        for (let k = 0; k < config.options.length; k++) {
          if (!result[j].options.includes(config.options[k])) {
            result[j].options.push(config.options[k]);
          }
        }
      } else {
        if (!configNames.includes(config.name)) {
          // if the config doesn't exist, add it
          result.push(config);
        }
      }
    }
  }

  return result;
}

export function randomTraits(species: Species): PhysicalTrait[] {
  let traits: PhysicalTrait[] = [];

  for (let i = 0; i < species.physicalTraitGeneratorConfigs.length; i++) {
    const newTrait = PhysicalTraits.generate(species.physicalTraitGeneratorConfigs[i]);
    traits.push(newTrait);
  }

  return traits;
}

export function randomUniqueSet(options: Species[], count: number): Species[] {
  let result: Species[] = [];

  options = RND.shuffle(options);

  if (options.length >= count) {
    for (let i = 0; i < count; i++) {
      let item: Species | undefined = options.pop();
      if (item !== undefined) {
        result.push(item);
      }
    }
  } else {
    throw new Error("Not enough options to choose from.");
  }

  return result;
}

export function randomWeighted(options: Species[]): Species {
  return RND.weighted(options);
}

export function sentient(): Species[] {
  return byTag("sentient", all);
}

export function withCreatureType(creatureType: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].creatureTypes.includes(creatureType)) {
      result.push(options[i]);
    }
  }

  return result;
}

export function withoutTag(tag: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (!options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }

  return result;
}
