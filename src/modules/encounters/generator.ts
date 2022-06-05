'use strict';

import Encounter from './encounter';
import EncounterGeneratorConfig from './generatorconfig';
import MobGroup from './mobgroup';
import random from 'random';
import * as RND from '../random';
import * as PremadeConfigs from '../characters/premadeconfigs';
import * as _ from 'lodash';
import CharacterGenerator from '../characters/generator';
import type Mob from './mob';

export default class EncounterGenerator {
  config: EncounterGeneratorConfig;

  generate(): Encounter {
    let sentientOptions = _.cloneDeep(this.config.sentientOptions);
    let creatureOptions = _.cloneDeep(this.config.creatureOptions);
    let mobGroups: MobGroup[] = [];
    let groupName = '';

    let tempCreatures = [];

    for (let i = 0; i < creatureOptions.length; i++) {
      if (creatureOptions[i].environments.includes(this.config.environment)) {
        tempCreatures.push(creatureOptions[i]);
      }
    }

    creatureOptions = tempCreatures;

    for (let i = 0; i < this.config.template.groupTemplates.length; i++) {
      let mobs: Mob[] = [];
      let t = this.config.template.groupTemplates[i];
      let amount = random.int(t.minNumber, t.maxNumber);

      if (t.excludeTags.length > 0) {
        let tempSentient = [];
        let tempCreature = [];

        for (let j = 0; j < sentientOptions.length; j++) {
          let hasBannedTag = false;
          for (let i = 0; i < t.excludeTags.length; i++) {
            if (sentientOptions[j].tags.includes(t.excludeTags[i])) {
              hasBannedTag = true;
            }
          }
          if (!hasBannedTag) {
            tempSentient.push(sentientOptions[j]);
          }
        }

        for (let j = 0; j < creatureOptions.length; j++) {
          let hasBannedTag = false;
          for (let i = 0; i < t.excludeTags.length; i++) {
            if (creatureOptions[j].tags.includes(t.excludeTags[i])) {
              hasBannedTag = true;
            }
          }
          if (!hasBannedTag) {
            tempCreature.push(creatureOptions[j]);
          }
        }

        sentientOptions = tempSentient;
        creatureOptions = tempCreature;
      }

      // If we require certain tags for this template, exclude anything that doesn't include them
      if (t.requiredTags.length > 0) {
        let tempSentient = [];
        let tempCreature = [];
        let listOfSentients = [];
        let listOfCreatures = [];

        for (let i = 0; i < t.requiredTags.length; i++) {
          for (let j = 0; j < sentientOptions.length; j++) {
            if (
              sentientOptions[j].tags.includes(t.requiredTags[i]) &&
              !listOfSentients.includes(sentientOptions[j].name)
            ) {
              tempSentient.push(sentientOptions[j]);
              listOfSentients.push(sentientOptions[j].name);
            }
          }

          for (let j = 0; j < creatureOptions.length; j++) {
            if (
              creatureOptions[j].tags.includes(t.requiredTags[i]) &&
              !listOfCreatures.includes(creatureOptions[j].name)
            ) {
              tempCreature.push(creatureOptions[j]);
              listOfCreatures.push(creatureOptions[j].name);
            }
          }
        }

        sentientOptions = tempSentient;
        creatureOptions = tempCreature;
      }

      if (t.isSentient) {
        let species = RND.item(sentientOptions);
        let characters = [];
        let charGenConfig = PremadeConfigs.getFantasy();
        charGenConfig.speciesOptions = [species];
        let charGen = new CharacterGenerator(charGenConfig);

        let archetype = RND.item(t.archetypes);

        for (let i = 0; i < amount; i++) {
          let c = charGen.generate();
          c.archetype = archetype;
          c.summary = `${RND.item(c.personalityTraits).descriptor} ${c.species.adjective} ${
            c.archetype.name
          }`;
          characters.push(c);
        }

        groupName = t.name;
        mobs = characters;
      } else {
        let creatureType = RND.item(creatureOptions);
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
