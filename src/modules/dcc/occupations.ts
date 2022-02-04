'use strict';

import * as Dwarf from './occupations/dwarf';
import * as Elf from './occupations/elf';
import * as Halfling from './occupations/halfling';
import * as Human from './occupations/human';
import DCCOccupation from './occupation';

export function all(): DCCOccupation[] {
  let occupations = [];

  occupations = occupations.concat(Dwarf.all());
  occupations = occupations.concat(Elf.all());
  occupations = occupations.concat(Halfling.all());
  occupations = occupations.concat(Human.all());

  return occupations;
}

export function get(allowedOccupations: string[]): DCCOccupation[] {
  let occupations = [];

  if (allowedOccupations.includes('dwarf')) {
    occupations = occupations.concat(Dwarf.all());
  }

  if (allowedOccupations.includes('elf')) {
    occupations = occupations.concat(Elf.all());
  }

  if (allowedOccupations.includes('halfling')) {
    occupations = occupations.concat(Halfling.all());
  }

  if (allowedOccupations.includes('human')) {
    occupations = occupations.concat(Human.all());
  }

  return occupations;
}
