'use strict';

import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default interface Mob {
  name: string;
  decription: string;
  summary: string;
  statBlock: StatBlock;
  pluralName: string;
  abilities: string[];
  carried: Item[];
  threatLevel: number;
  tags: string[];
}
