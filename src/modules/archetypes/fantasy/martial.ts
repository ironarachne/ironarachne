'use strict';

import Archetype from '../archetype';
import * as ItemGenerators from '../../equipment/generators';

export function all(): Archetype[] {
  return [
    new Archetype('archer', [], ['martial', 'military'], 1, [
      ItemGenerators.getItemGeneratorByTag('bow', 1),
    ]),
    new Archetype('captain', [], ['martial', 'military'], 1, [
      ItemGenerators.getItemGeneratorByTag('sword', 2),
      ItemGenerators.getItemGeneratorByTag('breastplate', 2),
      ItemGenerators.getItemGeneratorByTag('helmet', 2),
    ]),
    new Archetype('general', [], ['martial', 'military'], 1, [
      ItemGenerators.getItemGeneratorByTag('sword', 3),
      ItemGenerators.getItemGeneratorByTag('breastplate', 3),
      ItemGenerators.getItemGeneratorByTag('helmet', 3),
    ]),
    new Archetype('guard', [], ['martial', 'military'], 1, [
      ItemGenerators.getItemGeneratorByTag('spear', 1),
      ItemGenerators.getItemGeneratorByTag('body armor', 1),
    ]),
    new Archetype('hunter', [], ['martial', 'wilderness'], 1, []),
    new Archetype('martial artist', [], ['martial'], 1, []),
    new Archetype('martial arts master', [], ['martial'], 2, []),
    new Archetype('raider captain', [], ['criminal', 'martial'], 1, [
      ItemGenerators.getItemGeneratorByTag('sword', 1),
      ItemGenerators.getItemGeneratorByTag('breastplate', 1),
    ]),
    new Archetype('raider', [], ['criminal', 'martial'], 1, [
      ItemGenerators.getItemGeneratorByTag('weapon', 1),
      ItemGenerators.getItemGeneratorByTag('body armor', 1),
    ]),
    new Archetype('ranger', [], ['martial', 'wilderness'], 3, []),
    new Archetype('soldier', [], ['martial', 'military'], 1, [
      ItemGenerators.getItemGeneratorByTag('martial weapon', 1),
      ItemGenerators.getItemGeneratorByTag('body armor', 1),
    ]),
    new Archetype('thug', [], ['criminal', 'martial'], 1, [
      ItemGenerators.getItemGeneratorByTag('club', 1),
    ]),
    new Archetype('veteran hunter', [], ['martial', 'wilderness'], 2, [
      ItemGenerators.getItemGeneratorByTag('bow', 3),
    ]),
    new Archetype('veteran soldier', [], ['martial', 'military'], 2, [
      ItemGenerators.getItemGeneratorByTag('sword', 2),
      ItemGenerators.getItemGeneratorByTag('breastplate', 2),
    ]),
    new Archetype('warrior', [], ['martial', 'wilderness'], 1, [
      ItemGenerators.getItemGeneratorByTag('simple weapon', 1),
    ]),
  ];
}
