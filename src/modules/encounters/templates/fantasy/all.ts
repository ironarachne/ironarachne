'use strict';

import EncounterTemplate from '../../template';
import * as Bandits from './bandits';
import * as Cult from './cult';
import * as GenericDungeon from './genericdungeon';
import * as Magic from './magic';
import * as Martial from './martial';
import * as Undead from './undead';
import * as Wilderness from './wilderness';

export function all(includeUndead: boolean): EncounterTemplate[] {
  let result = [];

  result = result.concat(Bandits.all());
  result = result.concat(Cult.all());
  result = result.concat(GenericDungeon.all());
  result = result.concat(Magic.all());
  result = result.concat(Martial.all());
  result = result.concat(Wilderness.all());

  if (includeUndead) {
    result = result.concat(Undead.all());
  }

  return result;
}
