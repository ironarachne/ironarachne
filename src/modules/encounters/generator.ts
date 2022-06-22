'use strict';

import Encounter from './encounter';
import EncounterGeneratorConfig from './generatorconfig';
import MobGroup from '../mobs/group';
import random from 'random';
import * as RND from '../random';
import * as PremadeConfigs from '../characters/premadeconfigs';
import * as _ from 'lodash';
import CharacterGenerator from '../characters/generator';
import type Mob from '../mobs/mob';

export default class EncounterGenerator {
  config: EncounterGeneratorConfig;

  generate(): Encounter {
    let sentientOptions = _.cloneDeep(this.config.sentientOptions);
    let creatureOptions = _.cloneDeep(this.config.creatureOptions);
    let mobGroups: MobGroup[] = [];
    let groupName = '';

    for (let i = 0; i < this.config.template.groupTemplates.length; i++) {
      let mobs: Mob[] = [];
      let t = this.config.template.groupTemplates[i];
      let amount = random.int(t.minNumber, t.maxNumber);

      let groupCreatureOptions = t.filter.apply(_.cloneDeep(creatureOptions));
      let groupSentientOptions = t.filter.apply(_.cloneDeep(sentientOptions));

      if (t.isSentient) {
        let species = RND.item(groupSentientOptions);
        let characters = [];
        let charGenConfig = PremadeConfigs.getFantasy();
        charGenConfig.speciesOptions = [species];
        let charGen = new CharacterGenerator(charGenConfig);

        for (let i = 0; i < amount; i++) {
          let archetype = RND.item(t.archetypes);
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

        groupName = t.name;
        mobs = characters;
      } else {
        let creatureType = RND.item(groupCreatureOptions);
        let creatures = [];

        for (let i = 0; i < amount; i++) {
          let creature = _.cloneDeep(creatureType);
          let attitude = RND.item(creatureType.behaviors);
          creature.summary = attitude;
          creatures.push(creature);
        }

        groupName = t.name;
        mobs = creatures;
      }
      mobGroups.push(new MobGroup(groupName, mobs));
    }

    return new Encounter(mobGroups);
  }
}
