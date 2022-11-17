'use strict';

import ADNDClass from './adndclass';
import ADNDRace from './adndrace';
import * as classes from './classes/classes';
import * as races from './races/races';

export default class ADNDCharacterGeneratorConfig {
  allowedRaces: ADNDRace[];
  allowedClasses: ADNDClass[];

  constructor() {
    this.allowedRaces = races.getAll();
    this.allowedClasses = classes.getAll();
  }
}
