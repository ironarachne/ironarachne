'use strict';

import Archetype from '../archetype';
import * as Cleric from './cleric';
import * as Cult from './cult';
import * as Mage from './mage';
import * as Martial from './martial';
import * as Undead from './undead';

export function all(): Archetype[] {
  let result = [];

  result = result.concat(Cleric.all());
  result = result.concat(Cult.all());
  result = result.concat(Mage.all());
  result = result.concat(Martial.all());
  result = result.concat(Undead.all());

  return result;
}
