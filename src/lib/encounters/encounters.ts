import * as RNG from '@ironarachne/rng';
import type Archetype from '$lib/archetypes/archetype.js';
import * as Characters from '$lib/characters/characters.js';
import * as PremadeConfigs from '$lib/characters/premade_configs.js';
import * as Creatures from '$lib/creatures/creatures.js';
import type Species from '$lib/species/species.js';
import type MobGroup from '$lib/mobs/group.js';
import type Mob from '$lib/mobs/mob.js';
import all from '$lib/species/all.js';
import * as CommonSpecies from '$lib/species/common.js';
import type Encounter from './encounter.js';
import type EncounterGeneratorConfig from './encounter_generator_config';

export function generate(config: EncounterGeneratorConfig): Encounter {
  let mobGroups: MobGroup[] = [];

  if (config.template === null) {
    throw new Error('EncounterGenerator requires a template.');
  }

  for (let i = 0; i < config.template.groupTemplates.length; i++) {
    let mobs: Mob[] = [];
    let t = config.template.groupTemplates[i];
    let amount = config.rng.int(t.minNumber, t.maxNumber);

    let options: Species[] = [];
    let unfilteredOptions: Species[] = [];

    if (t.isSentient) {
      unfilteredOptions = JSON.parse(JSON.stringify(config.sentientOptions));
    } else {
      unfilteredOptions = JSON.parse(JSON.stringify(config.creatureOptions));
    }

    let tags = t.filter.withAllTags.concat(t.filter.withAnyTag);
    if (tags.includes('undead')) {
      let skeletonOptions = unfilteredOptions.concat(
        CommonSpecies.getSkeletonVariants(unfilteredOptions),
      );
      let vampireOptions = unfilteredOptions.concat(
        CommonSpecies.getVampireVariants(unfilteredOptions),
      );
      let zombieOptions = unfilteredOptions.concat(
        CommonSpecies.getZombieVariants(unfilteredOptions),
      );
      unfilteredOptions = unfilteredOptions.concat(skeletonOptions);
      unfilteredOptions = unfilteredOptions.concat(vampireOptions);
      unfilteredOptions = unfilteredOptions.concat(zombieOptions);
    } else if (tags.includes('skeleton')) {
      let skeletonOptions = unfilteredOptions.concat(
        CommonSpecies.getSkeletonVariants(unfilteredOptions),
      );
      unfilteredOptions = unfilteredOptions.concat(skeletonOptions);
    } else if (tags.includes('vampire')) {
      let vampireOptions = unfilteredOptions.concat(
        CommonSpecies.getVampireVariants(unfilteredOptions),
      );
      unfilteredOptions = unfilteredOptions.concat(vampireOptions);
    } else if (tags.includes('zombie')) {
      let zombieOptions = unfilteredOptions.concat(
        CommonSpecies.getZombieVariants(unfilteredOptions),
      );
      unfilteredOptions = unfilteredOptions.concat(zombieOptions);
    }
    options = t.filter.apply(unfilteredOptions);

    if (options.length === 0) {
      console.error('No options for filter', t.filter);
      console.debug('Used options', unfilteredOptions);
    }

    if (t.isSentient) {
      mobs = generateSentientMobs(options, t.archetypes, amount, config.rng);
    } else {
      mobs = generateCreatureMobs(options, amount, config.rng);
    }

    mobGroups.push({ name: t.name, mobs });
  }

  let threatLevel = 0;

  for (let i = 0; i < mobGroups.length; i++) {
    let group = mobGroups[i];

    for (let j = 0; j < group.mobs.length; j++) {
      threatLevel += group.mobs[j].threatLevel;
    }
  }

  return { groups: mobGroups, totalThreatLevel: threatLevel };
}

function generateCreatureMobs(creatureOptions: Species[], amount: number, rng: RNG.RNG): Mob[] {
  let creatureType = rng.item(creatureOptions);
  let creatures: Mob[] = [];
  let config = Creatures.newCreatureGeneratorConfig(rng);

  for (let i = 0; i < amount; i++) {
    config.speciesOptions = [creatureType];
    let creature = Creatures.generate(config);
    creatures.push(creature);
  }
  return creatures;
}

function generateSentientMobs(
  speciesOptions: Species[],
  archetypes: Archetype[],
  amount: number,
  rng: RNG.RNG,
): Mob[] {
  let species = rng.item(speciesOptions);
  let characters = [];
  let charGenConfig = PremadeConfigs.getFantasy();
  charGenConfig.rng = rng;
  charGenConfig.speciesOptions = [species];

  for (let i = 0; i < amount; i++) {
    let c = Characters.generate(charGenConfig);
    c.archetype = rng.item(archetypes);
    c.abilities = c.abilities.concat(c.archetype.abilities);
    c.threatLevel = Characters.getTotalThreatLevel(c);
    c.summary = `${c.gender.name} ${c.species.adjective} ${c.archetype.name}`;
    for (let m = 0; m < c.archetype.itemGenerators.length; m++) {
      c.carried.push(c.archetype.itemGenerators[m].generate());
    }
    characters.push(c);
  }

  return characters;
}

export function getDefaultConfig(): EncounterGeneratorConfig {
  return {
    isHostile: true,
    environment: 'forest',
    template: null,
    sentientOptions: CommonSpecies.sentient(),
    creatureOptions: CommonSpecies.withoutTag('sentient', all),
    minThreatLevel: 1,
    maxThreatLevel: 4,
    rng: new RNG.RNG(Date.now().toString()),
  };
}
