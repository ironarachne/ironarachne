'use strict';

import Creature from '../creature';
import * as Animals from './animals';
import * as Demonic from './demonic';
import * as Insects from './insects';
import * as Magical from './magical';
import * as Oozes from './oozes';
import * as Skeletal from '../../species/modifiers/skeleton';
import * as Vampire from '../../species/modifiers/vampire';
import * as Zombie from '../../species/modifiers/zombie';

export function all(): Creature[] {
  let result = [];

  result = result.concat(Animals.all());

  let undead = [];

  for (let i = 0; i < result.length; i++) {
    undead.push(Skeletal.modify(result[i]));
    undead.push(Vampire.modify(result[i]));
    undead.push(Zombie.modify(result[i]));
  }

  result = result.concat(undead);
  result = result.concat(Insects.all());
  result = result.concat(Magical.all());
  result = result.concat(Oozes.all());
  result = result.concat(Demonic.all());

  return result;
}
