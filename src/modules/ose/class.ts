'use strict';

import OSEAbility from './ability';

export default class OSEClass {
  name: string;
  hitDice: string;
  skills: OSEAbility[];
  maximumLevel: number;

  constructor() {
    this.name = '';
    this.hitDice = '1d6';
    this.skills = [];
    this.maximumLevel = 1;
  }
}
