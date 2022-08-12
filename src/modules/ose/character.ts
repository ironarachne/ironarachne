'use strict';

import OSEAbility from './ability';
import OSEClass from './class';
import OSERace from './race';

export default class OSECharacter {
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: string;
  characterClass: OSEClass;
  race: OSERace;
  level: number;
  xp: number;
  alignment: string;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  deathSave: number;
  wandSave: number;
  paralysisSave: number;
  breathSave: number;
  spellSave: number;
  attackValues: number[];
  armorClass: number;
  languages: string[];
  abilities: OSEAbility[];

  constructor() {
    this.attackValues = [];
    this.languages = [];
    this.abilities = [];
    this.level = 1;
    this.xp = 0;

    for (let i = 0; i < 10; i++) {
      this.attackValues.push(19 - i);
    }
    this.armorClass = 9;
  }
}
