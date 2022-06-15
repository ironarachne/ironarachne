'use strict';

import type Species from '../species';
import * as _ from 'lodash';

export function modify(species: Species): Species {
  let result = _.cloneDeep(species);

  let modifierName = 'skeletal';

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push('unharmed by piercing damage');
  result.tags.push('skeleton');
  result.tags.push('undead');
  result.threatLevel += 1;

  return result;
}
