import type * as RNG from '@ironarachne/rng';
import type { DungeonTheme } from './index.js';
import * as Cult from './cult.js';
import * as Fortress from './fortress.js';
import * as MageLair from './mage_lair.js';
import * as Tomb from './tomb.js';

export function all(rng: RNG.RNG): DungeonTheme[] {
  let result = [];

  result.push(Cult.getTheme(rng));
  result.push(Fortress.getTheme(rng));
  result.push(MageLair.getTheme(rng));
  result.push(Tomb.getTheme(rng));

  return result;
}
