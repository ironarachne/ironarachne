'use strict';

import type Species from '../species';
import * as _ from 'lodash';

export function modify(species: Species): Species {
  let result = _.cloneDeep(species);

  let modifierName = 'zombie';

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push('can only be killed by removing the head');

  let newTags = [];

  for (let i = 0; i < result.tags.length; i++) {
    if (result.tags[i] != 'sentient') {
      newTags.push(result.tags[i]);
    }
  }

  result.tags = newTags;

  result.abilities.push('can bite others to transform them into zombies');
  result.tags.push('zombie');
  result.tags.push('undead');
  result.threatLevel += 1;

  return result;
}
