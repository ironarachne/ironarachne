"use strict";

import type Item from "../equipment/item.js";
import type StatBlock from "../statblock.js";

export default interface Mob {
  name: string;
  description: string;
  summary: string;
  statBlock: StatBlock | null;
  pluralName: string;
  abilities: string[];
  carried: Item[];
  creatureTypes: string[];
  environments: string[];
  threatLevel: number;
  tags: string[];
}
