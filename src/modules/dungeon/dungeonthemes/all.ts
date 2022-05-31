'use strict';

import DungeonTheme from '../dungeontheme';

import * as Evil from './evil';
import * as Ruins from './ruins';

export function all(): DungeonTheme[] {
  let result = [];

  result = result.concat(Evil.all());
  result = result.concat(Ruins.all());

  return result;
}
