'use strict';

import type Item from '../equipment/item';
import Gender from '../gender';
import GeneratorSet from '../names/generatorset';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import type StatBlock from '../statblock';

export default interface Species {
  name: string;
  description: string;
  summary: string;
  nameGeneratorSet: GeneratorSet;
  pluralName: string;
  adjective: string;
  commonality: number;
  carried: Item[];
  statBlock: StatBlock;
  environments: string[];
  creatureTypes: string[];
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  tags: string[];
  abilities: string[];
  threatLevel: number;
}
