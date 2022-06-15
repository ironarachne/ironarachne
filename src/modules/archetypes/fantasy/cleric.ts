'use strict';

import Archetype from '../archetype';
import * as ItemGenerators from '../../equipment/generators';

export function all(): Archetype[] {
  return [
    new Archetype('cleric', ['casts divine spells'], ['cleric'], 2, [
      ItemGenerators.getItemGeneratorByTag('mace', 1),
      ItemGenerators.getItemGeneratorByTag('breastplate', 1),
    ]),
    new Archetype('priest', ['casts divine spells'], ['cleric'], 1, [
      ItemGenerators.getItemGeneratorByTag('staff', 1),
      ItemGenerators.getItemGenerator('robe', 1),
    ]),
    new Archetype('high priest', ['casts divine spells'], ['cleric'], 2, [
      ItemGenerators.getItemGeneratorByTag('staff', 2),
      ItemGenerators.getItemGenerator('robe', 2),
    ]),
  ];
}
