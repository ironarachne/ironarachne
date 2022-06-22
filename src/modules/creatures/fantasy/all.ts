'use strict';

import Creature from '../creature';
import * as Animals from './animals';
import * as Demonic from './demonic';
import * as Elementals from './elementals';
import * as Insects from './insects';
import * as Magical from './magical';
import * as Monstrosities from './monstrosities';
import * as Oozes from './oozes';
import * as Skeletal from '../../species/modifiers/skeleton';
import * as Undead from './undead';
import * as Vampire from '../../species/modifiers/vampire';
import * as Zombie from '../../species/modifiers/zombie';

export function all(): Creature[] {
  let result = [];

  result = result.concat(Animals.all());

  let undeadVariants = [];

  for (let i = 0; i < result.length; i++) {
    undeadVariants.push(Skeletal.modify(result[i]));
    undeadVariants.push(Vampire.modify(result[i]));
    undeadVariants.push(Zombie.modify(result[i]));
  }

  result = result.concat(undeadVariants);
  result = result.concat(Demonic.all());
  result = result.concat(Elementals.all());
  result = result.concat(Insects.all());
  result = result.concat(Magical.all());
  result = result.concat(Monstrosities.all());
  result = result.concat(Oozes.all());
  result = result.concat(Undead.all());

  return result;
}
