"use strict";

import * as RND from "@ironarachne/rng";
import * as _ from "lodash";
import random from "random";
import Archetype from "../archetypes/archetype.js";
import CharacterGenerator from "../characters/generator.js";
import * as PremadeConfigs from "../characters/premadeconfigs.js";
import MobGroup from "../mobs/group.js";
import type Mob from "../mobs/mob.js";
import * as CommonSpecies from "../species/common.js";
import Encounter from "./encounter.js";
import EncounterGeneratorConfig from "./generatorconfig.js";

export default class EncounterGenerator {
  config: EncounterGeneratorConfig;

  generate(): Encounter {
    let mobGroups: MobGroup[] = [];

    if (this.config.template === null) {
      throw new Error("EncounterGenerator requires a template.");
    }

    for (let i = 0; i < this.config.template.groupTemplates.length; i++) {
      let mobs: Mob[] = [];
      let t = this.config.template.groupTemplates[i];
      let amount = random.int(t.minNumber, t.maxNumber);

      let options = [];
      let unfilteredOptions = [];

      if (t.isSentient) {
        unfilteredOptions = _.cloneDeep(this.config.sentientOptions);
      } else {
        unfilteredOptions = _.cloneDeep(this.config.creatureOptions);
      }

      let tags = t.filter.withAllTags.concat(t.filter.withAnyTag);
      if (tags.includes("undead")) {
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
      } else if (tags.includes("skeleton")) {
        let skeletonOptions = unfilteredOptions.concat(
          CommonSpecies.getSkeletonVariants(unfilteredOptions),
        );
        unfilteredOptions = unfilteredOptions.concat(skeletonOptions);
      } else if (tags.includes("vampire")) {
        let vampireOptions = unfilteredOptions.concat(
          CommonSpecies.getVampireVariants(unfilteredOptions),
        );
        unfilteredOptions = unfilteredOptions.concat(vampireOptions);
      } else if (tags.includes("zombie")) {
        let zombieOptions = unfilteredOptions.concat(
          CommonSpecies.getZombieVariants(unfilteredOptions),
        );
        unfilteredOptions = unfilteredOptions.concat(zombieOptions);
      }
      options = t.filter.apply(unfilteredOptions);

      if (options.length === 0) {
        console.error(`No options for filter`, t.filter);
        console.debug(`Used options`, unfilteredOptions);
      }

      if (t.isSentient) {
        mobs = generateSentientMobs(options, t.archetypes, amount);
      } else {
        mobs = generateCreatureMobs(options, amount);
      }

      mobGroups.push(new MobGroup(t.name, mobs));
    }

    return new Encounter(mobGroups);
  }
}

function generateCreatureMobs(creatureOptions: Mob[], amount: number): Mob[] {
  let creatureType = RND.item(creatureOptions);
  let creatures = [];

  for (let i = 0; i < amount; i++) {
    let creature = _.cloneDeep(creatureType);
    let attitude = RND.item(creatureType.behaviors);
    creature.summary = attitude;
    creatures.push(creature);
  }
  return creatures;
}

function generateSentientMobs(
  speciesOptions: Mob[],
  archetypes: Archetype[],
  amount: number,
): Mob[] {
  let species = RND.item(speciesOptions);
  let characters = [];
  let charGenConfig = PremadeConfigs.getFantasy();
  charGenConfig.speciesOptions = [species];
  let charGen = new CharacterGenerator(charGenConfig);

  for (let i = 0; i < amount; i++) {
    let archetype = RND.item(archetypes);
    let c = charGen.generate();
    c.archetype = archetype;
    c.abilities = c.abilities.concat(archetype.abilities);
    c.threatLevel += archetype.threatLevel;
    c.summary = `${c.gender.name} ${c.species.adjective} ${c.archetype.name}`;
    for (let m = 0; m < c.archetype.itemGenerators.length; m++) {
      c.carried.push(c.archetype.itemGenerators[m].generate());
    }
    characters.push(c);
  }

  return characters;
}
