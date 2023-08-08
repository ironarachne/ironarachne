"use strict";

import type Gender from "$lib/gender/gender.js";
import type * as MUN from "@ironarachne/made-up-names";
import type Item from "../equipment/item.js";
import type PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";

export default interface Species {
  name: string;
  description: string;
  summary: string;
  nameGeneratorSet: MUN.GeneratorSet;
  pluralName: string;
  adjective: string;
  commonality: number;
  carried: Item[];
  statBlock: StatBlock | null;
  environments: string[];
  creatureTypes: string[];
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  tags: string[];
  abilities: string[];
  threatLevel: number;
}
