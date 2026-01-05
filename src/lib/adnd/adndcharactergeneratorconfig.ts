import type ADNDClass from './adndclass.js';
import type ADNDRace from './adndrace.js';
import * as classes from './classes/classes.js';
import * as races from './races/races.js';
import { RNG } from '@ironarachne/rng';

export default class ADNDCharacterGeneratorConfig {
  allowedRaces: ADNDRace[];
  allowedClasses: ADNDClass[];
  rng: RNG;

  constructor(rng: RNG = new RNG(Date.now())) {
    this.allowedRaces = races.getAll();
    this.allowedClasses = classes.getAll();
    this.rng = rng;
  }
}
