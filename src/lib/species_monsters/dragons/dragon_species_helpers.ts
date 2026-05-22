import type { Ability } from '$lib/abilities';
import { dragonLifespanTrueWyrm } from '$lib/age/dragon_life_stages.js';
import { traditional } from '$lib/gender/index.js';
import type PhysicalTraitGeneratorConfig from '$lib/physical_traits/physical_trait_generator_config.js';
import { dragonTrueWyrmSizeMatrix } from '$lib/size/dragon_sizes.js';
import type Species from '$lib/species/species.js';

export type DragonFamily = 'chromatic' | 'metallic' | 'gem' | 'other';

/** Abilities passed to `buildTrueDragonSpecies`; `tags` default from category and name. */
export type DragonAbilityInput = Omit<Ability, 'tags'> & { tags?: string[] };

export type TrueDragonSpeciesInput = {
  breedType: string;
  name: string;
  pluralName: string;
  adjective: string;
  family: DragonFamily;
  environments: string[];
  physicalTraitGeneratorConfigs: PhysicalTraitGeneratorConfig[];
  abilities: DragonAbilityInput[];
  baseThreatLevel: number;
  commonality: number;
  tags: string[];
  resourceProductNames?: Species['resourceProductNames'];
};

function defaultDragonAbilityTags(ability: Omit<Ability, 'tags'>): string[] {
  const tags = [ability.category, 'dragon'];
  if (ability.name.toLowerCase().startsWith('breath weapon')) {
    tags.push('breath_weapon');
  }
  return tags;
}

function normalizeDragonAbilities(inputs: DragonAbilityInput[]): Ability[] {
  return inputs.map((a) => {
    const { tags: optionalTags, ...rest } = a;
    const tags =
      optionalTags && optionalTags.length > 0
        ? [...optionalTags]
        : defaultDragonAbilityTags(rest);
    return { ...rest, tags };
  });
}

function familyTag(family: DragonFamily): string {
  switch (family) {
    case 'chromatic':
      return 'chromatic_dragon';
    case 'metallic':
      return 'metallic_dragon';
    case 'gem':
      return 'gem_dragon';
    default:
      return 'dragon_other';
  }
}

export function buildTrueDragonSpecies(input: TrueDragonSpeciesInput): Species {
  const mergedTags = Array.from(
    new Set<string>(['dragon', familyTag(input.family), ...input.tags]),
  );

  return {
    name: input.name,
    pluralName: input.pluralName,
    adjective: input.adjective,
    breedType: input.breedType,
    environments: input.environments,
    creatureTypes: ['dragon'],
    physicalTraitGeneratorConfigs: input.physicalTraitGeneratorConfigs,
    ageCategories: dragonLifespanTrueWyrm(),
    sizeGeneratorConfigMatrix: dragonTrueWyrmSizeMatrix(),
    abilities: normalizeDragonAbilities(input.abilities),
    baseThreatLevel: input.baseThreatLevel,
    genders: traditional(),
    commonality: input.commonality,
    tags: mergedTags,
    resourceProductNames: input.resourceProductNames,
  };
}
