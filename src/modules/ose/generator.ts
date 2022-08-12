'use strict';

import OSECharacter from './character';
import OSECharacterGeneratorConfig from './generatorconfig';
import * as Dice from '../dice';
import * as RND from '../random';
import ClassRestriction from './classrestriction';
import OSEClass from './class';
import OSERace from './race';

export default class OSECharacterGenerator {
  config: OSECharacterGeneratorConfig;

  constructor() {
    this.config = new OSECharacterGeneratorConfig();
  }

  generate(): OSECharacter {
    let character = new OSECharacter();
    character.strength = Dice.roll('3d6');
    character.intelligence = Dice.roll('3d6');
    character.wisdom = Dice.roll('3d6');
    character.dexterity = Dice.roll('3d6');
    character.constitution = Dice.roll('3d6');
    character.charisma = Dice.roll('3d6');
    character.alignment = RND.item(['Law', 'Chaos', 'Neutrality']);

    let races = getAvailableRaces(character, this.config.races);
    character.race = RND.item(races);
    character.race.apply(character);

    let classes = getAvailableClasses(character.race, this.config.classes);

    console.debug(classes);

    character.characterClass = RND.item(classes);

    return character;
  }
}

function getAvailableClasses(race: OSERace, classes: OSEClass[]): OSEClass[] {
  let names = [];

  if (race.classRestrictions.length == 0) {
    return classes;
  }

  for (let res of race.classRestrictions) {
    names.push(res.className);
  }

  let options: OSEClass[] = classes.filter((option: OSEClass) => {
    return names.includes(option.name);
  });

  return options;
}

function getAvailableRaces(character: OSECharacter, races: OSERace[]): OSERace[] {
  let options: OSERace[] = [];

  for (let race of races) {
    if (race.requirements.length == 0) {
      options.push(race);
    } else {
      let conditionsMet = true;
      for (let i = 0; i < race.requirements.length; i++) {
        if (
          race.requirements[i].attribute == 'strength' &&
          character.strength < race.requirements[i].value
        ) {
          conditionsMet = false;
        }
        if (
          race.requirements[i].attribute == 'intelligence' &&
          character.intelligence < race.requirements[i].value
        ) {
          conditionsMet = false;
        }
        if (
          race.requirements[i].attribute == 'wisdom' &&
          character.wisdom < race.requirements[i].value
        ) {
          conditionsMet = false;
        }
        if (
          race.requirements[i].attribute == 'dexterity' &&
          character.dexterity < race.requirements[i].value
        ) {
          conditionsMet = false;
        }
        if (
          race.requirements[i].attribute == 'constitution' &&
          character.constitution < race.requirements[i].value
        ) {
          conditionsMet = false;
        }
        if (
          race.requirements[i].attribute == 'charisma' &&
          character.charisma < race.requirements[i].value
        ) {
          conditionsMet = false;
        }
      }
      if (conditionsMet) {
        options.push(race);
      }
    }
  }

  return options;
}
