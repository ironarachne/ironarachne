'use strict';

import Archetype from '../archetype';
import * as ItemGenerators from '../../equipment/generators';

export function all(): Archetype[] {
  return [
    new Archetype('cult acolyte', [], ['cult'], 1, [
      ItemGenerators.getItemGeneratorByTag('staff', 1),
      ItemGenerators.getItemGenerator('robe', 0),
    ]),
    new Archetype('cult priest', ['casts minor demonic spells'], ['cult'], 2, [
      ItemGenerators.getItemGeneratorByTag('staff', 1),
      ItemGenerators.getItemGenerator('robe', 1),
    ]),
    new Archetype('cult high priest', ['casts demonic spells'], ['cult'], 3, [
      ItemGenerators.getItemGeneratorByTag('staff', 3),
      ItemGenerators.getItemGeneratorByTag('knife', 2),
      ItemGenerators.getItemGenerator('robe', 3),
    ]),
  ];
}
