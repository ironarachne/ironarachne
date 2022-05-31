'use strict';

import Archetype from '../archetype';

export function all(): Archetype[] {
  return [
    new Archetype('martial artist', [], ['martial']),
    new Archetype('soldier', [], ['martial', 'military']),
    new Archetype('thug', [], ['criminal', 'martial']),
  ];
}
