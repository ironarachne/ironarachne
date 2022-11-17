'use strict';

import ADNDRace from '../adndrace';
import dwarf from './dwarf';
import elf from './elf';
import gnome from './gnome';
import halfelf from './halfelf';
import halfling from './halfling';
import human from './human';

export function getAll(): ADNDRace[] {
  return [dwarf, elf, gnome, halfelf, halfling, human];
}
