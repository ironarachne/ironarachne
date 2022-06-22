'use strict';

import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default interface Mob {
  name: string;
  description: string;
  summary: string;
  statBlock: StatBlock;
  pluralName: string;
  abilities: string[];
  carried: Item[];
  creatureTypes: string[];
  environments: string[];
  threatLevel: number;
  tags: string[];
}
