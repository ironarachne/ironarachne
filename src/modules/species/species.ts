'use strict';

import Gender from '../gender';
import GeneratorSet from '../names/generatorset';
import PhysicalTraitGenerator from '../physicaltraits/generator';

export default interface Species {
  name: string;
  nameGeneratorSet: GeneratorSet;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  tags: string[];
  abilities: string[];
}
