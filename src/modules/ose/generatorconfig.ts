'use strict';

import OSEClass from './class';
import OSERace from './race';
import * as Races from './races';

export default class OSECharacterGeneratorConfig {
  useAscendingArmorClass: boolean;
  classes: OSEClass[];
  races: OSERace[];

  constructor() {
    this.useAscendingArmorClass = false;
    this.races = Races.all();
    this.classes = [];
  }
}
