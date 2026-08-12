import type ADNDClass from './adndclass.js';
import type ADNDRace from './adndrace.js';
import * as classes from './classes/classes.js';
import * as races from './races/races.js';
import { RNG } from '@ironarachne/rng';

export default interface ADNDCharacterGeneratorConfig {
  allowedRaces: ADNDRace[];
  allowedClasses: ADNDClass[];
  rng: RNG;
  includeProficiencies: boolean;
  includeKits: boolean;
}

export function getDefaultConfig(rng: RNG = new RNG(Date.now())): ADNDCharacterGeneratorConfig {
  return {
    allowedRaces: races.getAll(),
    allowedClasses: classes.getAll(),
    rng,
    includeProficiencies: false,
    includeKits: false,
  };
}
