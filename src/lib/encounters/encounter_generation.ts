import { getFantasyCombatArchetypes } from '$lib/archetypes';
import type { MobGroup } from '$lib/mobs';
import { nonSentient, sentient } from '$lib/species/common';
import { applyTagFilter } from '$lib/tags/tags';
import { RNG } from '@ironarachne/rng';
import {
  generate as generateCharacter,
  getDefaultCharacterGenerationConfig,
  type Character,
} from '$lib/characters';
import { generate as generateCreature, getDefaultCreatureGenerationConfig } from '$lib/creatures';
import type {
  Encounter,
  EncounterGenerationConfig,
  EncounterGroupTemplate,
} from './encounter_types';
import { applyMutators } from '$lib/mutator';
import type Species from '$lib/species/species';

export function generateEncounter(seed: string, config: EncounterGenerationConfig): Encounter {
  const rng = new RNG(seed);

  const template = rng.item(config.possibleTemplates);

  if (config.forceUniformSpecies && !config.speciesOverride) {
    let possibleSpecies: Species[] = [];

    for (let i = 0; i < template.groupTemplates.length; i++) {
      const groupTemplate = template.groupTemplates[i];
      const groupPossibleSpecies = groupTemplate.speciesTagFilter
        ? applyTagFilter(sentient(), groupTemplate.speciesTagFilter)
        : sentient();

      if (possibleSpecies.length === 0) {
        possibleSpecies = groupPossibleSpecies;
      } else {
        possibleSpecies = possibleSpecies.filter((species) =>
          groupPossibleSpecies.includes(species),
        );
      }
    }

    if (possibleSpecies.length > 0) {
      const chosenSpecies = rng.item(possibleSpecies);
      config.speciesOverride = chosenSpecies;
    }
  }

  const groups = template.groupTemplates.map((groupTemplate, _index) => {
    const modifiedGroupTemplate = { ...groupTemplate };
    if (config.speciesOverride) {
      modifiedGroupTemplate.speciesTagFilter = { includeAllTags: [config.speciesOverride.name] };
    }
    return generateEncounterGroup(rng.randomString(16), modifiedGroupTemplate);
  });

  return {
    name: template.name,
    description: '', // TODO: generate description based on the template
    difficulty: 0, // TODO: calculate difficulty based on the mobs in the encounter
    groups,
  };
}

export function generateEncounterGroup(seed: string, template: EncounterGroupTemplate): MobGroup {
  const rng = new RNG(seed);

  if (template.isSentient) {
    const sentientSpecies = sentient();
    const possibleArchetypes = applyTagFilter(
      getFantasyCombatArchetypes(),
      template.archetypeTagFilter,
    );
    const possibleSpecies = template.speciesTagFilter
      ? applyTagFilter(sentientSpecies, template.speciesTagFilter)
      : sentientSpecies;

    let species = rng.item(possibleSpecies);
    const archetype = rng.item(possibleArchetypes);

    const count = rng.int(template.minCount, template.maxCount);

    const mobs = [];

    for (let i = 0; i < count; i++) {
      const genConfig = getDefaultCharacterGenerationConfig(rng.randomString(16));
      genConfig.archetypeOptions = [archetype];
      genConfig.allowedAgeCategoryNames = ['adult'];

      if (!template.hasUniformSpecies) {
        species = rng.item(possibleSpecies);
      }

      genConfig.species = species;

      let mob = generateCharacter(rng.randomString(16), genConfig);
      mob = applyMutators(rng.randomString(16), mob, template.characterMutators) as Character;
      mob.species = applyMutators(
        rng.randomString(16),
        mob.species,
        template.speciesMutators,
      ) as Species;
      mobs.push(mob);
    }

    return {
      name: template.name,
      mobs,
      tags: [...species.tags, ...archetype.tags],
    };
  }

  const nonSentientSpecies = nonSentient();
  const possibleSpecies = template.speciesTagFilter
    ? applyTagFilter(nonSentientSpecies, template.speciesTagFilter)
    : nonSentientSpecies;
  const species = rng.item(possibleSpecies);

  const count = rng.int(template.minCount, template.maxCount);

  const mobs = [];

  for (let i = 0; i < count; i++) {
    const genConfig = getDefaultCreatureGenerationConfig();
    genConfig.speciesOptions = [species];
    let mob = generateCreature(rng.randomString(16), genConfig);
    mob = applyMutators(rng.randomString(16), mob, template.creatureMutators);
    mob.species = applyMutators(
      rng.randomString(16),
      mob.species,
      template.speciesMutators,
    ) as Species;
    mobs.push(mob);
  }

  return {
    mobs,
    tags: [...species.tags],
  };
}
