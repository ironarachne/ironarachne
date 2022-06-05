'use strict';

import type StatBlock from '../statblock';

export default interface Mob {
  name: string;
  decription: string;
  summary: string;
  statBlock: StatBlock;
  pluralName: string;
  abilities: string[];
  tags: string[];
}
