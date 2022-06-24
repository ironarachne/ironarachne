'use strict';

import DungeonTheme from '../dungeontheme';

import * as Fortress from './fortress';
import * as Cult from './cult';
import * as Tomb from './tomb';
import * as MageLair from './magelair';

export function all(): DungeonTheme[] {
  let result = [];

  result.push(Cult.getTheme());
  result.push(Fortress.getTheme());
  result.push(MageLair.getTheme());
  result.push(Tomb.getTheme());

  return result;
}
